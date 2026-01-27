import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildDefaultWaitlist, buildResponse, findWaitlistByOwner, getOwnerId, mapWaitlistResponse, saveWaitlist } from './shared';

export const getOwnerWaitlist = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const ownerId = getOwnerId(event);
  if (!ownerId) {
    return buildResponse(401, { message: 'Unauthorized' });
  }

  let waitlist = await findWaitlistByOwner(ownerId);
  if (!waitlist) {
    waitlist = buildDefaultWaitlist(ownerId);
    await saveWaitlist(waitlist);
  }

  return buildResponse(200, mapWaitlistResponse(waitlist));
};
