import { App } from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack';
import { AuthenticationStack } from '../lib/authentication-stack';
import { DataStack } from '../lib/data-stack';
import { DeploymentStack } from '../lib/deployment-stack';

export const buildApp = (): App => {
  const app = new App();
  const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  };

  const authenticationStack = new AuthenticationStack(app, 'ProductLaunchAuthenticationStack', {
    env
  });
  const dataStack = new DataStack(app, 'ProductLaunchDataStack', {
    env
  });

  new ApiStack(app, 'ProductLaunchApiStack', {
    env,
    table: dataStack.waitlistTable,
    ownerIndexName: dataStack.ownerIndexName,
    slugIndexName: dataStack.slugIndexName,
    userPool: authenticationStack.userPool
  });

  new DeploymentStack(app, 'ProductLaunchDeploymentStack', {
    env
  });

  return app;
};

if (require.main === module) {
  buildApp();
}
