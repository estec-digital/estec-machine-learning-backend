import { IActionHandlerParams, RestHandler } from '~core/rest-handler/RestHandler'
import { DataService, Types as DataServiceTypes } from '~services/Data'
import * as Types from './types'

class FunctionHandler extends RestHandler<Types.TAllowAction>() {
  protected static setActions() {
    this.restHandler.setAction('get-data', FunctionHandler.getData, ['fromDate', 'toDate'])
  }

  private static async getData(params: IActionHandlerParams<DataServiceTypes.IGetData>) {
    return await DataService.getData(params.bodyPayload)
  }
}

export const main = FunctionHandler.getHandlerFunction()
