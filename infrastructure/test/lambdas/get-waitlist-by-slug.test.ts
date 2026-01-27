import type { APIGatewayProxyEvent } from 'aws-lambda';
import { getWaitlistBySlug } from '../../lib/lambdas/get-waitlist-by-slug';

const baseEvent = {
  body: null,
  pathParameters: null,
  requestContext: {}
} as unknown as APIGatewayProxyEvent;

test('getWaitlistBySlug returns bad request when slug is missing', async () => {
  const response = await getWaitlistBySlug(baseEvent);

  expect(response.statusCode).toBe(400);
});
