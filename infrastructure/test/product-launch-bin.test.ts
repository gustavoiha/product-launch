import { buildApp } from '../bin/product-launch';

test('cdk app wires the expected stacks', () => {
  const app = buildApp();
  const stackNames = app.node.children.map((child) => child.node.id);

  expect(stackNames).toEqual(
    expect.arrayContaining([
      'ProductLaunchAuthenticationStack',
      'ProductLaunchDataStack',
      'ProductLaunchApiStack'
    ])
  );
});
