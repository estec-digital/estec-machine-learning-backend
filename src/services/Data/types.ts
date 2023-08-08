import { SortOrder } from 'dynamoose/dist/General'
import { ISensorData } from '~aws_resources/dynamodb/SensorData'
import { ISensorDataFeedback } from '~aws_resources/dynamodb/SensorDataFeedback'

export interface IRawDBGetData {
  Date: ISensorData['Date']
  Time: ISensorData['Time']
}

export interface IRawDBQueryData {
  partition: string
  range?: object
  sort?: SortOrder
  limit?: number
}

export interface IAppDBGetData {
  Date: ISensorData['Date']
  Time: ISensorData['Time']
}

export interface IAppDBQueryData {
  partition: string
  range?: object
  sort?: SortOrder
  limit?: number
}

export type IAddFeedback = ISensorDataFeedback
