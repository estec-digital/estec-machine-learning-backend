import { SortOrder } from 'dynamoose/dist/General'
import { ISensorData, ISensorDataFeedback } from '~aws_resources/dynamodb/tables/'

export interface IRawDBGetData {
  Date: ISensorData['Date']
  Time: ISensorData['Time']
}

export interface IRawDBQueryData {
  Date: string
  Time?: string
  sort?: SortOrder
  limit?: number
}

export interface IAppDBGetData {
  Date: ISensorData['Date']
  Time: ISensorData['Time']
}

export interface IAppDBQueryData {
  Date: string
  Time?: string
  sort?: SortOrder
  limit?: number
}

export interface IUpdateThreshold {
  Pyrometer_Min: number
  Pyrometer_Max: number
  BET_Min: number
  BET_Max: number
  Load_Min: number
  Load_Max: number
  GA01_Min: number
  GA01_Max: number
}

export interface IUpdateThresholdResponse {
  message: string
  factoryData: Object
}

export type IAddFeedback = ISensorDataFeedback
