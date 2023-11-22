import { DynamoDBTable } from '~core/dynamodb'
import { SchemaDefinition, SchemaSettings } from '~core/dynamodb/types'

export interface IFactory {
  FactoryId: string // Partition key: F_aBc1D
  ThresholdData: {
    Pyrometer_Min: number
    Pyrometer_Max: number
    BET_Min: number
    BET_Max: number
    Load_Min: number
    Load_Max: number
    GA01_Min: number
    GA01_Max: number
  }
  Description: string
}

export enum EFactoryIndexes {}

const schemaDefinition: SchemaDefinition = {
  FactoryId: {
    type: String,
    hashKey: true,
  },
  ThresholdData: {
    type: Object,
    schema: {
      Pyrometer_Min: {
        type: Number,
      },
      Pyrometer_Max: {
        type: Number,
      },
      BET_Min: {
        type: Number,
      },
      BET_Max: {
        type: Number,
      },
      Load_Min: {
        type: Number,
      },
      Load_Max: {
        type: Number,
      },
      GA01_Min: {
        type: Number,
      },
      GA01_Max: {
        type: Number,
      },
    },
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
