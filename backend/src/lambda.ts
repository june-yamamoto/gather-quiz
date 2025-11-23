/**
 * @file AWS Lambda handler for the Express application.
 *       This file wraps the Express app using @vendia/serverless-express
 *       to make it compatible with API Gateway and Lambda.
 * @module lambda
 */
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import serverless from '@vendia/serverless-express';
import { app } from './index';
import { execSync } from 'child_process';

let serverlessExpressInstance: Handler;
let isDbMigrated = false; // Flag to ensure migration runs only once per container

async function setup(event: APIGatewayProxyEvent, context: Context) {
  // Run migration only on cold start
  if (!isDbMigrated) {
    console.log('Running database migration...');
    try {
      // Using execSync to wait for the migration to complete.
      // The path to the prisma CLI is relative to the package root in the Lambda environment.
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('Database migration successful.');
      isDbMigrated = true;
    } catch (error) {
      console.error('Database migration failed:', error);
      // Depending on the strategy, you might want to throw an error here
      // to fail the invocation, or allow it to continue.
      // For now, we'll log the error and continue.
    }
  }

  serverlessExpressInstance = serverless({ app });
  return serverlessExpressInstance(event, context, () => {});
}

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  if (serverlessExpressInstance) {
    return serverlessExpressInstance(event, context, () => {});
  }
  return setup(event, context);
};
