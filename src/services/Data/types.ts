import { SortOrder } from 'dynamoose/dist/General'
import { IFactory, ISensorData, ISensorDataFeedback } from '~aws_resources/dynamodb/tables/'

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

export interface IAppDBUpdateData {
  Date: ISensorData['Date']
  Time: ISensorData['Time']
  ID: string
}

export interface IAppDBUpdateDataResponse {
  message: string
}

export interface IAppDBQueryData {
  Date: string
  Time?: string
  sort?: SortOrder
  limit?: number
}

export type IUpdateThreshold = IFactory['ThresholdData']
export interface IUpdateThresholdResponse {
  message: string
  threshold: IFactory['ThresholdData']
}

export type IAddFeedback = ISensorDataFeedback

export type IToggleEnableAlert = {
  key: keyof IFactory['ThresholdData']
  enableAlert: boolean
}

export type IGetFeedbackTicket = {
  Date: string
  Time: string
}

export type ISaveFeedback = {
  Date: string
  Time: string
  Feedback: object
}

export type IGetListOfFeedbacks = {
  From: string
  To: string
}

export type IGetSingleFeedback = {
  Date: string
  Hash: string
}
