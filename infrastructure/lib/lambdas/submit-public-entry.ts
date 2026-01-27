import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, findWaitlistBySlug, normalizeEntryValues, parseBody, saveWaitlistEntry } from './shared';

export const submitPublicEntry = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const slug = event.pathParameters?.waitlistSlug;
  if (!slug) {
    return buildResponse(400, { message: 'Waitlist slug is required.' });
  }

  const payload = parseBody(event);
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return buildResponse(400, { message: 'Entry values are required.' });
  }
  const values = (payload as { values?: unknown }).values;
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    return buildResponse(400, { message: 'Entry values are required.' });
  }

  const waitlist = await findWaitlistBySlug(slug);
  if (!waitlist) {
    return buildResponse(404, { message: 'Waitlist not found.' });
  }

  const normalizedValues = normalizeEntryValues(values as Record<string, unknown>);
  const entry = await saveWaitlistEntry(waitlist.id, normalizedValues);

  return buildResponse(200, entry);
};
