import { createHash, randomBytes } from 'node:crypto';
import { SSMClient, GetParameterCommand, PutParameterCommand } from '@aws-sdk/client-ssm';
import { environment, region, stack } from './config.ts';

export const frontendPasswordParameter = `/${stack}/frontend-password`;

/** パスワードをログやテンプレートへ出さず、IAMで取得できるSSMに保持する。 */
export async function frontendAuthorization(create = false): Promise<string> {
  if (environment === 'prod') return '';
  const client = new SSMClient({ region });
  let password: string | undefined;
  try {
    password = (await client.send(new GetParameterCommand({ Name: frontendPasswordParameter, WithDecryption: true }))).Parameter?.Value;
  } catch (error) {
    if (!(error instanceof Error) || error.name !== 'ParameterNotFound' || !create) throw error;
    password = randomBytes(32).toString('hex');
    await client.send(new PutParameterCommand({ Name: frontendPasswordParameter, Value: password, Type: 'SecureString', Tier: 'Standard', Overwrite: false }));
  }
  if (!password) throw new Error('Frontend password is missing');
  return `Basic ${Buffer.from(`dev:${password}`).toString('base64')}`;
}

/** エッジには高エントロピー認証情報のハッシュだけを配布する。 */
export async function frontendAuthHash(): Promise<string> {
  const authorization = await frontendAuthorization(true);
  return authorization ? createHash('sha256').update(authorization).digest('hex') : '';
}
