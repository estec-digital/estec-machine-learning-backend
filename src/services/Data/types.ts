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

export type IAddFeedback = ISensorDataFeedback
