import { IActionHandlerParams, RestHandler } from '~core/rest-handler/RestHandler'
import * as Types from './types'

class FunctionHandler extends RestHandler<Types.TAllowAction>() {
  protected static setActions() {
    this.restHandler.setAction('hello', FunctionHandler.hello, [])
  }

  private static async hello(params: IActionHandlerParams<any>) {
    return 'Hello'
  }
}

export const main = FunctionHandler.getHandlerFunction()
