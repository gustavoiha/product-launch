import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib';
import { AuthorizationType, CognitoUserPoolsAuthorizer, Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { type UserPool } from 'aws-cdk-lib/aws-cognito';
import { type Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Function as LambdaFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface ApiStackProps extends StackProps {
  table: Table;
  ownerIndexName: string;
  slugIndexName: string;
  userPool: UserPool;
}

const LAMBDA_HANDLER_CODE = `
const { randomUUID } = require('crypto');
const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;
const ownerIndexName = process.env.OWNER_INDEX_NAME;
const slugIndexName = process.env.SLUG_INDEX_NAME;

const DEFAULT_WAITLIST = {
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

const buildResponse = (statusCode, body) => {
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

const createSlug = (value) => {
  const trimmed = String(value || '').trim().toLowerCase();
  if (!trimmed) {
    return 'waitlist';
  }
  return trimmed
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-');
};

const parseBody = (event) => {
  if (!event.body) {
    return null;
  }
  try {
    return JSON.parse(event.body);
  } catch (error) {
    return null;
  }
};

const getOwnerId = (event) => {
  return event.requestContext &&
    event.requestContext.authorizer &&
    event.requestContext.authorizer.claims &&
    event.requestContext.authorizer.claims.sub
    ? event.requestContext.authorizer.claims.sub
    : null;
};

const mapWaitlistResponse = (item) => {
  return {
    id: item.id,
    slug: item.slug,
    productName: item.productName,
    title: item.title,
    description: item.description,
    confirmationTitle: item.confirmationTitle,
    confirmationDescription: item.confirmationDescription,
    isActive: item.isActive,
    fields: item.fields || []
  };
};

const findWaitlistByOwner = async (ownerId) => {
  const result = await dynamo.query({
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
  }).promise();
  if (!result.Items || result.Items.length === 0) {
    return null;
  }
  return result.Items[0];
};

const findWaitlistBySlug = async (slug) => {
  const result = await dynamo.query({
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
  }).promise();
  if (!result.Items || result.Items.length === 0) {
    return null;
  }
  return result.Items[0];
};

const putWaitlist = async (waitlist) => {
  await dynamo.put({
    TableName: tableName,
    Item: waitlist
  }).promise();
};

exports.getOwnerWaitlist = async (event) => {
  const ownerId = getOwnerId(event);
  if (!ownerId) {
    return buildResponse(401, { message: 'Unauthorized' });
  }

  let waitlist = await findWaitlistByOwner(ownerId);
  if (!waitlist) {
    const id = randomUUID();
    const slug = createSlug(DEFAULT_WAITLIST.title || DEFAULT_WAITLIST.productName);
    waitlist = {
      pk: \`WAITLIST#\${id}\`,
      sk: 'METADATA',
      id,
      ownerId,
      slug,
      ...DEFAULT_WAITLIST
    };
    await putWaitlist(waitlist);
  }

  return buildResponse(200, mapWaitlistResponse(waitlist));
};

exports.getWaitlistBySlug = async (event) => {
  const slug = event.pathParameters && event.pathParameters.waitlistId;
  if (!slug) {
    return buildResponse(400, { message: 'Waitlist slug is required.' });
  }

  const waitlist = await findWaitlistBySlug(slug);
  if (!waitlist) {
    return buildResponse(404, { message: 'Waitlist not found.' });
  }

  return buildResponse(200, mapWaitlistResponse(waitlist));
};

exports.updateWaitlist = async (event) => {
  const ownerId = getOwnerId(event);
  if (!ownerId) {
    return buildResponse(401, { message: 'Unauthorized' });
  }

  const waitlistId = event.pathParameters && event.pathParameters.waitlistId;
  if (!waitlistId) {
    return buildResponse(400, { message: 'Waitlist id is required.' });
  }

  const payload = parseBody(event);
  if (!payload) {
    return buildResponse(400, { message: 'Payload is required.' });
  }

  const slug = createSlug(payload.title || payload.productName || 'waitlist');
  const fields = Array.isArray(payload.fields)
    ? payload.fields.map((field, index) => ({
      id: \`\${slug}-field-\${index}\`,
      label: field.label,
      type: field.type
    }))
    : [];

  const waitlist = {
    pk: \`WAITLIST#\${waitlistId}\`,
    sk: 'METADATA',
    id: waitlistId,
    ownerId,
    slug,
    productName: payload.productName || '',
    title: payload.title || '',
    description: payload.description || '',
    confirmationTitle: payload.confirmationTitle || '',
    confirmationDescription: payload.confirmationDescription || '',
    isActive: Boolean(payload.isActive),
    fields
  };

  await putWaitlist(waitlist);

  return buildResponse(200, mapWaitlistResponse(waitlist));
};

exports.getWaitlistEntries = async (event) => {
  const ownerId = getOwnerId(event);
  if (!ownerId) {
    return buildResponse(401, { message: 'Unauthorized' });
  }

  const waitlistId = event.pathParameters && event.pathParameters.waitlistId;
  if (!waitlistId) {
    return buildResponse(400, { message: 'Waitlist id is required.' });
  }

  const result = await dynamo.query({
    TableName: tableName,
    KeyConditionExpression: '#pk = :pk and begins_with(#sk, :sk)',
    ExpressionAttributeNames: {
      '#pk': 'pk',
      '#sk': 'sk'
    },
    ExpressionAttributeValues: {
      ':pk': \`WAITLIST#\${waitlistId}\`,
      ':sk': 'ENTRY#'
    },
    ScanIndexForward: false
  }).promise();

  const entries = (result.Items || []).map((item) => ({
    id: item.id,
    joinedAt: item.joinedAt,
    values: item.values
  }));

  return buildResponse(200, { entries });
};

exports.submitPublicEntry = async (event) => {
  const slug = event.pathParameters && event.pathParameters.waitlistSlug;
  if (!slug) {
    return buildResponse(400, { message: 'Waitlist slug is required.' });
  }

  const payload = parseBody(event);
  if (!payload || !payload.values) {
    return buildResponse(400, { message: 'Entry values are required.' });
  }

  const waitlist = await findWaitlistBySlug(slug);
  if (!waitlist) {
    return buildResponse(404, { message: 'Waitlist not found.' });
  }

  const entryId = randomUUID();
  const joinedAt = new Date().toISOString();
  const entryItem = {
    pk: \`WAITLIST#\${waitlist.id}\`,
    sk: \`ENTRY#\${entryId}\`,
    id: entryId,
    joinedAt,
    values: payload.values
  };

  await dynamo.put({
    TableName: tableName,
    Item: entryItem
  }).promise();

  return buildResponse(200, {
    id: entryId,
    joinedAt,
    values: payload.values
  });
};
`;

const LAMBDA_RUNTIME = Runtime.NODEJS_18_X;

export class ApiStack extends Stack {
  public constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const createLambda = (identifier: string, handler: string): LambdaFunction => {
      return new LambdaFunction(this, identifier, {
        runtime: LAMBDA_RUNTIME,
        handler: `index.${handler}`,
        code: Code.fromInline(LAMBDA_HANDLER_CODE),
        environment: {
          TABLE_NAME: props.table.tableName,
          OWNER_INDEX_NAME: props.ownerIndexName,
          SLUG_INDEX_NAME: props.slugIndexName
        }
      });
    };

    const getOwnerWaitlist = createLambda('GetOwnerWaitlistHandler', 'getOwnerWaitlist');
    const getWaitlistBySlug = createLambda('GetWaitlistBySlugHandler', 'getWaitlistBySlug');
    const updateWaitlist = createLambda('UpdateWaitlistHandler', 'updateWaitlist');
    const getWaitlistEntries = createLambda('GetWaitlistEntriesHandler', 'getWaitlistEntries');
    const submitPublicEntry = createLambda('SubmitPublicEntryHandler', 'submitPublicEntry');

    props.table.grantReadWriteData(getOwnerWaitlist);
    props.table.grantReadWriteData(getWaitlistBySlug);
    props.table.grantReadWriteData(updateWaitlist);
    props.table.grantReadWriteData(getWaitlistEntries);
    props.table.grantReadWriteData(submitPublicEntry);

    const api = new RestApi(this, 'ProductLaunchApi', {
      restApiName: 'product-launch-api',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS
      }
    });

    const authorizer = new CognitoUserPoolsAuthorizer(this, 'UserPoolAuthorizer', {
      cognitoUserPools: [props.userPool]
    });

    const waitlists = api.root.addResource('waitlists');
    const ownerResource = waitlists.addResource('owner');
    ownerResource.addMethod('GET', new LambdaIntegration(getOwnerWaitlist), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer
    });

    const waitlistResource = waitlists.addResource('{waitlistId}');
    waitlistResource.addMethod('GET', new LambdaIntegration(getWaitlistBySlug));
    waitlistResource.addMethod('PUT', new LambdaIntegration(updateWaitlist), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer
    });

    const entriesResource = waitlistResource.addResource('entries');
    entriesResource.addMethod('GET', new LambdaIntegration(getWaitlistEntries), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer
    });

    const publicResource = api.root.addResource('public');
    const publicWaitlists = publicResource.addResource('waitlists');
    const publicWaitlist = publicWaitlists.addResource('{waitlistSlug}');
    const publicEntries = publicWaitlist.addResource('entries');
    publicEntries.addMethod('POST', new LambdaIntegration(submitPublicEntry));

    new CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url
    });

    new CfnOutput(this, 'ApiGatewayName', {
      value: api.restApiName
    });
  }
}
