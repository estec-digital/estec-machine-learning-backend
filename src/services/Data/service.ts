import dayjs from 'dayjs'
import { QueryResponse } from 'dynamoose/dist/ItemRetriever'
import { getPartitionKey_SensorData } from '~aws_resources/dynamodb/middlewares'
import { Factory, IFactory, IRawSensorData, ISensorData, RawSensorData, SensorData, SensorDataFeedback } from '~aws_resources/dynamodb/tables/'
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

  // Threshold
  public static async getFactoryData(params: IActionHandlerParams): Promise<IFactory> {
    const data = await Factory.model.get({
      FactoryId: params.authData.FactoryId,
    })
    return data
  }

  public static async updateFactoryData(params: IActionHandlerParams<Types.IUpdateThreshold>): Promise<Types.IUpdateThresholdResponse> {
    const data = await Factory.model.update({
      FactoryId: params.authData.FactoryId,
      ThresholdData: {
        Pyrometer_Min: params.bodyPayload.Pyrometer_Min,
        Pyrometer_Max: params.bodyPayload.Pyrometer_Max,
        BET_Min: params.bodyPayload.BET_Min,
        BET_Max: params.bodyPayload.BET_Max,
        Load_Min: params.bodyPayload.Load_Min,
        Load_Max: params.bodyPayload.Load_Max,
        GA01_Min: params.bodyPayload.GA01_Min,
        GA01_Max: params.bodyPayload.GA01_Max,
      },
    })

    await data.save()

    return {
      message: 'Threshold updated successfully!!!',
      factoryData: data,
    }
  }
}
