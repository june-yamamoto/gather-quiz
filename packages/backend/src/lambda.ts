/**
 * @file AWS Lambda handler for the Express application.
 *       This file wraps the Express app using @vendia/serverless-express
 *       to make it compatible with API Gateway and Lambda.
 * @module lambda
 */
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import serverless from '@vendia/serverless-express';
import { app } from './index';

/**
 * The cached serverless express instance.
 * Caching this instance across invocations improves performance.
 */
let serverlessExpressInstance: Handler;

/**
 * The main Lambda handler function.
 *
 * @param {APIGatewayProxyEvent} event - The event from API Gateway.
 * @param {Context} context - The Lambda execution context.
 * @returns {Promise<APIGatewayProxyResult>} The response to be sent to API Gateway.
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  // Initialize the serverless express instance on the first invocation
  if (!serverlessExpressInstance) {
    serverlessExpressInstance = serverless({ app });
  }

  // Pass the event and context to the Express app
  return serverlessExpressInstance(event, context, () => {});
};
