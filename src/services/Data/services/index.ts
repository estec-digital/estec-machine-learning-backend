import dayjs from 'dayjs'
import { QueryResponse } from 'dynamoose/dist/ItemRetriever'
import { CSensorData, SensorData } from '~root/dynamodb/schema/SensorDataTable'
import * as Types from '../types'

export class DataService {
  public static async getData(params: Types.IGetData): Promise<CSensorData> {
    const data = await SensorData.get({ date: params.date, time: params.time })
    return data
  }

  public static async queryData(params: Types.IQuerySensorData): Promise<QueryResponse<CSensorData>> {
    const data = await SensorData.query({
      date: {
        eq: params.partition,
      },
      time: {
        ...(params.range ?? {}),
      },
    }).exec()
    return data
  }

  public static async queryLast15ItemsOfSensorData(): Promise<CSensorData[]> {
    const now = dayjs()
    const arrItems = await SensorData.query({ date: { eq: now.format('YYYY-MM-DD') } })
      .sort('descending')
      .limit(15)
      .exec()
    return arrItems.map((e) => e).reverse()
  }

  public static async putData(sensorData: CSensorData): Promise<boolean> {
    const putArr: Partial<CSensorData>[] = [sensorData]
    await SensorData.batchPut(putArr)
    return true
  }

  public static async insertData(sensorData: CSensorData): Promise<boolean> {
    await SensorData.create(sensorData)
    return true
  }

  public static async updatePrediction(params: Types.IUpdatePrediction): Promise<any> {
    const data = await SensorData.get({ date: params.date, time: params.time })
    if (data && params.prediction) {
      data.prediction = params.prediction
      await data.save()
      return true
    }
    return false
  }
}
