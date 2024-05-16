import { IRawSensorData } from '~aws_resources/dynamodb/tables'
import { IActionHandlerParams, RestHandler } from '~core/rest-handler/RestHandler'
import { DataService, Types as DataServiceTypes } from '~services/Data'
import { S3Service, S3ServiceTypes } from '~services/S3'
import * as Types from './types'

class FunctionHandler extends RestHandler<Types.TAllowAction>() {
  protected static setActions() {
    // RawDB
    this.restHandler.setAction('raw_db__insert_data', FunctionHandler.rawDBInsertData, ['Date', 'Time'])
    this.restHandler.setAction('raw_db__get_data', FunctionHandler.rawDBGetData, ['Date', 'Time'])
    this.restHandler.setAction('raw_db__query_data', FunctionHandler.rawDBQueryData, ['Date'])

    // AppDB
    this.restHandler.setAction('app_db__get_data', FunctionHandler.appDBGetData, ['Date', 'Time'])
    this.restHandler.setAction('app_db__query_data', FunctionHandler.appDBQueryData, ['Date'])
    this.restHandler.setAction('logs__get_upload_url', FunctionHandler.logsGetUploadUrl, ['Folder'])
    this.restHandler.setAction('app_db__get_data_for_dashboard', FunctionHandler.appDBGetDataForDashboard, [])

    // Threshold
    this.restHandler.setAction('threshold__get_data', FunctionHandler.getThreshold, [])
    this.restHandler.setAction('threshold__update_data', FunctionHandler.updateThreshold, [])
    this.restHandler.setAction('threshold__toggle_enable_alert', FunctionHandler.toggleEnableAlert, ['key', 'enableAlert'])

    // Feedback
    this.restHandler.setAction('feedback__get_feedback_ticket', FunctionHandler.getFeedbackTicket, ['Date', 'Time'])
    this.restHandler.setAction('feedback__save_feedback', FunctionHandler.saveFeedback, ['Date', 'Time', 'Feedback'])
    this.restHandler.setAction('feedback_get_list', FunctionHandler.getListOfFeedbacks, ['From', 'To'])
    this.restHandler.setAction('feedback_get_item', FunctionHandler.getSingleFeedback, ['Date', 'Hash'])

    // Issue
    this.restHandler.setAction('issue__update_acknowledge', FunctionHandler.updateAcknowledge, ['Date', 'Time', 'ID'])
  }

  // RawDB
  private static async rawDBInsertData(params: IActionHandlerParams<IRawSensorData>) {
    return await DataService.rawDBInsertData(params)
  }

  private static async rawDBGetData(params: IActionHandlerParams<DataServiceTypes.IRawDBGetData>) {
    return await DataService.rawDBGetData(params)
  }

  private static async rawDBQueryData(params: IActionHandlerParams<DataServiceTypes.IRawDBQueryData>) {
    return await DataService.rawDBQueryData(params)
  }

  // AppDB
  private static async appDBGetData(params: IActionHandlerParams<DataServiceTypes.IAppDBGetData>) {
    return await DataService.appDBGetData(params)
  }

  private static async appDBQueryData(params: IActionHandlerParams<DataServiceTypes.IAppDBQueryData>) {
    return await DataService.appDBQueryData(params)
  }

  private static async logsGetUploadUrl(params: IActionHandlerParams<S3ServiceTypes.Logs_GetUploadUrl>) {
    const s3Service = new S3Service()
    return await s3Service.logsGetUploadUrl(params.bodyPayload)
  }

  private static async appDBGetDataForDashboard(params: IActionHandlerParams) {
    return await DataService.appDBGetDataForDashboard(params)
  }

  // Threshold
  private static async getThreshold(params: IActionHandlerParams) {
    return await DataService.getFactoryData(params)
  }

  private static async updateThreshold(params: IActionHandlerParams<DataServiceTypes.IUpdateThreshold>) {
    return await DataService.updateFactoryData(params)
  }

  private static async toggleEnableAlert(params: IActionHandlerParams<DataServiceTypes.IToggleEnableAlert>) {
    return await DataService.toggleEnableAlert(params)
  }

  // Feedback
  private static async getFeedbackTicket(params: IActionHandlerParams<DataServiceTypes.IGetFeedbackTicket>) {
    return await DataService.getFeedbackTicket(params)
  }

  private static async saveFeedback(params: IActionHandlerParams<DataServiceTypes.ISaveFeedback>) {
    return await DataService.saveFeedback(params)
  }

  private static async getListOfFeedbacks(params: IActionHandlerParams<DataServiceTypes.IGetListOfFeedbacks>) {
    return await DataService.getListOfFeedbacks(params)
  }

  private static async getSingleFeedback(params: IActionHandlerParams<DataServiceTypes.IGetSingleFeedback>) {
    return await DataService.getSingleFeedback(params)
  }

  // Issue
  private static async updateAcknowledge(params: IActionHandlerParams<DataServiceTypes.IIssueUpdateAcknowledge>) {
    return await DataService.updateAcknowledge(params)
  }
}

export const main = FunctionHandler.getHandlerFunction()
