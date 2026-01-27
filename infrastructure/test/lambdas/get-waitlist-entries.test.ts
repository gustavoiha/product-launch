import type { APIGatewayProxyEvent } from 'aws-lambda';
import { getWaitlistEntries } from '../../lib/lambdas/get-waitlist-entries';

const baseEvent = {
  body: null,
  pathParameters: null,
  requestContext: {}
} as unknown as APIGatewayProxyEvent;

test('getWaitlistEntries returns unauthorized when no owner is present', async () => {
  const response = await getWaitlistEntries(baseEvent);

  expect(response.statusCode).toBe(401);
});
