import { IRawSensorData } from '~aws_resources/dynamodb/tables'
import { IActionHandlerParams, RestHandler } from '~core/rest-handler/RestHandler'
import { DataService, Types as DataServiceTypes } from '~services/Data'
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
    this.restHandler.setAction('app_db__add_feedback', FunctionHandler.addFeedback, ['Date', 'Time', 'SensorData', 'Prediction', 'Feedback'])
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

  private static async addFeedback(params: IActionHandlerParams<DataServiceTypes.IAddFeedback>) {
    return await DataService.addFeedback(params)
  }
}

export const main = FunctionHandler.getHandlerFunction()
