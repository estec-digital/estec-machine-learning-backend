import { AWS } from '@serverless/typescript'
import { generateDynamoDBEnvironmentVariables, generateDynamoDBServerlessResourcesInfo } from '~core/dynamodb/utils'
import { Cache, Factory, RawSensorData, SensorData, SensorDataFeedback, User, WebSocketConnection } from './tables'

const dynamoDBTables = { RawSensorData, SensorData, SensorDataFeedback, User, Factory, WebSocketConnection, Cache }

export const dynamoDBResources: Omit<AWS['resources']['Resources'], 'Fn::Transform'> = generateDynamoDBServerlessResourcesInfo(dynamoDBTables)

export const dynamoDBEnvironmentVariables = generateDynamoDBEnvironmentVariables(dynamoDBTables)
