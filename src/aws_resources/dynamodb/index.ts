import { AWS } from '@serverless/typescript'
import { RawData } from './RawData'
import { SensorData } from './SensorData'
import { User } from './User'
import { WebSocketConnection } from './WebSocketConnection'

export const dynamoDBResources: Omit<AWS['resources']['Resources'], 'Fn::Transform'> = {
  RawData: RawData.serverlessResourceInfo,
  SensorData: SensorData.serverlessResourceInfo,
  User: User.serverlessResourceInfo,
  WebSocketConnection: WebSocketConnection.serverlessResourceInfo,
}

export const dynamoDBEnvironmentVariables = Object.keys(dynamoDBResources).reduce(
  (prev, dynamoDBTable) => ({
    ...prev,
    [dynamoDBTable]: {
      'Fn::GetAtt': [`DYNAMODB_ARN__${dynamoDBTable}`, 'StreamArn'],
    },
  }),
  {},
)
