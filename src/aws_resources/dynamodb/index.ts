import { AWS } from '@serverless/typescript'
import { generateDynamoDBEnvironmentVariables, generateDynamoDBServerlessResourcesInfo } from '~core/dynamodb/utils'
import { Factory } from './Factory'
import { RawSensorData } from './RawSensorData'
import { SensorData } from './SensorData'
import { SensorDataFeedback } from './SensorDataFeedback'
import { User } from './User'
import { WebSocketConnection } from './WebSocketConnection'

const dynamoDBTables = { RawSensorData, SensorData, SensorDataFeedback, User, WebSocketConnection, Factory }

export const dynamoDBResources: Omit<AWS['resources']['Resources'], 'Fn::Transform'> = generateDynamoDBServerlessResourcesInfo(dynamoDBTables)

export const dynamoDBEnvironmentVariables = generateDynamoDBEnvironmentVariables(dynamoDBTables)
