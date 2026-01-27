import type { APIGatewayProxyEvent } from 'aws-lambda';
import { updateWaitlist } from '../../lib/lambdas/update-waitlist';

const baseEvent = {
  body: null,
  pathParameters: null,
  requestContext: {}
} as unknown as APIGatewayProxyEvent;

test('updateWaitlist returns unauthorized when no owner is present', async () => {
  const response = await updateWaitlist(baseEvent);

  expect(response.statusCode).toBe(401);
});
