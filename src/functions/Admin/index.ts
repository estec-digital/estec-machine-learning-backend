import { IActionHandlerParams, RestHandler } from '~core/rest-handler/RestHandler'
import { AdminService } from '~services/Admin'
import * as AdminServiceTypes from '~services/Admin/types'
import * as Types from './types'

class FunctionHandler extends RestHandler<Types.TAllowAction>() {
  protected static setActions() {
    // Database Action
    this.restHandler.setAction('init-data-to-db', FunctionHandler.initDataToDB, [])
  }

  private static async initDataToDB(params: IActionHandlerParams<AdminServiceTypes.IInitDataToDB>) {
    return await AdminService.initDataToDB(params.bodyPayload)
  }
}

export const main = FunctionHandler.getHandlerFunction()
