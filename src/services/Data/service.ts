import dayjs from 'dayjs'
import { QueryResponse } from 'dynamoose/dist/ItemRetriever'
import { getPartitionKey_SensorData } from '~aws_resources/dynamodb/middlewares'
import { IRawSensorData, ISensorData, RawSensorData, SensorData, SensorDataFeedback } from '~aws_resources/dynamodb/tables/'
import { IActionHandlerParams } from '~core/rest-handler/RestHandler'
import * as Types from './types'

export class DataService {
  // RawDB
  public static async rawDBInsertData(params: IActionHandlerParams<IRawSensorData>): Promise<boolean> {
    await RawSensorData.model.create({ ...params.bodyPayload, FactoryId: params.authData.FactoryId })
    return true
  }

  public static async rawDBGetData(params: IActionHandlerParams<Types.IRawDBGetData>): Promise<IRawSensorData> {
    const data = await RawSensorData.model.get({
      FactoryId_Date: getPartitionKey_SensorData({ FactoryId: params.authData.FactoryId, Date: params.bodyPayload.Date }),
      Time: params.bodyPayload.Time,
    })
    return data
  }

  public static async rawDBQueryData(params: IActionHandlerParams<Types.IRawDBQueryData>): Promise<QueryResponse<IRawSensorData>> {
    const queryParams = {
      FactoryId_Date: getPartitionKey_SensorData({ FactoryId: params.authData.FactoryId, Date: params.bodyPayload.Date }),
    }
    if (params.bodyPayload.Time) {
      queryParams['Time'] = params.bodyPayload.Time
    }
    let query = RawSensorData.model.query(queryParams)
    if (params.bodyPayload.sort) {
      query = query.sort(params.bodyPayload.sort)
    }
    if (params.bodyPayload.limit) {
      query = query.limit(params.bodyPayload.limit)
    }
    const data = await query.exec()
    return data
  }

  // AppDB
  public static async appDBGetData(params: IActionHandlerParams<Types.IAppDBGetData>): Promise<ISensorData> {
    const data = await SensorData.model.get({
      FactoryId_Date: getPartitionKey_SensorData({ FactoryId: params.authData.FactoryId, Date: params.bodyPayload.Date }),
      Time: params.bodyPayload.Time,
    })
    return data
  }

  public static async appDBQueryData(params: IActionHandlerParams<Types.IAppDBQueryData>): Promise<QueryResponse<ISensorData>> {
    const queryParams = {
      FactoryId_Date: getPartitionKey_SensorData({ FactoryId: params.authData.FactoryId, Date: params.bodyPayload.Date }),
    }
    if (params.bodyPayload.Time) {
      queryParams['Time'] = params.bodyPayload.Time
    }
    let query = SensorData.model.query(queryParams)
    if (params.bodyPayload.sort) {
      query = query.sort(params.bodyPayload.sort)
    }
    if (params.bodyPayload.limit) {
      query = query.limit(params.bodyPayload.limit)
    }
    const data = await query.exec()
    return data
  }

  public static async appDBQueryLastItemsOfSensorData(params: { numberOfItems: number; factoryId: string }): Promise<ISensorData[]> {
    const now = dayjs()
    const arrItems = await SensorData.model
      .query({ FactoryId_Date: getPartitionKey_SensorData({ Date: now.format('YYYY-MM-DD'), FactoryId: params.factoryId }) })
      .sort('descending')
      .limit(params.numberOfItems)
      .exec()
    return arrItems.map((e) => e).reverse()
  }

  public static async addFeedback(params: IActionHandlerParams<Types.IAddFeedback>): Promise<boolean> {
    await SensorDataFeedback.model.create({ ...params.bodyPayload, FactoryId: params.authData.FactoryId })
    return true
  }
}
