import { DynamoDBStreamHandler } from 'aws-lambda'
import { WebSocketService } from '~services/WebSocket'

export const main: DynamoDBStreamHandler = async (event, context) => {
  try {
    for (const record of event.Records) {
      // Process each record in the DynamoDB stream
      if (record.eventName === 'INSERT') {
        const connectionId = record.dynamodb?.Keys.connectionId?.S
        if (connectionId) {
          await WebSocketService.getAPIGatewayManagementApiInstance()
            .postToConnection({
              ConnectionId: record.dynamodb?.Keys.connectionId?.S,
              Data: JSON.stringify({ message: `Welcome ${connectionId}` }),
            })
            .promise()
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}
