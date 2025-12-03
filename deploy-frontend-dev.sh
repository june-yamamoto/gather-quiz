#!/bin/bash
set -e

# Configuration
BUCKET_NAME="gather-quiz-dev-v4-frontend-bucket"
DISTRIBUTION_ID="E6WB2EX8DG6PE"

echo "Building frontend..."
# ルートディレクトリで実行されている前提
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

echo "Deploying to S3 ($BUCKET_NAME)..."
aws s3 sync frontend/dist s3://$BUCKET_NAME --delete

echo "Invalidating CloudFront cache ($DISTRIBUTION_ID)..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo "Frontend deployment complete!"
