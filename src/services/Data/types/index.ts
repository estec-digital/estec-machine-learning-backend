import { Data } from '~db/entities/Data'

export interface IGetData {
  fromDate: Date
  toDate: Date
}

export interface IGetDataResponse {
  fromDate: Date
  toDate: Date
  data: Data[]
}
