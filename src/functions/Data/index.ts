import { IActionHandlerParams, RestHandler } from '~core/rest-handler/RestHandler'
import { CSensorData } from '~root/dynamodb/schema/SensorDataTable'
import { DataService, Types as DataServiceTypes } from '~services/Data'
import * as Types from './types'

class FunctionHandler extends RestHandler<Types.TAllowAction>() {
  protected static setActions() {
    this.restHandler.setAction('get-data', FunctionHandler.getData, ['date', 'time'])
    this.restHandler.setAction('query-data', FunctionHandler.queryData, ['partition', 'range'])
    this.restHandler.setAction('put-data', FunctionHandler.putData, ['date', 'time'])
    this.restHandler.setAction('insert-data', FunctionHandler.insertData, ['date', 'time'])
    this.restHandler.setAction('update-prediction', FunctionHandler.updatePrediction, ['date', 'time', 'prediction'])
  }

  private static async getData(params: IActionHandlerParams<DataServiceTypes.IGetData>) {
    return await DataService.getData(params.bodyPayload)
  }

  private static async queryData(params: IActionHandlerParams<DataServiceTypes.IQuerySensorData>) {
    return await DataService.queryData(params.bodyPayload)
  }

  private static async putData(params: IActionHandlerParams<CSensorData>) {
    return await DataService.putData(params.bodyPayload)
  }

  private static async insertData(params: IActionHandlerParams<CSensorData>) {
    return await DataService.insertData(params.bodyPayload)
  }

  private static async updatePrediction(params: IActionHandlerParams<DataServiceTypes.IUpdatePrediction>) {
    return await DataService.updatePrediction(params.bodyPayload)
  }
}

export const main = FunctionHandler.getHandlerFunction()
