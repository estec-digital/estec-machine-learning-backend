import { APIGatewayProxyResult } from 'aws-lambda'
import * as lodash from 'lodash'
import HttpStatusCode from '~core/enums/http-status.enum'
import { formatJSONErrorResponse, formatJSONSuccessResponse } from '~core/lambda/api-gateway'
import { middyfy } from '~core/lambda/lambda'
import { filterAllRequiredKeysInObject } from '~core/utils'
import { applyPolyfillsToSystem } from '~core/utils/polyfill'
import { TJwtAuthData } from '~services/Auth/types'

applyPolyfillsToSystem()

type TActions<TActionName> = {
  [key in TActionName as string]?: () => void
}

type TRequiredKeysInPayload<TActionName> = {
  [key in TActionName as string]?: string[]
}

export interface IActionHandlerParams<TBodyPayload = any> {
  event: any
  context: any
  bodyPayload: TBodyPayload
  authData: TJwtAuthData
}

class RestHandlerWithActionAndPayload<TActionName> {
  private actions: TActions<TActionName> = {}
  private requiredKeysInPayload: TRequiredKeysInPayload<TActionName> = {}
  private event
  private context
  private returnJson: any = {}

  public constructor(event, context) {
    this.event = event
    this.context = context
  }

  public setAction(action: TActionName, handler: (params) => any, requiredKeysInPayload: string[] = [], isReturnJson = true) {
    lodash.set(this.actions, action as unknown as string, handler)
    lodash.set(this.requiredKeysInPayload, action as unknown as string, requiredKeysInPayload)
    lodash.set(this.returnJson, action as unknown as string, isReturnJson)
  }

  public async run(): Promise<APIGatewayProxyResult> {
    try {
      const actionName = lodash.get(this.event, 'body.action')
      const payload = lodash.get(this.event, 'body.payload')
      const handler: (params) => any = lodash.get(this.actions, actionName) as unknown as () => {}
      if (!handler) {
        throw new Error('Invalid action!')
      }
      const requiredKeysInPayload: string[] = this.requiredKeysInPayload[actionName] ?? []

      const _filterAllRequiredKeysInObject = filterAllRequiredKeysInObject(payload, requiredKeysInPayload)

      if (_filterAllRequiredKeysInObject.missingKeys.length > 0) {
        throw new Error('Missing required params! - Required: ' + _filterAllRequiredKeysInObject.missingKeys.join(', '))
      }
      const strAuthData = this.event?.requestContext?.authorizer?.authData
      const actionHandlerParams: IActionHandlerParams = {
        event: this.event,
        context: this.context,
        bodyPayload: this.event?.body?.payload ?? {},
        authData: (strAuthData ? JSON.parse(strAuthData) : undefined) as TJwtAuthData,
      }
      const result = await handler(actionHandlerParams)

      const isReturnJson = lodash.get(this.returnJson, actionName)

      if (isReturnJson) {
        return formatJSONSuccessResponse({
          body: result,
          statusCode: HttpStatusCode.OK,
        })
      } else {
        return result
      }
    } catch (error) {
      return formatJSONErrorResponse({
        body: error,
        statusCode: HttpStatusCode.BAD_REQUEST,
      })
    }
  }
}

export function RestHandler<TAllowAction>() {
  class _RestHandler {
    protected static restHandler: RestHandlerWithActionAndPayload<TAllowAction>

    protected static setActions() {}

    public static getHandlerFunction() {
      const handlerFunction = async (event, context) => {
        this.restHandler = new RestHandlerWithActionAndPayload<TAllowAction>(lodash.cloneDeep(event), lodash.cloneDeep(context))

        this.setActions()

        return await this.restHandler.run()
      }
      return middyfy(handlerFunction)
    }
  }
  return _RestHandler
}
