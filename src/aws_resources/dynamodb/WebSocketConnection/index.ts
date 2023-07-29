import { MEDynamoDBTable } from '~core/dynamodb'
import { MESchemaDefinition, MESchemaSettings } from '~core/dynamodb/types'

export interface IWebSocketConnection {
  ConnectionId: string
  ConnectedAt: number
  Context: Object
}

export enum EWebSocketConnectionIndexes {}

const schemaDefinition: MESchemaDefinition = {
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
}

const schemaSettings: MESchemaSettings = {
  saveUnknown: false,
}

export const WebSocketConnection = new MEDynamoDBTable<IWebSocketConnection, EWebSocketConnectionIndexes>({
  identifier: 'WebSocketConnection',
  schema: {
    definition: schemaDefinition,
    settings: schemaSettings,
  },
  billing: {
    mode: 'PAY_PER_REQUEST',
  },
  stream: {
    streamViewType: 'NEW_AND_OLD_IMAGES',
  },
})
