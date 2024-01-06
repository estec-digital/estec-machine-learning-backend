import { DynamoDBTable } from '~core/dynamodb'
import { SchemaDefinition, SchemaSettings } from '~core/dynamodb/types'
import { ISensorData } from '../SensorData'

export interface IFactory {
  FactoryId: string // Partition key: F_aBc1D
  ThresholdData: {
    [key in keyof ISensorData['SensorData']]: {
      min: number
      max: number
      enableAlert: boolean
    }
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
  },
  Description: {
    type: String,
  },
}

const schemaSettings: SchemaSettings = {
  saveUnknown: ['ThresholdData.**'],
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
