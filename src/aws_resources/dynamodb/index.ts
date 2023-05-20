import { AWS } from '@serverless/typescript'
import { generateResourceName } from '~core/utils'

export const dynamoDBResources: Omit<AWS['resources']['Resources'], 'Fn::Transform'> = {
  UserTable: {
    Type: 'AWS::DynamoDB::Table',
    Properties: {
      TableName: generateResourceName('User'),
      AttributeDefinitions: [{ AttributeName: 'username', AttributeType: 'S' }],
      KeySchema: [{ AttributeName: 'username', KeyType: 'HASH' }],
      BillingMode: 'PAY_PER_REQUEST',
    },
  },

  SensorDataTable: {
    Type: 'AWS::DynamoDB::Table',
    Properties: {
      TableName: generateResourceName('SensorData'),
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
      TableName: generateResourceName('PredictionLabel'),
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'N' }],
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      BillingMode: 'PAY_PER_REQUEST',
    },
  },

  WebSocketConnectionTable: {
    Type: 'AWS::DynamoDB::Table',
    Properties: {
      TableName: generateResourceName('WebSocketConnection'),
      AttributeDefinitions: [{ AttributeName: 'connectionId', AttributeType: 'S' }],
      KeySchema: [{ AttributeName: 'connectionId', KeyType: 'HASH' }],
      BillingMode: 'PAY_PER_REQUEST',
    },
  },
}

export const dynamoDBEnvironmentVariables: AWS['provider']['environment'] = {
  DYNAMO_DB_TABLE_NAME__UserTable: generateResourceName('User'),
  DYNAMO_DB_TABLE_NAME__SensorDataTable: generateResourceName('SensorData'),
  DYNAMO_DB_TABLE_NAME__PredictionLabelTable: generateResourceName('PredictionLabel'),
  DYNAMO_DB_TABLE_NAME__WebSocketConnectionTable: generateResourceName('WebSocketConnection'),
}
