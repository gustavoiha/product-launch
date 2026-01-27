import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  buildResponse,
  buildWaitlistFields,
  createSlug,
  getBooleanValue,
  getOwnerId,
  getStringValue,
  mapWaitlistResponse,
  parseBody,
  saveWaitlist,
  type WaitlistRecord
} from './shared';

export const updateWaitlist = async (
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

  const payload = parseBody(event);
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return buildResponse(400, { message: 'Payload is required.' });
  }

  const record = payload as Record<string, unknown>;
  const slugSource = getStringValue(record.title) || getStringValue(record.productName) || 'waitlist';
  const slug = createSlug(slugSource);
  const fields = buildWaitlistFields(slug, record.fields);

  const waitlist: WaitlistRecord = {
    pk: `WAITLIST#${waitlistId}`,
    sk: 'METADATA',
    id: waitlistId,
    ownerId,
    slug,
    productName: getStringValue(record.productName),
    title: getStringValue(record.title),
    description: getStringValue(record.description),
    confirmationTitle: getStringValue(record.confirmationTitle),
    confirmationDescription: getStringValue(record.confirmationDescription),
    isActive: getBooleanValue(record.isActive),
    fields
  };

  await saveWaitlist(waitlist);

  return buildResponse(200, mapWaitlistResponse(waitlist));
};
