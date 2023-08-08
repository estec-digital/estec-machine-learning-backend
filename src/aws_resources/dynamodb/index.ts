import { AWS } from '@serverless/typescript'
import { generateDynamoDBEnvironmentVariables, generateDynamoDBServerlessResourcesInfo } from '~core/dynamodb/utils'
import { RawData } from './RawData'
import { SensorData } from './SensorData'
import { SensorDataFeedback } from './SensorDataFeedback'
import { User } from './User'
import { WebSocketConnection } from './WebSocketConnection'

const dynamoDBTables = { RawData, SensorData, SensorDataFeedback, User, WebSocketConnection }

export const dynamoDBResources: Omit<AWS['resources']['Resources'], 'Fn::Transform'> = generateDynamoDBServerlessResourcesInfo(dynamoDBTables)

export const dynamoDBEnvironmentVariables = generateDynamoDBEnvironmentVariables(dynamoDBTables)
