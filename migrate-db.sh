#!/bin/bash
set -e

AWS_REGION="ap-northeast-1"
FUNCTION_NAME="gather-quiz-backend-lambda-dev-BackendLambda"

echo "Fetching configuration..."
SECRET_ID=$(aws lambda get-function-configuration --function-name $FUNCTION_NAME --region $AWS_REGION --query 'Environment.Variables.SECRET_ID' --output text)

if [ -z "$SECRET_ID" ] || [ "$SECRET_ID" == "None" ]; then
  echo "Error: SECRET_ID not found in Lambda configuration."
  exit 1
fi

echo "Fetching secret..."
SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id $SECRET_ID --region $AWS_REGION --query SecretString --output text)

if [ -z "$SECRET_JSON" ]; then
  echo "Error: Failed to fetch secret JSON."
  exit 1
fi

# Create a temp JS file to parse JSON
cat <<'EOF' > parse_secret.js
try {
  const secret = JSON.parse(process.argv[2]);
  const url = `postgresql://${secret.username}:${secret.password}@${secret.host}:${secret.port}/${secret.dbname}`;
  console.log(url);
} catch (e) {
  console.error("Error parsing JSON:", e);
  process.exit(1);
}
EOF

DATABASE_URL=$(node parse_secret.js "$SECRET_JSON")
rm parse_secret.js

echo "Running Prisma migration..."
cd backend

# Create a temporary schema for PostgreSQL
sed 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma > prisma/schema.temp.prisma

export DATABASE_URL="$DATABASE_URL"
# Use the temp schema
npx prisma db push --schema=prisma/schema.temp.prisma

# Clean up
rm prisma/schema.temp.prisma

echo "Migration complete."
