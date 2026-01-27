import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib';
import { AuthorizationType, CognitoUserPoolsAuthorizer, Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { type UserPool } from 'aws-cdk-lib/aws-cognito';
import { type Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import path from 'path';

interface ApiStackProps extends StackProps {
  table: Table;
  ownerIndexName: string;
  slugIndexName: string;
  userPool: UserPool;
}

const LAMBDA_RUNTIME = Runtime.NODEJS_24_X;
const LAMBDA_ENTRY = path.join(__dirname, 'lambdas', 'index.ts');

export class ApiStack extends Stack {
  public constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const createLambda = (identifier: string, handler: string): NodejsFunction => {
      return new NodejsFunction(this, identifier, {
        runtime: LAMBDA_RUNTIME,
        entry: LAMBDA_ENTRY,
        handler,
        bundling: {
          target: 'node24'
        },
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
