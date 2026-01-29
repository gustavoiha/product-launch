# product-launch

Manage waitlist and beta launches for a new product.

## Overview

The user-facing application lets founders log in, register a product, build a custom waitlist form, and publish a shareable URL for signups. It also includes a public waitlist page and an internal dashboard for reviewing submissions.

## Folder structure

`app/` contains the user-facing web application. It's where users create their product launches and manage their wishlists.
`management-app/` contains a web application for managers of this application. It's where developers with a manager permission can take action on the platform's usage.
`infrastructure/` contains the AWS CDK scripts to deploy the application on the AWS cloud.

## Getting started

1. `cd app`
2. `npm install`
3. `npm run dev`

## Frontend build and deploy

The `app/` package contains the Vue-based frontend for Product Launch. Use the commands below to build, preview, and deploy the frontend bundle.

### Build

1. `npm run build`
2. `npm run preview`

### Deploy to the frontend hosting bucket

The deployment stack provisions the S3 bucket used to host the frontend. Capture the bucket name from the CDK outputs and export it locally before deploying.

```bash
export FRONTEND_BUCKET_NAME="your-frontend-bucket-name"
./scripts/deploy-frontend.sh
```

The script installs dependencies, builds the app, and syncs the `dist/` folder to the hosting bucket. Ensure the AWS CLI is configured with credentials that can write to the bucket.

## Environment configuration

Set the following variables in an `.env` file inside `app/` to connect to AWS Cognito and API Gateway:

* `VITE_AWS_REGION`
* `VITE_USER_POOL_ID`
* `VITE_USER_POOL_CLIENT_ID`
* `VITE_API_GATEWAY_URL`
* `VITE_API_GATEWAY_NAME`

## Infrastructure deployment

The serverless backend lives in `infrastructure/` and is managed with AWS CDK. It provisions a DynamoDB table, API Gateway + Lambda REST endpoints, and Cognito authentication.
The deployment stack provisions the frontend hosting bucket along with a CodePipeline + CodeBuild workflow that builds and deploys the `app` bundle.

1. `cd infrastructure`
2. `npm install`
3. `npm run test`
4. `npm run typecheck`
5. `npm run lint`
6. `npx cdk bootstrap`
7. `npx cdk deploy`

Use the CDK outputs for `ApiGatewayUrl`, `ApiGatewayName`, `UserPoolId`, and `UserPoolClientId` to populate the frontend `.env` values listed above.
Use the `FrontendBucketName` output when deploying the frontend locally from `app/scripts/deploy-frontend.sh`.
Set the deployment stack configuration via CDK context values (`repositoryOwner`, `repositoryName`, `repositoryBranch`, `gitHubTokenSecretName`) or the environment variables `PIPELINE_REPOSITORY_OWNER`, `PIPELINE_REPOSITORY_NAME`, `PIPELINE_REPOSITORY_BRANCH`, and `PIPELINE_GITHUB_TOKEN_SECRET_NAME`.

## Verification

* `npm run test`
* `npm run typecheck`
* `npm run lint`
