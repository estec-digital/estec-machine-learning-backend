import { AWS } from '@serverless/typescript'
import { generateResourceName } from '~core/utils'

export const dynamoDBResources: Omit<AWS['resources']['Resources'], 'Fn::Transform'> = {
  UserTable: {
    Type: 'AWS::DynamoDB::Table',
    Properties: {
      TableName: generateResourceName('User'),
      AttributeDefinitions: [{ AttributeName: 'Username', AttributeType: 'S' }],
      KeySchema: [{ AttributeName: 'Username', KeyType: 'HASH' }],
      BillingMode: 'PAY_PER_REQUEST',
    },
  },

  RawDataTable: {
    Type: 'AWS::DynamoDB::Table',
    Properties: {
      TableName: generateResourceName('RawData'),
      AttributeDefinitions: [
        { AttributeName: 'Date', AttributeType: 'S' },
        { AttributeName: 'Time', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'Date', KeyType: 'HASH' },
        { AttributeName: 'Time', KeyType: 'RANGE' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    },
  },

  SensorDataTable: {
    Type: 'AWS::DynamoDB::Table',
    Properties: {
      TableName: generateResourceName('SensorData'),
      AttributeDefinitions: [
        { AttributeName: 'Date', AttributeType: 'S' },
        { AttributeName: 'Time', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'Date', KeyType: 'HASH' },
        { AttributeName: 'Time', KeyType: 'RANGE' },
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

  WebSocketConnectionTable: {
    Type: 'AWS::DynamoDB::Table',
    Properties: {
      TableName: generateResourceName('WebSocketConnection'),
      AttributeDefinitions: [{ AttributeName: 'ConnectionId', AttributeType: 'S' }],
      KeySchema: [{ AttributeName: 'ConnectionId', KeyType: 'HASH' }],
      BillingMode: 'PAY_PER_REQUEST',
    },
  },
}

export const dynamoDBEnvironmentVariables: AWS['provider']['environment'] = {
  DYNAMO_DB_TABLE_NAME__UserTable: generateResourceName('User'),
  DYNAMO_DB_TABLE_NAME__RawDataTable: generateResourceName('RawData'),
  DYNAMO_DB_TABLE_NAME__SensorDataTable: generateResourceName('SensorData'),
  DYNAMO_DB_TABLE_NAME__WebSocketConnectionTable: generateResourceName('WebSocketConnection'),
}
