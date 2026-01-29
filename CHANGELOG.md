# Changelog

## Unreleased

- Integrated Amplify configuration, API client layer, and store-driven data fetching for Cognito and API Gateway.
- Added AWS CDK infrastructure stacks for Cognito authentication, DynamoDB storage, and API Gateway Lambda endpoints.
- Refactored CDK API lambdas into NodejsFunction handlers with dedicated source files and shared utilities.
- Added a deployment stack with a frontend hosting bucket, CodePipeline/CodeBuild deployment flow, and local deployment script documentation.
- Updated the deployment stack to read pipeline configuration from AWS SSM Parameter Store, including a SecureString GitHub token.
