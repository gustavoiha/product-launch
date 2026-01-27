import { randomUUID } from 'crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export interface WaitlistField {
  id: string;
  label: string;
  type: string;
}

export interface WaitlistRecord {
  pk: string;
  sk: string;
  id: string;
  ownerId: string;
  slug: string;
  productName: string;
  title: string;
  description: string;
  confirmationTitle: string;
  confirmationDescription: string;
  isActive: boolean;
  fields: WaitlistField[];
}

export interface WaitlistEntryRecord {
  pk: string;
  sk: string;
  id: string;
  joinedAt: string;
  values: Record<string, string | boolean>;
}

export interface WaitlistResponse {
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
  entries: Array<{
    id: string;
    joinedAt: string;
    values: Record<string, string | boolean>;
  }>;
}

export interface PublicEntryResponse {
  id: string;
  joinedAt: string;
  values: Record<string, string | boolean>;
}

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const getEnvironmentValue = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not set.`);
  }
  return value;
};

export const getEnvironmentConfig = (): {
  tableName: string;
  ownerIndexName: string;
  slugIndexName: string;
} => {
  return {
    tableName: getEnvironmentValue('TABLE_NAME'),
    ownerIndexName: getEnvironmentValue('OWNER_INDEX_NAME'),
    slugIndexName: getEnvironmentValue('SLUG_INDEX_NAME')
  };
};

export const buildResponse = (
  statusCode: number,
  body: unknown
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS'
    },
    body: JSON.stringify(body)
  };
};

export const parseBody = (event: APIGatewayProxyEvent): unknown | null => {
  if (!event.body) {
    return null;
  }
  try {
    return JSON.parse(event.body) as unknown;
  } catch (error) {
    return null;
  }
};

export const createSlug = (value: string): string => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return 'waitlist';
  }
  return trimmed
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const getOwnerId = (event: APIGatewayProxyEvent): string | null => {
  const claims = event.requestContext.authorizer?.claims;
  if (!claims || typeof claims !== 'object') {
    return null;
  }
  const ownerId = (claims as { sub?: unknown }).sub;
  if (typeof ownerId !== 'string' || !ownerId) {
    return null;
  }
  return ownerId;
};

export const getStringValue = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

export const getBooleanValue = (value: unknown): boolean => {
  return typeof value === 'boolean' ? value : false;
};

export const normalizeEntryValues = (
  values: Record<string, unknown>
): Record<string, string | boolean> => {
  const normalized: Record<string, string | boolean> = {};
  Object.entries(values).forEach(([key, entryValue]): void => {
    if (typeof entryValue === 'string' || typeof entryValue === 'boolean') {
      normalized[key] = entryValue;
    }
  });
  return normalized;
};

export const buildWaitlistFields = (
  slug: string,
  fields: unknown
): WaitlistField[] => {
  if (!Array.isArray(fields)) {
    return [];
  }
  return fields.map((field, index): WaitlistField => {
    if (!field || typeof field !== 'object' || Array.isArray(field)) {
      return {
        id: `${slug}-field-${index}`,
        label: '',
        type: ''
      };
    }
    const record = field as Record<string, unknown>;
    return {
      id: `${slug}-field-${index}`,
      label: getStringValue(record.label),
      type: getStringValue(record.type)
    };
  });
};

export const mapWaitlistResponse = (item: WaitlistRecord): WaitlistResponse => {
  return {
    id: item.id,
    slug: item.slug,
    productName: item.productName,
    title: item.title,
    description: item.description,
    confirmationTitle: item.confirmationTitle,
    confirmationDescription: item.confirmationDescription,
    isActive: item.isActive,
    fields: item.fields ?? []
  };
};

export const DEFAULT_WAITLIST = {
  title: 'Join the launch waitlist',
  description: 'Get updates on our upcoming product release.',
  productName: 'Product Launch',
  confirmationTitle: 'Thanks for joining!',
  confirmationDescription: 'We will be in touch with updates soon.',
  isActive: true,
  fields: [
    {
      id: 'email-field',
      label: 'Email address',
      type: 'email'
    }
  ]
};

export const buildDefaultWaitlist = (ownerId: string): WaitlistRecord => {
  const id = randomUUID();
  const slug = createSlug(DEFAULT_WAITLIST.title || DEFAULT_WAITLIST.productName);
  return {
    pk: `WAITLIST#${id}`,
    sk: 'METADATA',
    id,
    ownerId,
    slug,
    productName: DEFAULT_WAITLIST.productName,
    title: DEFAULT_WAITLIST.title,
    description: DEFAULT_WAITLIST.description,
    confirmationTitle: DEFAULT_WAITLIST.confirmationTitle,
    confirmationDescription: DEFAULT_WAITLIST.confirmationDescription,
    isActive: DEFAULT_WAITLIST.isActive,
    fields: DEFAULT_WAITLIST.fields
  };
};

export const findWaitlistByOwner = async (ownerId: string): Promise<WaitlistRecord | null> => {
  const { tableName, ownerIndexName } = getEnvironmentConfig();
  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: ownerIndexName,
      KeyConditionExpression: '#ownerId = :ownerId',
      ExpressionAttributeNames: {
        '#ownerId': 'ownerId'
      },
      ExpressionAttributeValues: {
        ':ownerId': ownerId
      },
      Limit: 1
    })
  );
  const item = result.Items?.[0] as WaitlistRecord | undefined;
  return item ?? null;
};

export const findWaitlistBySlug = async (slug: string): Promise<WaitlistRecord | null> => {
  const { tableName, slugIndexName } = getEnvironmentConfig();
  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName,
      IndexName: slugIndexName,
      KeyConditionExpression: '#slug = :slug',
      ExpressionAttributeNames: {
        '#slug': 'slug'
      },
      ExpressionAttributeValues: {
        ':slug': slug
      },
      Limit: 1
    })
  );
  const item = result.Items?.[0] as WaitlistRecord | undefined;
  return item ?? null;
};

export const saveWaitlist = async (waitlist: WaitlistRecord): Promise<void> => {
  const { tableName } = getEnvironmentConfig();
  await documentClient.send(
    new PutCommand({
      TableName: tableName,
      Item: waitlist
    })
  );
};

export const fetchWaitlistEntries = async (
  waitlistId: string
): Promise<WaitlistEntriesResponse> => {
  const { tableName } = getEnvironmentConfig();
  const result = await documentClient.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: '#pk = :pk and begins_with(#sk, :sk)',
      ExpressionAttributeNames: {
        '#pk': 'pk',
        '#sk': 'sk'
      },
      ExpressionAttributeValues: {
        ':pk': `WAITLIST#${waitlistId}`,
        ':sk': 'ENTRY#'
      },
      ScanIndexForward: false
    })
  );
  const entries =
    result.Items?.map((item): WaitlistEntriesResponse['entries'][number] => {
      const record = item as WaitlistEntryRecord;
      return {
        id: record.id,
        joinedAt: record.joinedAt,
        values: record.values
      };
    }) ?? [];
  return { entries };
};

export const saveWaitlistEntry = async (
  waitlistId: string,
  values: Record<string, string | boolean>
): Promise<PublicEntryResponse> => {
  const { tableName } = getEnvironmentConfig();
  const entryId = randomUUID();
  const joinedAt = new Date().toISOString();
  const entryItem: WaitlistEntryRecord = {
    pk: `WAITLIST#${waitlistId}`,
    sk: `ENTRY#${entryId}`,
    id: entryId,
    joinedAt,
    values
  };
  await documentClient.send(
    new PutCommand({
      TableName: tableName,
      Item: entryItem
    })
  );
  return {
    id: entryId,
    joinedAt,
    values
  };
};
