import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { DeploymentStack } from '../lib/deployment-stack';

test('deployment stack provisions frontend bucket, pipeline, and build project', () => {
  const app = new App();
  const stack = new DeploymentStack(app, 'DeploymentStackTest');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::S3::Bucket', 2);
  template.resourceCountIs('AWS::CodeBuild::Project', 1);
  template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);
  template.hasResourceProperties('AWS::S3::Bucket', {
    WebsiteConfiguration: Match.objectLike({
      IndexDocument: 'index.html',
      ErrorDocument: 'index.html'
    })
  });
});
