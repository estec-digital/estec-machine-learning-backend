import { AWS } from '@serverless/typescript'
import { generateDynamoDBEnvironmentVariables, generateDynamoDBServerlessResourcesInfo } from '~core/dynamodb/utils'
import { RawData } from './RawData'
import { SensorData } from './SensorData'
import { User } from './User'
import { WebSocketConnection } from './WebSocketConnection'

const dynamoDBTables = { RawData, SensorData, User, WebSocketConnection }

export const dynamoDBResources: Omit<AWS['resources']['Resources'], 'Fn::Transform'> = generateDynamoDBServerlessResourcesInfo(dynamoDBTables)

export const dynamoDBEnvironmentVariables = generateDynamoDBEnvironmentVariables(dynamoDBTables)
