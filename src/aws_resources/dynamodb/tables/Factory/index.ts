import { DynamoDBTable } from '~core/dynamodb'
import { SchemaDefinition, SchemaSettings } from '~core/dynamodb/types'

export interface IFactory {
  FactoryId: string // Partition key: F_aBc1D
  ThresholdData: {
    Pyrometer_Min: number
    Pyrometer_Max: number
    BET_Min: number
    BET_Max: number
    KilnDriAmp_Min: number
    KilnDriAmp_Max: number
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
        default: 0,
      },
      Pyrometer_Max: {
        type: Number,
        default: 0,
      },
      BET_Min: {
        type: Number,
        default: 0,
      },
      BET_Max: {
        type: Number,
        default: 0,
      },
      KilnDriAmp_Min: {
        type: Number,
        default: 0,
      },
      KilnDriAmp_Max: {
        type: Number,
        default: 0,
      },
      GA01_Min: {
        type: Number,
        default: 0,
      },
      GA01_Max: {
        type: Number,
        default: 0,
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
