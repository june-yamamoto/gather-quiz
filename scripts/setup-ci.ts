import { outputs, deployStack } from './aws.ts';
import { stack } from './config.ts';

const state = await outputs();
const artifacts = await outputs(`${stack}-artifacts`);
const ci = await deployStack(`${stack}-ci`, 'cloudformation/ci.yaml', {
  ApplicationStack: stack, ArtifactBucket: artifacts.ArtifactBucket, FrontendBucket: state.FrontendBucket,
});
console.log(ci.DeploymentRoleArn);
