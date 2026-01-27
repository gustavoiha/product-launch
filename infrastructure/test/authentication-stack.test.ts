import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AuthenticationStack } from '../lib/authentication-stack';

test('authentication stack provisions Cognito resources', () => {
  const app = new App();
  const stack = new AuthenticationStack(app, 'AuthenticationStackTest');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::Cognito::UserPool', 1);
  template.resourceCountIs('AWS::Cognito::UserPoolClient', 1);
});
