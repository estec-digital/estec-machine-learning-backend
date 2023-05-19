import { AWS } from '@serverless/typescript'
import { generateResourceName } from '~core/utils'

export const dynamoDBResources: Omit<AWS['resources']['Resources'], 'Fn::Transform'> = {
  SensorDataTable: {
    Type: 'AWS::DynamoDB::Table',
    Properties: {
      TableName: generateResourceName('SensorDataTable'),
      AttributeDefinitions: [
        { AttributeName: 'date', AttributeType: 'S' },
        { AttributeName: 'time', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'date', KeyType: 'HASH' },
        { AttributeName: 'time', KeyType: 'RANGE' },
      ],
      // LocalSecondaryIndexes: [
      //   {
      //     IndexName: 'nOx_GA01Index',
      //     KeySchema: [
      //       { AttributeName: 'id', KeyType: 'HASH' },
      //       { AttributeName: 'createdAt', KeyType: 'RANGE' },
      //     ],
      //     Projection: {
      //       ProjectionType: 'ALL',
      //     },
      //   },
      // ],

      // GlobalSecondaryIndexes: [
      //   {
      //     IndexName: 'createdAtIndexGlobal',
      //     KeySchema: [
      //       { AttributeName: 'createdAt', KeyType: 'HASH' },
      //       { AttributeName: 'id', KeyType: 'RANGE' }
      //     ],
      //     Projection: {
      //       ProjectionType: 'ALL'
      //     },
      //     ProvisionedThroughput: {
      //       ReadCapacityUnits: 5,
      //       WriteCapacityUnits: 5
      //     }
      //   }
      // ],
      BillingMode: 'PAY_PER_REQUEST',
    },
  },
  PredictionLabelTable: {
    Type: 'AWS::DynamoDB::Table',
    Properties: {
      TableName: generateResourceName('PredictionLabelTable'),
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'N' }],
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      BillingMode: 'PAY_PER_REQUEST',
    },
  },
}

export const dynamoDBEnvironmentVariables: AWS['provider']['environment'] = {
  DYNAMO_DB_TABLE_NAME__SensorDataTable: generateResourceName('SensorDataTable'),
  DYNAMO_DB_TABLE_NAME__PredictionLabelTable: generateResourceName('PredictionLabelTable'),
}
