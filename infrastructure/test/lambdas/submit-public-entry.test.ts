import type { APIGatewayProxyEvent } from 'aws-lambda';
import { submitPublicEntry } from '../../lib/lambdas/submit-public-entry';

const baseEvent = {
  body: null,
  pathParameters: null,
  requestContext: {}
} as unknown as APIGatewayProxyEvent;

test('submitPublicEntry returns bad request when slug is missing', async () => {
  const response = await submitPublicEntry(baseEvent);

  expect(response.statusCode).toBe(400);
});
