#!/usr/bin/env bash
set -euo pipefail

if [ -z "${FRONTEND_BUCKET_NAME:-}" ]; then
  echo "FRONTEND_BUCKET_NAME is required to deploy the frontend." >&2
  exit 1
fi

SCRIPT_DIRECTORY="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="${SCRIPT_DIRECTORY}/.."

cd "${APP_ROOT}"
npm ci
npm run build
aws s3 sync dist "s3://${FRONTEND_BUCKET_NAME}" --delete
