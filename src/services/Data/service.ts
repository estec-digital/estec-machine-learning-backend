import dayjs from 'dayjs'
import { QueryResponse } from 'dynamoose/dist/ItemRetriever'
import { IRawData, RawData } from '~aws_resources/dynamodb/RawData'
import { ISensorData, SensorData } from '~aws_resources/dynamodb/SensorData'
import { SensorDataFeedback } from '~aws_resources/dynamodb/SensorDataFeedback'
import * as Types from './types'

export class DataService {
  // RawDB
  public static async rawDBInsertData(rawData: IRawData): Promise<boolean> {
    await RawData.model.create(rawData)
    return true
  }

  public static async rawDBGetData(params: Types.IRawDBGetData): Promise<IRawData> {
    const data = await RawData.model.get({ Date: params.Date, Time: params.Time })
    return data
  }

  public static async rawDBQueryData(params: Types.IRawDBQueryData): Promise<QueryResponse<IRawData>> {
    const queryParams = {
      Date: {
        eq: params.partition,
      },
    }
    if (params.range) {
      queryParams['Time'] = params.range
    }
    let query = RawData.model.query(queryParams)
    if (params.sort) {
      query = query.sort(params.sort)
    }
    if (params.limit) {
      query = query.limit(params.limit)
    }
    const data = await query.exec()
    return data
  }

  // AppDB
  public static async appDBGetData(params: Types.IAppDBGetData): Promise<ISensorData> {
    const data = await SensorData.model.get({ Date: params.Date, Time: params.Time })
    return data
  }

  public static async appDBQueryData(params: Types.IAppDBQueryData): Promise<QueryResponse<ISensorData>> {
    const queryParams = {
      Date: {
        eq: params.partition,
      },
    }
    if (params.range) {
      queryParams['Time'] = params.range
    }
    let query = SensorData.model.query(queryParams)
    if (params.sort) {
      query = query.sort(params.sort)
    }
    if (params.limit) {
      query = query.limit(params.limit)
    }
    const data = await query.exec()
    return data
  }

  public static async appDBQueryLastItemsOfSensorData(numberOfItems: number): Promise<ISensorData[]> {
    const now = dayjs()
    const arrItems = await SensorData.model
      .query({ Date: { eq: now.format('YYYY-MM-DD') } })
      .sort('descending')
      .limit(numberOfItems)
      .exec()
    return arrItems.map((e) => e).reverse()
  }

  public static async addFeedback(feedback: Types.IAddFeedback): Promise<boolean> {
    await SensorDataFeedback.model.create(feedback)
    return true
  }
}
