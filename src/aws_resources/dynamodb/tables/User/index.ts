import { DynamoDBTable } from '~core/dynamodb'
import { SchemaDefinition, SchemaSettings } from '~core/dynamodb/types'

export interface IUser {
  Username: string // Partition key
  FactoryId: string // GSI: F_aBc1D
  EncryptedPassword: string
  FirstName: string
  LastName: string
  Email: string
}

export enum EUserIndexes {
  GSI_FactoryId = 'GSI_FactoryId',
}

const schemaDefinition: SchemaDefinition = {
  Username: {
    type: String,
    hashKey: true,
  },
  // GSI
  FactoryId: {
    type: String,
  },
  EncryptedPassword: {
    type: String,
  },
  FirstName: {
    type: String,
  },
  LastName: {
    type: String,
  },
  Email: {
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

export const User = new DynamoDBTable<IUser, EUserIndexes>({
  identifier: 'User',
  schema: {
    definition: schemaDefinition,
    settings: schemaSettings,
  },
  billing: {
    mode: 'PAY_PER_REQUEST',
  },
  globalSecondaryIndexes: [
    {
      indexName: EUserIndexes.GSI_FactoryId,
      keySchema: [{ attributeName: 'FactoryId', keyType: 'HASH' }],
      projection: {
        projectionType: 'ALL',
      },
    },
  ],
})
