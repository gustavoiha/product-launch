import { CfnOutput, SecretValue, Stack, type StackProps } from 'aws-cdk-lib';
import { BuildSpec, LinuxBuildImage, Project } from 'aws-cdk-lib/aws-codebuild';
import { Pipeline, Artifact } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, GitHubSourceAction, GitHubTrigger } from 'aws-cdk-lib/aws-codepipeline-actions';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

const createFrontendBuildSpec = (): BuildSpec => {
  return BuildSpec.fromObject({
    version: '0.2',
    phases: {
      install: {
        commands: ['cd app', 'npm ci']
      },
      build: {
        commands: ['npm run build']
      },
      post_build: {
        commands: ['aws s3 sync dist s3://$FRONTEND_BUCKET_NAME --delete']
      }
    }
  });
};

const REPOSITORY_OWNER_PARAMETER_NAME = 'PIPELINE_REPOSITORY_OWNER';
const REPOSITORY_NAME_PARAMETER_NAME = 'PIPELINE_REPOSITORY_NAME';
const REPOSITORY_BRANCH_PARAMETER_NAME = 'PIPELINE_REPOSITORY_BRANCH';
const GITHUB_TOKEN_PARAMETER_NAME = 'PIPELINE_GITHUB_TOKEN_SECRET_NAME';

export class DeploymentStack extends Stack {
  public readonly frontendBucket: Bucket;

  public constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const repositoryOwner = StringParameter.valueForStringParameter(this, REPOSITORY_OWNER_PARAMETER_NAME);
    const repositoryName = StringParameter.valueForStringParameter(this, REPOSITORY_NAME_PARAMETER_NAME);
    const branchName = StringParameter.valueForStringParameter(this, REPOSITORY_BRANCH_PARAMETER_NAME);
    const gitHubToken = SecretValue.ssmSecure(GITHUB_TOKEN_PARAMETER_NAME);

    this.frontendBucket = new Bucket(this, 'FrontendHostingBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS
    });

    const sourceOutput = new Artifact();

    const buildProject = new Project(this, 'FrontendBuildProject', {
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0
      },
      environmentVariables: {
        FRONTEND_BUCKET_NAME: {
          value: this.frontendBucket.bucketName
        }
      },
      buildSpec: createFrontendBuildSpec()
    });

    this.frontendBucket.grantReadWrite(buildProject);

    const pipeline = new Pipeline(this, 'FrontendDeploymentPipeline', {
      pipelineName: 'product-launch-frontend-deployment'
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          actionName: 'GitHubSource',
          owner: repositoryOwner,
          repo: repositoryName,
          branch: branchName,
          oauthToken: gitHubToken,
          output: sourceOutput,
          trigger: GitHubTrigger.WEBHOOK
        })
      ]
    });

    pipeline.addStage({
      stageName: 'BuildDeploy',
      actions: [
        new CodeBuildAction({
          actionName: 'BuildAndDeploy',
          project: buildProject,
          input: sourceOutput
        })
      ]
    });

    new CfnOutput(this, 'FrontendBucketName', {
      value: this.frontendBucket.bucketName
    });

    new CfnOutput(this, 'FrontendBucketWebsiteUrl', {
      value: this.frontendBucket.bucketWebsiteUrl
    });
  }
}
