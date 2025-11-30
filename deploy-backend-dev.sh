#!/bin/bash
set -e

# Configuration
AWS_REGION="ap-northeast-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO_NAME="gather-quiz-backend-lambda-dev"
FUNCTION_NAME="gather-quiz-backend-lambda-dev-BackendLambda"
IMAGE_TAG="latest"
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"

echo "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "Building Docker image..."
# backendディレクトリでdocker buildを実行
cd backend
# Dockerfileはbackendディレクトリ直下にある
docker build --platform linux/amd64 -t $ECR_REPO_NAME:$IMAGE_TAG .
docker tag $ECR_REPO_NAME:$IMAGE_TAG $ECR_URI:$IMAGE_TAG

echo "Pushing Docker image to ECR..."
docker push $ECR_URI:$IMAGE_TAG

echo "Updating Lambda function..."
aws lambda update-function-code --function-name $FUNCTION_NAME --image-uri $ECR_URI:$IMAGE_TAG --region $AWS_REGION

# Wait for update to complete
echo "Waiting for function update to complete..."
aws lambda wait function-updated --function-name $FUNCTION_NAME --region $AWS_REGION

echo "Updating Lambda configuration..."
# Get existing variables
SECRET_ID=$(aws lambda get-function-configuration --function-name $FUNCTION_NAME --region $AWS_REGION --query 'Environment.Variables.SECRET_ID' --output text)
IMAGE_UPLOAD_BUCKET_NAME="gather-quiz-dev-image-uploads"

aws lambda update-function-configuration \
  --function-name $FUNCTION_NAME \
  --region $AWS_REGION \
  --environment "Variables={SECRET_ID=$SECRET_ID,IMAGE_UPLOAD_BUCKET_NAME=$IMAGE_UPLOAD_BUCKET_NAME}"

echo "Backend deployment complete!"
