import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, findWaitlistBySlug, mapWaitlistResponse } from './shared';

export const getWaitlistBySlug = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const slug = event.pathParameters?.waitlistId;
  if (!slug) {
    return buildResponse(400, { message: 'Waitlist slug is required.' });
  }

  const waitlist = await findWaitlistBySlug(slug);
  if (!waitlist) {
    return buildResponse(404, { message: 'Waitlist not found.' });
  }

  return buildResponse(200, mapWaitlistResponse(waitlist));
};
