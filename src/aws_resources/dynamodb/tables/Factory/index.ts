import { DynamoDBTable } from '~core/dynamodb'
import { SchemaDefinition, SchemaSettings } from '~core/dynamodb/types'

export interface IFactory {
  FactoryId: string // Partition key: F_aBc1D
  Description: string
}

export enum EFactoryIndexes {}

const schemaDefinition: SchemaDefinition = {
  FactoryId: {
    type: String,
    hashKey: true,
  },
  Description: {
    type: String,
  },
}

const schemaSettings: SchemaSettings = {
  saveUnknown: false,
  timestamps: {
    createdAt: ['CreatedAt'],
    updatedAt: ['UpdatedAt'],
  },
}

export const Factory = new DynamoDBTable<IFactory, EFactoryIndexes>({
  identifier: 'Factory',
  schema: {
    definition: schemaDefinition,
    settings: schemaSettings,
  },
  billing: {
    mode: 'PAY_PER_REQUEST',
  },
})
