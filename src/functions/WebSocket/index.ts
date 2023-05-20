import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda'
import { WebSocketService } from '~services/WebSocket'

export const main: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event, context) => {
  const { routeKey } = event.requestContext
  switch (routeKey) {
    case '$connect': {
      await WebSocketService.connect(event, context)
      break
    }
    case '$disconnect': {
      await WebSocketService.disconnect(event, context)
      break
    }
    case '$default': {
      await WebSocketService.default(event, context)
      break
    }
  }

  return {
    statusCode: 200,
    body: 'OK',
  }
}
