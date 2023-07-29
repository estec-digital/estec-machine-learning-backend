import { MEDynamoDBTable } from '~core/dynamodb'
import { MESchemaDefinition, MESchemaSettings } from '~core/dynamodb/types'

export interface IUser {
  Username: string
  EncryptedPassword: string
  FirstName: string
  LastName: string
  Email: string
}

export enum EUserIndexes {}

const schemaDefinition: MESchemaDefinition = {
  Username: {
    type: String,
    hashKey: true,
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

const schemaSettings: MESchemaSettings = {
  saveUnknown: false,
  timestamps: {
    createdAt: ['CreatedAt'],
    updatedAt: ['UpdatedAt'],
  },
}

export const User = new MEDynamoDBTable<IUser, EUserIndexes>({
  identifier: 'User',
  schema: {
    definition: schemaDefinition,
    settings: schemaSettings,
  },
  billing: {
    mode: 'PAY_PER_REQUEST',
  },
})
