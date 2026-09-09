import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { SSMClient, GetParameterCommand, PutParameterCommand } from '@aws-sdk/client-ssm';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { LambdaClient, GetFunctionCommand, UpdateFunctionCodeCommand, waitUntilFunctionUpdatedV2 } from '@aws-sdk/client-lambda';
import { outputs, deployStack, databaseOperation } from './aws.ts';
import { environment, region, stack, domain, zoneId } from './config.ts';
import { frontendAuthHash } from './frontend-auth.ts';
import { ciProviderArn } from './ci-provider.ts';

const root = resolve(import.meta.dirname, '..');
const s3 = new S3Client({ region });
const ssm = new SSMClient({ region });
const measurements: Record<string, unknown>[] = [];

/** 所要時間を残し、初回構築と通常更新を分けて比較する。 */
async function measure<T>(phase: string, run: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await run();
  const measurement = { phase, seconds: Number(((performance.now() - start) / 1000).toFixed(2)) };
  measurements.push(measurement);
  console.log(JSON.stringify(measurement));
  return result;
}

/** 標準SecureStringを初回だけ生成し、再デプロイでDBパスワードを変えない。 */
async function password(kind: string): Promise<string> {
  const Name = `/${stack}/${kind}-password`;
  try {
    const response = await ssm.send(new GetParameterCommand({ Name, WithDecryption: true }));
    return response.Parameter!.Value!;
  } catch (error) {
    if (!(error instanceof Error) || error.name !== 'ParameterNotFound') throw error;
  }
  const value = randomBytes(32).toString('hex');
  await ssm.send(new PutParameterCommand({ Name, Value: value, Type: 'SecureString', Tier: 'Standard', Overwrite: false }));
  return value;
}

/** CIでは検証済み成果物を再利用する。 */
async function artifact() {
  if (process.argv.includes('--skip-build')) {
    const bytes = await readFile(join(root, 'backend/build/function.zip'));
    return { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), file: join(root, 'backend/build/function.zip') };
  }
  const { buildBackend } = await import('./build-backend.ts');
  return buildBackend();
}

/** ハッシュ付きオブジェクトは一度だけ転送する。 */
async function upload(bucket: string, key: string, body: Buffer, contentType?: string, cacheControl?: string) {
  const digest = createHash('sha256').update(body).digest('hex');
  try {
    const existing = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    if (existing.Metadata?.sha256 === digest && existing.CacheControl === cacheControl) return false;
  } catch (error) {
    if (!(error instanceof Error) || !['NotFound', 'NoSuchKey'].includes(error.name)) throw error;
  }
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType, CacheControl: cacheControl, Metadata: { sha256: digest } }));
  return true;
}

/** 静的ファイルを先に公開し、HTMLを最後に更新する。旧アセットは保持する。 */
async function frontend(state: Record<string, string>) {
  if (!process.argv.includes('--skip-build')) {
    await measure('frontend-build', async () => {
      execFileSync(process.execPath, [join(root, 'frontend/node_modules/typescript/bin/tsc'), '-b'], { cwd: join(root, 'frontend'), stdio: 'inherit' });
      execFileSync(process.execPath, [join(root, 'frontend/node_modules/vite/bin/vite.js'), 'build'], { cwd: join(root, 'frontend'), stdio: 'inherit', env: { ...process.env, VITE_API_BASE_URL: '/api' } });
    });
  }
  const files: string[] = [];
  /** Vite出力だけを配布対象にする。 */
  async function list(directory: string, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const key = `${prefix}${entry.name}`;
      if (entry.isDirectory()) await list(join(directory, entry.name), `${key}/`);
      else files.push(key);
    }
  }
  await list(join(root, 'frontend/dist'));
  const types: Record<string, string> = { html: 'text/html; charset=utf-8', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', png: 'image/png', ico: 'image/x-icon', json: 'application/json' };
  let uploaded = 0;
  /** HTMLは常に再検証し、ハッシュ付きアセットは長期キャッシュする。 */
  async function publish(key: string) {
    const type = types[key.split('.').pop()!] || 'application/octet-stream';
    const cache = key.startsWith('assets/') ? 'public,max-age=31536000,immutable' : 'no-cache,max-age=0,must-revalidate';
    if (await upload(state.FrontendBucket, key, await readFile(join(root, 'frontend/dist', key)), type, cache)) uploaded++;
  }
  await measure('frontend-upload', async () => {
    for (const file of files.filter(file => file !== 'index.html')) await publish(file);
    await publish('index.html');
  });
  console.log(JSON.stringify({ phase: 'frontend-files', uploaded, total: files.length }));
}

/** アプリ更新はコードのみ更新し、環境設定の更新はallに限定する。 */
async function main() {
  const mode = process.argv[2];
  if (!['all', 'backend', 'frontend'].includes(mode)) throw new Error('Expected all, backend or frontend');
  let state: Record<string, string>;
  if (mode === 'all') {
    const bootstrap = await measure('bootstrap', () => deployStack(`${stack}-artifacts`, join(root, 'cloudformation/bootstrap.yaml'), {}));
    const certificate = await measure('certificate', () => deployStack(`${stack}-certificate`, join(root, 'cloudformation/certificate.yaml'), { DomainName: domain, HostedZoneId: zoneId }, 'us-east-1'));
    const built = await measure('backend-package', artifact);
    const key = `backend/${built.sha256}.zip`;
    await measure('backend-upload', () => upload(bootstrap.ArtifactBucket, key, readFileSyncBuffer(built.file)));
    state = await measure('infrastructure', async () => deployStack(stack, join(root, 'cloudformation/application.yaml'), {
      ArtifactBucket: bootstrap.ArtifactBucket, CodeKey: key, DbPassword: await password('admin'), AppPassword: await password('app'),
      DomainName: domain, HostedZoneId: zoneId, CertificateArn: certificate.CertificateArn,
      FrontendAuthHash: await frontendAuthHash(),
    }));
    await measure('database-schema', () => databaseOperation({ action: 'migrate' }, state));
    const ci = await measure('ci-role', async () => deployStack(`${stack}-ci`, join(root, 'cloudformation/ci.yaml'), {
      ApplicationStack: stack, ArtifactBucket: bootstrap.ArtifactBucket, FrontendBucket: state.FrontendBucket,
      ExistingOidcProviderArn: await ciProviderArn(),
    }));
    console.log(`GitHub variable ${environment === 'prod' ? 'AWS_DEPLOY_PROD_ROLE_ARN' : 'AWS_DEPLOY_ROLE_ARN'}: ${ci.DeploymentRoleArn}`);
  } else {
    state = await outputs();
    if (mode === 'backend') {
      const built = await measure('backend-package', artifact);
      const bootstrap = await outputs(`${stack}-artifacts`);
      const key = `backend/${built.sha256}.zip`;
      await measure('backend-upload', () => upload(bootstrap.ArtifactBucket, key, readFileSyncBuffer(built.file)));
      const client = new LambdaClient({ region });
      await measure('lambda-update', async () => {
        for (const name of [state.MaintenanceFunction, state.BackendFunction]) {
          const current = await client.send(new GetFunctionCommand({ FunctionName: name }));
          if (current.Configuration?.CodeSha256 === Buffer.from(built.sha256, 'hex').toString('base64')) continue;
          await client.send(new UpdateFunctionCodeCommand({ FunctionName: name, S3Bucket: bootstrap.ArtifactBucket, S3Key: key, RevisionId: current.Configuration?.RevisionId }));
          await waitUntilFunctionUpdatedV2({ client, maxWaitTime: 300, minDelay: 1, maxDelay: 5 }, { FunctionName: name });
          if (name === state.MaintenanceFunction) {
            try { await databaseOperation({ action: 'migrate' }, state); }
            catch (error) {
              const previousKey = `backend/${Buffer.from(current.Configuration!.CodeSha256!, 'base64').toString('hex')}.zip`;
              await client.send(new UpdateFunctionCodeCommand({ FunctionName: name, S3Bucket: bootstrap.ArtifactBucket, S3Key: previousKey }));
              await waitUntilFunctionUpdatedV2({ client, maxWaitTime: 300, minDelay: 1, maxDelay: 5 }, { FunctionName: name });
              throw error;
            }
          }
        }
      });
      await measure('database-schema', () => databaseOperation({ action: 'migrate' }, state));
    }
  }
  if (mode !== 'backend') await frontend(state);
  await mkdir(join(root, 'artifacts'), { recursive: true });
  await writeFile(join(root, 'artifacts', `${mode}-${Date.now()}.json`), JSON.stringify({ at: new Date().toISOString(), mode, url: state.Url, measurements }, null, 2));
  console.log(`Deployed: ${state.Url}`);
}

import { readFileSync as readFileSyncBuffer } from 'node:fs';
main().catch(error => { console.error(error.message); process.exitCode = 1; });
