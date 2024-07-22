import { DynamoDBTable } from '~core/dynamodb'
import { SchemaDefinition, SchemaSettings } from '~core/dynamodb/types'

export interface ICache {
  FactoryId: string
  CacheKey: string
  Data: string
}

export enum ECacheIndexes {}

const schemaDefinition: SchemaDefinition = {
  FactoryId: {
    type: String,
    hashKey: true,
    required: true,
  },
  // GSI
  CacheKey: {
    type: String,
    rangeKey: true,
    required: true,
  },
  Data: {
    type: String,
    required: true,
  },
}

const schemaSettings: SchemaSettings = {
  saveUnknown: false,
  timestamps: {
    updatedAt: ['UpdatedAt'],
  },
}

export const Cache = new DynamoDBTable<ICache, ECacheIndexes>({
  identifier: 'Cache',
  schema: {
    definition: schemaDefinition,
    settings: schemaSettings,
  },
  billing: {
    mode: 'PAY_PER_REQUEST',
  },
  globalSecondaryIndexes: [],
})
