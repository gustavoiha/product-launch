import type { WaitlistField, WaitlistFieldType } from '../state/waitlist';
import { getEnvironmentConfig } from '../config/environment';
import { getJson, postJson, putJson, type JsonValue } from './client';

export interface WaitlistRecordResponse {
  id: string;
  slug: string;
  productName: string;
  title: string;
  description: string;
  confirmationTitle: string;
  confirmationDescription: string;
  isActive: boolean;
  fields: WaitlistField[];
}

export interface WaitlistEntriesResponse {
  entries: WaitlistEntryResponse[];
}

export interface WaitlistEntryResponse {
  id: string;
  joinedAt: string;
  values: Record<string, string | boolean>;
}

export interface WaitlistSaveRequest extends Record<string, JsonValue> {
  productName: string;
  title: string;
  description: string;
  confirmationTitle: string;
  confirmationDescription: string;
  isActive: boolean;
  fields: Array<{
    label: string;
    type: WaitlistFieldType;
  }>;
}

export interface PublicEntryRequest extends Record<string, JsonValue> {
  values: Record<string, string | boolean>;
}

const getApiName = (): string => {
  const apiName = getEnvironmentConfig().amplify.apiGatewayName;
  if (!apiName) {
    throw new Error('API Gateway name is not configured.');
  }
  return apiName;
};

export const fetchOwnerWaitlist = async (): Promise<WaitlistRecordResponse> => {
  // GET /waitlists/owner
  // Expected response: { id, slug, productName, title, description, confirmationTitle,
  // confirmationDescription, isActive, fields: [{ id, label, type }] }
  return getJson<WaitlistRecordResponse>({
    apiName: getApiName(),
    path: '/waitlists/owner'
  });
};

export const fetchWaitlistBySlug = async (slug: string): Promise<WaitlistRecordResponse> => {
  // GET /waitlists/{slug}
  // Expected response: { id, slug, productName, title, description, confirmationTitle,
  // confirmationDescription, isActive, fields: [{ id, label, type }] }
  return getJson<WaitlistRecordResponse>({
    apiName: getApiName(),
    path: `/waitlists/${slug}`
  });
};

export const updateWaitlist = async (
  waitlistId: string,
  payload: WaitlistSaveRequest
): Promise<WaitlistRecordResponse> => {
  // PUT /waitlists/{id}
  // Expected request: { productName, title, description, confirmationTitle,
  // confirmationDescription, isActive, fields: [{ label, type }] }
  return putJson<WaitlistRecordResponse>({
    apiName: getApiName(),
    path: `/waitlists/${waitlistId}`,
    body: payload
  });
};

export const fetchWaitlistEntries = async (
  waitlistId: string
): Promise<WaitlistEntriesResponse> => {
  // GET /waitlists/{id}/entries
  // Expected response: { entries: [{ id, joinedAt, values }] }
  return getJson<WaitlistEntriesResponse>({
    apiName: getApiName(),
    path: `/waitlists/${waitlistId}/entries`
  });
};

export const submitPublicEntry = async (
  waitlistSlug: string,
  payload: PublicEntryRequest
): Promise<WaitlistEntryResponse> => {
  // POST /public/waitlists/{slug}/entries
  // Expected request: { values: { [fieldId]: string | boolean } }
  return postJson<WaitlistEntryResponse>({
    apiName: getApiName(),
    path: `/public/waitlists/${waitlistSlug}/entries`,
    body: payload
  });
};
