import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { WebSocketConnection } from '~root/dynamodb/schema/WebSocketConnectionTable'
import * as Types from './types'

const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
  apiVersion: '2018-11-29',
  endpoint: process.env.WEBSOCKET_HTTPS_ENDPOINT,
})

export class WebSocketService {
  public static async connect(event: APIGatewayProxyEvent, context: Context) {
    await WebSocketConnection.create({
      ConnectionId: event.requestContext.connectionId,
      ConnectedAt: event.requestContext.connectedAt,
      Context: event.requestContext,
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

  public static async postData(params: Types.TPostData): Promise<boolean> {
    try {
      switch (params.type) {
        case 'POST_TO_SINGLE_CONNECTION': {
          await WebSocketService.getAPIGatewayManagementApiInstance()
            .postToConnection({ ConnectionId: params.connectionId, Data: JSON.stringify(params.data) })
            .promise()
          return true
        }
        case 'POST_TO_ALL_CONNECTIONS': {
          const connections = await WebSocketConnection.scan().exec()
          for (const connection of connections) {
            try {
              await WebSocketService.getAPIGatewayManagementApiInstance()
                .postToConnection({ ConnectionId: connection.ConnectionId, Data: JSON.stringify(params.data) })
                .promise()
            } catch (error) {
              await WebSocketConnection.batchDelete([{ connectionId: connection.ConnectionId }])
              if (error.statusCode === 410 || error.statusCode === 404) {
                console.log(`Connection id: "${connection.ConnectionId}" is closed or not found.`)
              } else {
                console.error('Error sending message:', error)
              }
            }
          }
          return true
        }
        default: {
          console.log('postData > Invalid params.type')
          return false
        }
      }
    } catch (error) {
      console.log('Error: ', error)
      return false
    }
  }
}
