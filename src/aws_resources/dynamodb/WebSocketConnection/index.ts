import { DynamoDBTable } from '~core/dynamodb'
import { SchemaDefinition, SchemaSettings } from '~core/dynamodb/types'

export interface IWebSocketConnection {
  FactoryId: string // Partition key: F_aBc1D
  ConnectionId: string // Sort key: KnNMTcZZyQ0CF2A=
  ConnectedAt: number
  Context: Object
}

export enum EWebSocketConnectionIndexes {
  GSI_ConnectionId = 'GSI_ConnectionId',
}

const schemaDefinition: SchemaDefinition = {
  FactoryId: {
    type: String,
    hashKey: true,
  },
  ConnectionId: {
    type: String,
    rangeKey: true,
  },
  ConnectedAt: {
    type: Number,
  },
  Context: {
    type: Object,
  },
}

const schemaSettings: SchemaSettings = {
  saveUnknown: false,
}

export const WebSocketConnection = new DynamoDBTable<IWebSocketConnection, EWebSocketConnectionIndexes>({
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
  globalSecondaryIndexes: [
    {
      indexName: EWebSocketConnectionIndexes.GSI_ConnectionId,
      keySchema: [{ attributeName: 'ConnectionId', keyType: 'HASH' }],
      projection: {
        projectionType: 'ALL',
      },
    },
  ],
})
