import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

const OWNER_INDEX_NAME = 'OwnerIdIndex';
const SLUG_INDEX_NAME = 'SlugIndex';

export class DataStack extends Stack {
  public readonly waitlistTable: Table;
  public readonly ownerIndexName: string;
  public readonly slugIndexName: string;

  public constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.waitlistTable = new Table(this, 'WaitlistTable', {
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST
    });

    this.waitlistTable.addGlobalSecondaryIndex({
      indexName: OWNER_INDEX_NAME,
      partitionKey: {
        name: 'ownerId',
        type: AttributeType.STRING
      }
    });

    this.waitlistTable.addGlobalSecondaryIndex({
      indexName: SLUG_INDEX_NAME,
      partitionKey: {
        name: 'slug',
        type: AttributeType.STRING
      }
    });

    this.ownerIndexName = OWNER_INDEX_NAME;
    this.slugIndexName = SLUG_INDEX_NAME;

    new CfnOutput(this, 'WaitlistTableName', {
      value: this.waitlistTable.tableName
    });
  }
}
