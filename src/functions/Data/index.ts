import { IActionHandlerParams, RestHandler } from '~core/rest-handler/RestHandler'
import { DataService, Types as DataServiceTypes } from '~services/Data'
import * as Types from './types'

class FunctionHandler extends RestHandler<Types.TAllowAction>() {
  protected static setActions() {
    this.restHandler.setAction('query-data', FunctionHandler.queryData, ['partition', 'range'])
  }

  private static async queryData(params: IActionHandlerParams<DataServiceTypes.IQuerySensorData>) {
    return await DataService.queryData({ partition: params.bodyPayload.partition, range: params.bodyPayload.range })
  }
}

export const main = FunctionHandler.getHandlerFunction()
