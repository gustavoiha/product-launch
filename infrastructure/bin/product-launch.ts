import { App } from 'aws-cdk-lib';
import { ApiStack } from '../lib/api-stack';
import { AuthenticationStack } from '../lib/authentication-stack';
import { DataStack } from '../lib/data-stack';
import { DeploymentStack } from '../lib/deployment-stack';

interface DeploymentConfiguration {
  repositoryOwner: string;
  repositoryName: string;
  branchName: string;
  gitHubTokenSecretName: string;
}

const getRequiredValue = (value: string | undefined, name: string): string => {
  if (value) {
    return value;
  }

  throw new Error(`Missing ${name} for deployment pipeline configuration.`);
};

const resolveDeploymentConfiguration = (app: App): DeploymentConfiguration => {
  const repositoryOwner = getRequiredValue(
    app.node.tryGetContext('repositoryOwner') ?? process.env.PIPELINE_REPOSITORY_OWNER,
    'repositoryOwner'
  );
  const repositoryName = getRequiredValue(
    app.node.tryGetContext('repositoryName') ?? process.env.PIPELINE_REPOSITORY_NAME,
    'repositoryName'
  );
  const gitHubTokenSecretName = getRequiredValue(
    app.node.tryGetContext('gitHubTokenSecretName') ?? process.env.PIPELINE_GITHUB_TOKEN_SECRET_NAME,
    'gitHubTokenSecretName'
  );
  const branchName =
    app.node.tryGetContext('repositoryBranch') ?? process.env.PIPELINE_REPOSITORY_BRANCH ?? 'main';

  return {
    repositoryOwner,
    repositoryName,
    branchName,
    gitHubTokenSecretName
  };
};

export const buildApp = (deploymentConfiguration?: DeploymentConfiguration): App => {
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

  const resolvedDeploymentConfiguration =
    deploymentConfiguration ?? resolveDeploymentConfiguration(app);

  new DeploymentStack(app, 'ProductLaunchDeploymentStack', {
    env,
    repositoryOwner: resolvedDeploymentConfiguration.repositoryOwner,
    repositoryName: resolvedDeploymentConfiguration.repositoryName,
    branchName: resolvedDeploymentConfiguration.branchName,
    gitHubTokenSecretName: resolvedDeploymentConfiguration.gitHubTokenSecretName
  });

  return app;
};

if (require.main === module) {
  buildApp();
}
