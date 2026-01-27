import type { APIGatewayProxyEvent } from 'aws-lambda';
import { getOwnerWaitlist } from '../../lib/lambdas/get-owner-waitlist';

const baseEvent = {
  body: null,
  pathParameters: null,
  requestContext: {}
} as unknown as APIGatewayProxyEvent;

test('getOwnerWaitlist returns unauthorized when no owner is present', async () => {
  const response = await getOwnerWaitlist(baseEvent);

  expect(response.statusCode).toBe(401);
});
