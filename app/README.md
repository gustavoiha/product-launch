# Product Launch App

The `app/` package contains the Vue-based frontend for Product Launch. Use the instructions below to build, preview, and deploy the frontend bundle.

## Local development

1. `npm install`
2. `npm run dev`

## Build

1. `npm run build`
2. `npm run preview`

## Deploy to the frontend hosting bucket

The deployment stack provisions the S3 bucket used to host the frontend. Capture the bucket name from the CDK outputs and export it locally before deploying.

```bash
export FRONTEND_BUCKET_NAME="your-frontend-bucket-name"
./scripts/deploy-frontend.sh
```

The script installs dependencies, builds the app, and syncs the `dist/` folder to the hosting bucket. Ensure the AWS CLI is configured with credentials that can write to the bucket.
