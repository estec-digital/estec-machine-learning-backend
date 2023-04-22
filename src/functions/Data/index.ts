import { IActionHandlerParams, RestHandler } from '~core/rest-handler/RestHandler'
import { AuthService, Types as AuthServiceTypes } from '~services/Auth'
import * as Types from './types'

class FunctionHandler extends RestHandler<Types.TAllowAction>() {
  protected static setActions() {
    // Database Action
    // Auth
    this.restHandler.setAction('register', FunctionHandler.register, ['username', 'password'])
    this.restHandler.setAction('login', FunctionHandler.login, ['username', 'password'])
  }

  private static async register(params: IActionHandlerParams<AuthServiceTypes.IRegister>) {
    return await AuthService.register(params.bodyPayload)
  }

  private static async login(params: IActionHandlerParams<AuthServiceTypes.ILogin>) {
    return await AuthService.login(params.bodyPayload)
  }
}

export const main = FunctionHandler.getHandlerFunction()
