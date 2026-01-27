import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, fetchWaitlistEntries, getOwnerId } from './shared';

export const getWaitlistEntries = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const ownerId = getOwnerId(event);
  if (!ownerId) {
    return buildResponse(401, { message: 'Unauthorized' });
  }

  const waitlistId = event.pathParameters?.waitlistId;
  if (!waitlistId) {
    return buildResponse(400, { message: 'Waitlist id is required.' });
  }

  const entries = await fetchWaitlistEntries(waitlistId);

  return buildResponse(200, entries);
};
