/**
 * @file AWS Lambda handler for the Express application.
 *       This file wraps the Express app using @vendia/serverless-express
 *       to make it compatible with API Gateway and Lambda.
 * @module lambda
 */
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import serverless from '@vendia/serverless-express';
import { app } from './index';
import { initPrisma } from './db';

let serverlessExpressInstance: Handler;

async function setup(event: APIGatewayProxyEvent, context: Context) {
  // Initialize Prisma Client (retrieve secrets if necessary)
  await initPrisma();

  serverlessExpressInstance = serverless({ app });
  return serverlessExpressInstance(event, context, () => {});
}

// CommonJS形式でハンドラーをエクスポート
exports.handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  // コールドスタート対策: インスタンスがあれば再利用
  if (serverlessExpressInstance) {
    return serverlessExpressInstance(event, context, () => {});
  }
  return setup(event, context);
};
