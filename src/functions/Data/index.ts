import { IActionHandlerParams, RestHandler } from '~core/rest-handler/RestHandler'
import { CRawData } from '~root/dynamodb/schema/RawDataTable'
import { DataService, Types as DataServiceTypes } from '~services/Data'
import * as Types from './types'

class FunctionHandler extends RestHandler<Types.TAllowAction>() {
  protected static setActions() {
    this.restHandler.setAction('insert-raw-data', FunctionHandler.insertRawData, ['Date', 'Time'])
    this.restHandler.setAction('query-sensor-data', FunctionHandler.querySensorData, ['partition', 'range'])
  }

  private static async insertRawData(params: IActionHandlerParams<CRawData>) {
    return await DataService.insertRawData(params.bodyPayload)
  }
  private static async querySensorData(params: IActionHandlerParams<DataServiceTypes.IQuerySensorData>) {
    return await DataService.querySensorData(params.bodyPayload)
  }
}

export const main = FunctionHandler.getHandlerFunction()
