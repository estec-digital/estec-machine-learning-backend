import * as dynamoose from 'dynamoose'
import { Item } from 'dynamoose/dist/Item'

export class CWebSocketConnection extends Item {
  ConnectionId: string
  ConnectedAt: number
  Context: Object
}

const webSocketConnectionSchema = new dynamoose.Schema(
  {
    ConnectionId: {
      type: String,
      hashKey: true,
    },
    ConnectedAt: {
      type: Number,
    },
    Context: {
      type: Object,
    },
  },
  {
    saveUnknown: false,
  },
)

export const WebSocketConnection = dynamoose.model<CWebSocketConnection>(process.env.DYNAMO_DB_TABLE_NAME__WebSocketConnectionTable, webSocketConnectionSchema)
