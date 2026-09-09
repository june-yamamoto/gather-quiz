import { CloudFormationClient, CreateStackCommand, UpdateStackCommand, DescribeStacksCommand, DescribeStackEventsCommand } from '@aws-sdk/client-cloudformation';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { setTimeout } from 'node:timers/promises';
import { readFile } from 'node:fs/promises';
import { region, stack } from './config.ts';

/** AWS実環境のOutputsを参照し、リソース名をスクリプトへ複製しない。 */
export async function outputs(name = stack, location = region): Promise<Record<string, string>> {
  const response = await new CloudFormationClient({ region: location }).send(new DescribeStacksCommand({ StackName: name }));
  return Object.fromEntries((response.Stacks?.[0].Outputs || []).map(value => [value.OutputKey!, value.OutputValue!]));
}

/** 秘密のパラメーターをログやコマンドラインへ出さず、IaCを適用する。 */
export async function deployStack(name: string, file: string, parameters: Record<string, string | undefined>, location = region, templateBody?: string) {
  const client = new CloudFormationClient({ region: location });
  const input = {
    StackName: name, TemplateBody: templateBody ?? await readFile(file, 'utf8'),
    Parameters: Object.entries(parameters).map(([ParameterKey, ParameterValue]) => ParameterValue === undefined ? { ParameterKey, UsePreviousValue: true } : { ParameterKey, ParameterValue }),
    Capabilities: ['CAPABILITY_NAMED_IAM' as const],
  };
  let exists = true;
  try { await client.send(new DescribeStacksCommand({ StackName: name })); }
  catch (error) {
    if (error instanceof Error && error.message.includes('does not exist')) exists = false;
    else throw error;
  }
  try {
    await client.send(exists ? new UpdateStackCommand(input) : new CreateStackCommand(input));
  } catch (error) {
    if (error instanceof Error && error.message.includes('No updates are to be performed')) return outputs(name, location);
    throw error;
  }
  const deadline = Date.now() + 60 * 60 * 1000;
  let lastStatus = '';
  while (Date.now() < deadline) {
    const response = await client.send(new DescribeStacksCommand({ StackName: name }));
    const status = response.Stacks?.[0].StackStatus || '';
    if (status !== lastStatus) { console.log(`${name}: ${status}`); lastStatus = status; }
    if (['CREATE_COMPLETE', 'UPDATE_COMPLETE'].includes(status)) return outputs(name, location);
    if (status.includes('FAILED') || status.includes('ROLLBACK')) {
      const events = await client.send(new DescribeStackEventsCommand({ StackName: name }));
      console.error(events.StackEvents?.filter(event => event.ResourceStatus?.includes('FAILED')).map(event => ({ resource: event.LogicalResourceId, reason: event.ResourceStatusReason })));
      throw new Error(`${name}: ${status}`);
    }
    await setTimeout(10000);
  }
  throw new Error(`${name}: timeout`);
}

/** IAMで保護された運用Lambdaを呼び、FunctionErrorを成功扱いしない。 */
export async function databaseOperation(payload: Record<string, unknown>, state?: Record<string, string>) {
  const resources = state || await outputs();
  const response = await new LambdaClient({ region }).send(new InvokeCommand({
    FunctionName: resources.MaintenanceFunction, Payload: Buffer.from(JSON.stringify(payload)),
  }));
  const result = JSON.parse(Buffer.from(response.Payload || []).toString());
  if (response.FunctionError) throw new Error(result.errorMessage || 'DB operation failed');
  return result;
}
