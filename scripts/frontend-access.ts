import { readFile } from 'node:fs/promises';
import { CloudFormationClient, GetTemplateCommand, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { parseDocument } from 'yaml';
import { deployStack } from './aws.ts';
import { frontendAuthHash } from './frontend-auth.ts';
import { environment, region, stack } from './config.ts';

/** 現行テンプレートの配信関数だけを更新し、DBやLambdaコードを変更しない。 */
async function main() {
  if (environment !== 'dev') throw new Error('Frontend access restriction is for dev only');
  const client = new CloudFormationClient({ region });
  const current = await client.send(new GetTemplateCommand({ StackName: stack, TemplateStage: 'Original' }));
  if (!current.TemplateBody) throw new Error('Current template is missing');
  const live = parseDocument(current.TemplateBody, { logLevel: 'silent' });
  const local = parseDocument(await readFile('cloudformation/application.yaml', 'utf8'), { logLevel: 'silent' });
  for (const path of [['Parameters', 'FrontendAuthHash'], ['Resources', 'SpaRewrite']]) {
    live.setIn(path, local.getIn(path, true));
  }
  const state = await client.send(new DescribeStacksCommand({ StackName: stack }));
  const parameters: Record<string, string | undefined> = Object.fromEntries((state.Stacks?.[0].Parameters || []).map(parameter => [parameter.ParameterKey!, undefined]));
  parameters.FrontendAuthHash = await frontendAuthHash();
  await deployStack(stack, '', parameters, region, live.toString());
  console.log('Frontend access restriction deployed');
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
