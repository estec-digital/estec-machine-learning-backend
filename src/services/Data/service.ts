import dayjs from 'dayjs'
import { QueryResponse } from 'dynamoose/dist/ItemRetriever'
import { CRawData, RawData } from '~root/dynamodb/schema/RawDataTable'
import { CSensorData, SensorData } from '~root/dynamodb/schema/SensorDataTable'
import * as Types from './types'

export class DataService {
  public static async insertRawData(rawData: CRawData): Promise<boolean> {
    await RawData.create(rawData)
    return true
  }

  public static async querySensorData(params: Types.IQuerySensorData): Promise<QueryResponse<CSensorData>> {
    const data = await SensorData.query({
      Date: {
        eq: params.partition,
      },
      Time: {
        ...(params.range ?? {}),
      },
    }).exec()
    return data
  }

  public static async queryLast15ItemsOfSensorData(): Promise<CSensorData[]> {
    const now = dayjs()
    const arrItems = await SensorData.query({ Date: { eq: now.format('YYYY-MM-DD') } })
      .sort('descending')
      .limit(15)
      .exec()
    return arrItems.map((e) => e).reverse()
  }
}
