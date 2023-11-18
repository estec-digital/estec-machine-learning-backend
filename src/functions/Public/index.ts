import { IActionHandlerParams, RestHandler } from '~core/rest-handler/RestHandler'
import { DataService } from '~services/Data'
import * as Types from './types'

class FunctionHandler extends RestHandler<Types.TAllowAction>() {
  protected static setActions() {
    this.restHandler.setAction('text-to-speech', FunctionHandler.textToSpeech, [])
  }

  private static async textToSpeech(params: IActionHandlerParams<any>) {
    return await DataService.rawDBInsertData(params)
  }
}

export const main = FunctionHandler.getHandlerFunction()
