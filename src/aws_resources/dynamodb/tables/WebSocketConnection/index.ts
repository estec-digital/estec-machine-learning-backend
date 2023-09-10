import { DynamoDBTable } from '~core/dynamodb'
import { SchemaDefinition, SchemaSettings } from '~core/dynamodb/types'

export interface IWebSocketConnection {
  ConnectionId: string // Partition key: KnNMTcZZyQ0CF2A=
  FactoryId: string
  ConnectedAt: number
  Context: Object
}

export enum EWebSocketConnectionIndexes {
  GSI_FactoryId = 'GSI_FactoryId',
}

const schemaDefinition: SchemaDefinition = {
  ConnectionId: {
    type: String,
    hashKey: true,
  },
  FactoryId: {
    type: String,
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
      indexName: EWebSocketConnectionIndexes.GSI_FactoryId,
      keySchema: [{ attributeName: 'FactoryId', keyType: 'HASH' }],
      projection: {
        projectionType: 'ALL',
      },
    },
  ],
})
