import dayjs from 'dayjs'
import { QueryResponse } from 'dynamoose/dist/ItemRetriever'
import * as lodash from 'lodash'
import { getPartitionKey_SensorData } from '~aws_resources/dynamodb/middlewares'
import { Factory, IFactory, IRawSensorData, ISensorData, ISensorDataFeedback, RawSensorData, SensorData, SensorDataFeedback } from '~aws_resources/dynamodb/tables/'
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

  public static async appDBGetDataForDashboard(params: IActionHandlerParams): Promise<Partial<ISensorData>[]> {
    const data = await DataService.appDBQueryLastItemsOfSensorData({ factoryId: params.authData.FactoryId, numberOfItems: 120 })
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

  public static async appDBQueryLastItemsOfSensorData(params: { numberOfItems: number; factoryId: string }): Promise<Partial<ISensorData>[]> {
    const now = dayjs()
    const arrItems = await SensorData.model
      .query({ FactoryId_Date: getPartitionKey_SensorData({ Date: now.format('YYYY-MM-DD'), FactoryId: params.factoryId }) })
      .sort('descending')
      .limit(params.numberOfItems)
      .exec()
    return arrItems.map((e) => e).reverse()
  }

  // Threshold
  public static async getFactoryData(params: IActionHandlerParams): Promise<IFactory['ThresholdData']> {
    const data = await Factory.model.get({
      FactoryId: params.authData.FactoryId,
    })
    return data.ThresholdData
  }

  public static async updateFactoryData(params: IActionHandlerParams<Types.IUpdateThreshold>): Promise<Types.IUpdateThresholdResponse> {
    if (Object.values(params.bodyPayload).every((threshold) => Number(threshold.min) <= Number(threshold.max)) === false) {
      throw new Error('Max values has to be greater than min values!')
    }

    const data = await Factory.model.get({ FactoryId: params.authData.FactoryId })

    for (const [key, threshold] of Object.entries(params.bodyPayload ?? {})) {
      threshold.min = Number(threshold.min)
      threshold.max = Number(threshold.max)
      if (typeof data.ThresholdData[key as keyof ISensorData['SensorData']]?.enableAlert !== 'boolean') {
        threshold.enableAlert = true
      }
    }

    if (!data) {
      throw new Error("Cannot update Factory's threshold!")
    }

    data.ThresholdData = lodash.merge(data.ThresholdData, params.bodyPayload ?? {})
    await data.save()

    return {
      message: 'Updated threshold successfully!!!',
      threshold: data.ThresholdData,
    }
  }

  public static async toggleEnableAlert(params: IActionHandlerParams<Types.IToggleEnableAlert>): Promise<boolean> {
    const data = await Factory.model.get({ FactoryId: params.authData.FactoryId })

    if (!data) {
      throw new Error("Cannot update Factory's threshold!")
    }

    if (!(typeof data.ThresholdData[params.bodyPayload.key] === 'object')) {
      throw new Error('Invalid threshold key!')
    }

    data.ThresholdData[params.bodyPayload.key].enableAlert = params.bodyPayload.enableAlert

    await data.save()

    return true
  }

  // Feedback
  public static async getFeedbackTicket(params: IActionHandlerParams<Types.IGetFeedbackTicket>): Promise<ISensorData[]> {
    // 3 latest items
    const targetTime = dayjs(`${params.bodyPayload.Date} ${params.bodyPayload.Time}`, 'YYYY-MM-DD HH:mm:ss')
    const latestTimes: dayjs.Dayjs[] = []
    for (let i = 0; i < 4; i++) {
      latestTimes.push(targetTime.subtract(i, 'minute'))
    }
    const latestItems = await SensorData.model.batchGet(
      latestTimes.map((dateTime) => ({
        FactoryId_Date: `${params.authData.FactoryId}::${dateTime.format('YYYY-MM-DD')}`,
        Time: dateTime.format('HH:mm:ss'),
      })),
    )
    return latestItems
  }

  public static async saveFeedback(params: IActionHandlerParams<Types.ISaveFeedback>): Promise<boolean> {
    const data = await SensorData.model.get({
      FactoryId_Date: getPartitionKey_SensorData({ FactoryId: params.authData.FactoryId, Date: params.bodyPayload.Date }),
      Time: params.bodyPayload.Time,
    })
    if (!data) {
      throw new Error('Invalid data to feedback!')
    }

    await SensorDataFeedback.model.create({
      ...data,
      Feedback: params.bodyPayload.Feedback,
    })

    return true
  }

  public static async getListOfFeedbacks(params: IActionHandlerParams<Types.IGetListOfFeedbacks>): Promise<ISensorDataFeedback[]> {
    const from = dayjs(params.bodyPayload.From, 'YYYY-MM-DD HH:mm:ss')
    const to = dayjs(params.bodyPayload.To, 'YYYY-MM-DD HH:mm:ss')

    if (!(from.isValid() && to.isValid())) {
      throw new Error('Invalid date time!')
    }

    const response = await SensorDataFeedback.model
      .scan({
        FactoryId: params.authData.FactoryId,
        CreatedAt: { between: [from.toDate().getTime(), to.toDate().getTime()] },
      })
      .exec()

    return response
  }

  public static async getSingleFeedback(params: IActionHandlerParams<Types.IGetSingleFeedback>): Promise<ISensorDataFeedback> {
    const response: ISensorDataFeedback[] = await SensorDataFeedback.model
      .query({
        FactoryId_Date: getPartitionKey_SensorData({ FactoryId: params.authData.FactoryId, Date: params.bodyPayload.Date }),
        Hash: params.bodyPayload.Hash,
      })
      .exec()

    return response?.[0] ?? null
  }

  // Issue
  public static async updateAcknowledge(params: IActionHandlerParams<Types.IIssueUpdateAcknowledge>): Promise<Types.IIssueUpdateAcknowledgeResponse> {
    const data = await SensorData.model.get({
      FactoryId_Date: getPartitionKey_SensorData({ FactoryId: params.authData.FactoryId, Date: params.bodyPayload.Date }),
      Time: params.bodyPayload.Time,
    })

    if (!data) {
      throw new Error('Failed to update')
    }

    if (data && data.Issues && data.Issues.length > 0) {
      const foundIssue = data.Issues.find((item) => item.ID === params.bodyPayload.ID)
      if (foundIssue) {
        foundIssue.Acknowledge = true
      } else {
        throw new Error('Nothing to update!!!')
      }
    } else {
      throw new Error('Not found Issue to update!!!')
    }

    await data.save()

    return {
      message: 'Update successfully',
      updateData: data,
    }
  }

  public static async getListOfIssues(params: IActionHandlerParams<Types.IGetListOfIssues>): Promise<ISensorData[]> {
    const queryParams = {
      FactoryId_Date: getPartitionKey_SensorData({ FactoryId: params.authData.FactoryId, Date: params.bodyPayload.Date }),
    }
    if (params.bodyPayload.Time) {
      queryParams['Time'] = params.bodyPayload.Time
    }
    let query = SensorData.model.query(queryParams).attributes(['Issues'])
    if (params.bodyPayload.sort) {
      query = query.sort(params.bodyPayload.sort)
    }
    if (params.bodyPayload.limit) {
      query = query.limit(params.bodyPayload.limit)
    }
    const data = await query.exec()
    return data
  }
}
