import { buildApp } from '../bin/product-launch';

const DEPLOYMENT_CONFIGURATION = {
  repositoryOwner: 'example-owner',
  repositoryName: 'example-repo',
  branchName: 'main',
  gitHubTokenSecretName: 'github-token-secret'
};

test('cdk app wires the expected stacks', () => {
  const app = buildApp(DEPLOYMENT_CONFIGURATION);
  const stackNames = app.node.children.map((child) => child.node.id);

  expect(stackNames).toEqual(
    expect.arrayContaining([
      'ProductLaunchAuthenticationStack',
      'ProductLaunchDataStack',
      'ProductLaunchApiStack',
      'ProductLaunchDeploymentStack'
    ])
  );
});
