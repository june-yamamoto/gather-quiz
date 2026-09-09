import { outputs, deployStack } from './aws.ts';
import { stack } from './config.ts';
import { ciProviderArn } from './ci-provider.ts';

const state = await outputs();
const artifacts = await outputs(`${stack}-artifacts`);
const ci = await deployStack(`${stack}-ci`, 'cloudformation/ci.yaml', {
  ApplicationStack: stack, ArtifactBucket: artifacts.ArtifactBucket, FrontendBucket: state.FrontendBucket,
  ExistingOidcProviderArn: await ciProviderArn(),
});
console.log(ci.DeploymentRoleArn);
