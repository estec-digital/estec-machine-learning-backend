import dayjs from 'dayjs'
import { QueryResponse } from 'dynamoose/dist/ItemRetriever'
import { CRawData, RawData } from '~root/dynamodb/schema/RawDataTable'
import { CSensorData, SensorData } from '~root/dynamodb/schema/SensorDataTable'
import * as Types from './types'

export class DataService {
  // RawDB
  public static async rawDBInsertData(rawData: CRawData): Promise<boolean> {
    await RawData.create(rawData)
    return true
  }

  public static async rawDBGetData(params: Types.IRawDBGetData): Promise<CRawData> {
    const data = await RawData.get({ Date: params.Date, Time: params.Time })
    return data
  }

  public static async rawDBQueryData(params: Types.IRawDBQueryData): Promise<QueryResponse<CRawData>> {
    const queryParams = {
      Date: {
        eq: params.partition,
      },
    }
    if (params.range) {
      queryParams['Time'] = params.range
    }
    let query = RawData.query(queryParams)
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
  public static async appDBGetData(params: Types.IAppDBGetData): Promise<CSensorData> {
    const data = await SensorData.get({ Date: params.Date, Time: params.Time })
    return data
  }

  public static async appDBQueryData(params: Types.IAppDBQueryData): Promise<QueryResponse<CSensorData>> {
    const queryParams = {
      Date: {
        eq: params.partition,
      },
    }
    if (params.range) {
      queryParams['Time'] = params.range
    }
    let query = SensorData.query(queryParams)
    if (params.sort) {
      query = query.sort(params.sort)
    }
    if (params.limit) {
      query = query.limit(params.limit)
    }
    const data = await query.exec()
    return data
  }

  public static async appDBQueryLastItemsOfSensorData(numberOfItems: number): Promise<CSensorData[]> {
    const now = dayjs()
    const arrItems = await SensorData.query({ Date: { eq: now.format('YYYY-MM-DD') } })
      .sort('descending')
      .limit(numberOfItems)
      .exec()
    return arrItems.map((e) => e).reverse()
  }
}
