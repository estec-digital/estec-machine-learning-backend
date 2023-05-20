import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { WebSocketConnection } from '~db_nosql/schema/WebSocketConnectionTable'

const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
  apiVersion: '2018-11-29',
  endpoint: process.env.WEBSOCKET_HTTPS_ENDPOINT,
})

export class WebSocketService {
  public static async connect(event: APIGatewayProxyEvent, context: Context) {
    await WebSocketConnection.create({
      connectionId: event.requestContext.connectionId,
      connectedAt: event.requestContext.connectedAt,
      context: event.requestContext,
    })

    return true
  }

  public static async disconnect(event: APIGatewayProxyEvent, context: Context) {
    return await WebSocketConnection.delete(event.requestContext.connectionId)
  }

  public static async default(event: APIGatewayProxyEvent, context: Context) {
    return 123
  }

  public static getAPIGatewayManagementApiInstance() {
    return apiGatewayManagementApi
  }
}
