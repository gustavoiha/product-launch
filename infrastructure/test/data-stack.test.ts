import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { DataStack } from '../lib/data-stack';

test('data stack provisions a DynamoDB table with indexes', () => {
  const app = new App();
  const stack = new DataStack(app, 'DataStackTest');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::DynamoDB::Table', 1);
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    KeySchema: Match.arrayWith([
      Match.objectLike({ AttributeName: 'pk', KeyType: 'HASH' }),
      Match.objectLike({ AttributeName: 'sk', KeyType: 'RANGE' })
    ]),
    GlobalSecondaryIndexes: Match.arrayWith([
      Match.objectLike({ IndexName: 'OwnerIdIndex' }),
      Match.objectLike({ IndexName: 'SlugIndex' })
    ])
  });
});
