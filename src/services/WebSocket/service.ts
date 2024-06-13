import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { WebSocketConnection } from '~aws_resources/dynamodb/tables'
import { TJwtAuthUserInfo } from '~services/Auth/types'
import * as Types from './types'

const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
  apiVersion: '2018-11-29',
  endpoint: process.env.WEBSOCKET_HTTPS_ENDPOINT,
})

export class WebSocketService {
  public static async connect(event: APIGatewayProxyEvent, context: Context) {
    const authData = JSON.parse(event.requestContext?.authorizer?.authData ?? '{}') as TJwtAuthUserInfo
    if (Object.keys(authData).length > 0) {
      await WebSocketConnection.model.create({
        ConnectionId: event.requestContext.connectionId,
        FactoryId: authData.FactoryId,
        ConnectedAt: event.requestContext.connectedAt,
        Context: event.requestContext,
      })
    } else {
      throw new Error('Unauthorized - No auth data!')
    }

    return true
  }

  public static async disconnect(event: APIGatewayProxyEvent, context: Context) {
    return await WebSocketConnection.model.delete({ ConnectionId: event.requestContext.connectionId })
  }

  public static async default(event: APIGatewayProxyEvent, context: Context) {
    return 123
  }

  private static async handlePostFailed(connectionId: string, error: any) {
    await WebSocketConnection.model.delete({ ConnectionId: connectionId })
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log(`Connection id: "${connectionId}" is closed or not found.`)
    } else {
      console.error('Error sending message:', error)
    }
  }

  public static async postData(params: Types.TPostData): Promise<boolean> {
    try {
      switch (params.type) {
        case 'POST_TO_SINGLE_CONNECTION': {
          const data = await params.data()
          console.log({ POST_TO_SINGLE_CONNECTION: { connectionId: params.connectionId, data } })
          try {
            await apiGatewayManagementApi.send(
              new PostToConnectionCommand({
                ConnectionId: params.connectionId,
                Data: JSON.stringify(data),
              }),
            )
          } catch (error) {
            await WebSocketConnection.model.delete({ ConnectionId: params.connectionId })
            if (error.statusCode === 410 || error.statusCode === 404) {
              console.log(`Connection id: "${params.connectionId}" is closed or not found.`)
            } else {
              console.error('Error sending message:', error)
            }
            await this.handlePostFailed(params.connectionId, error)
          }
          return true
        }
        case 'POST_TO_ALL_CONNECTIONS': {
          const connections = await WebSocketConnection.model.scan().exec()
          const data = await params.data()
          for (const connection of connections) {
            try {
              await apiGatewayManagementApi.send(new PostToConnectionCommand({ ConnectionId: connection.ConnectionId, Data: JSON.stringify(data) }))
            } catch (error) {
              await this.handlePostFailed(connection.ConnectionId, error)
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
