import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { ApiStack } from '../lib/api-stack';
import { AuthenticationStack } from '../lib/authentication-stack';
import { DataStack } from '../lib/data-stack';

test('api stack provisions API Gateway, Lambdas, and authorizer', () => {
  const app = new App();
  const authenticationStack = new AuthenticationStack(app, 'ApiAuthStackTest');
  const dataStack = new DataStack(app, 'ApiDataStackTest');

  const stack = new ApiStack(app, 'ApiStackTest', {
    table: dataStack.waitlistTable,
    ownerIndexName: dataStack.ownerIndexName,
    slugIndexName: dataStack.slugIndexName,
    userPool: authenticationStack.userPool
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
  template.resourceCountIs('AWS::Lambda::Function', 5);
  template.hasResourceProperties('AWS::ApiGateway::Authorizer', {
    Type: 'COGNITO_USER_POOLS'
  });
  template.hasResourceProperties('AWS::Lambda::Function', Match.objectLike({
    Runtime: Match.stringLikeRegexp('nodejs24')
  }));
  template.hasResourceProperties('AWS::ApiGateway::Method', Match.objectLike({
    HttpMethod: 'GET'
  }));
});
