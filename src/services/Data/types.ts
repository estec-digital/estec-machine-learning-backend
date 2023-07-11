import { SortOrder } from 'dynamoose/dist/General'
import { CSensorData } from '~root/dynamodb/schema/SensorDataTable'

export interface IRawDBGetData {
  Date: CSensorData['Date']
  Time: CSensorData['Time']
}

export interface IRawDBQueryData {
  partition: string
  range?: object
  sort?: SortOrder
  limit?: number
}

export interface IAppDBGetData {
  Date: CSensorData['Date']
  Time: CSensorData['Time']
}

export interface IAppDBQueryData {
  partition: string
  range?: object
  sort?: SortOrder
  limit?: number
}
