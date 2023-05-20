import * as dynamoose from 'dynamoose'
import { Item } from 'dynamoose/dist/Item'

export class CWebSocketConnection extends Item {
  connectionId: string
  connectedAt: number
  context: Object
}

const webSocketConnectionSchema = new dynamoose.Schema(
  {
    connectionId: {
      type: String,
      hashKey: true,
    },
    connectedAt: {
      type: Number,
    },
    context: {
      type: Object,
    },
  },
  {
    saveUnknown: false,
  },
)

export const WebSocketConnection = dynamoose.model<CWebSocketConnection>(process.env.DYNAMO_DB_TABLE_NAME__WebSocketConnectionTable, webSocketConnectionSchema)
