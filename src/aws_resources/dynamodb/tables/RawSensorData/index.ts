import { constraintChecking__SensorData } from '~aws_resources/dynamodb/middlewares'
import { DynamoDBTable } from '~core/dynamodb'
import { SchemaDefinition, SchemaSettings } from '~core/dynamodb/types'

export interface IRawSensorData {
  FactoryId_Date: string // Partition key: F_aBc1D::2023-07-30
  Time: string // Sort key: 19:35:18
  Date: string
  FactoryId: string // F_aBc1D
  '4G1GA01XAC01_NO_AVG'?: number
  '4G1GA01XAC01_O2_AVG'?: number
  '4G1GA02XAC01_O2_AVG'?: number
  '4G1GA03XAC01_O2_AVG'?: number
  '4G1GA04XAC01_O2_AVG'?: number
  '4G1KJ01JST00_T8401_AVG'?: number
  '4K1KP01DRV01_M2001_EI_AVG'?: number
  '4K1KP01KHE01_B8701_AVG'?: number

  note: {
    triggedFnProcessDataToAppDB: boolean
  }
}

export enum ERawSensorDataIndexes {}

const schemaDefinition: SchemaDefinition = {
  FactoryId_Date: {
    type: String,
    hashKey: true,
  },
  Time: {
    type: String,
    rangeKey: true,
  },
  Date: {
    type: String,
    required: true,
  },
  FactoryId: {
    type: String,
    required: true,
  },
  '4G1GA01XAC01_NO_AVG': {
    type: Number,
  },
  '4G1GA01XAC01_O2_AVG': {
    type: Number,
  },
  '4G1GA02XAC01_O2_AVG': {
    type: Number,
  },
  '4G1GA03XAC01_O2_AVG': {
    type: Number,
  },
  '4G1GA04XAC01_O2_AVG': {
    type: Number,
  },
  '4G1KJ01JST00_T8401_AVG': {
    type: Number,
  },
  '4K1KP01DRV01_M2001_EI_AVG': {
    type: Number,
  },
  '4K1KP01KHE01_B8701_AVG': {
    type: Number,
  },
  note: {
    type: Object,
    schema: {
      triggedFnProcessDataToAppDB: {
        type: Boolean,
      },
    },
    default: {
      triggedFnProcessDataToAppDB: false,
    },
  },
}

const schemaSettings: SchemaSettings = {
  timestamps: {
    updatedAt: ['UpdatedAt'],
  },
}

export const RawSensorData = new DynamoDBTable<IRawSensorData, ERawSensorDataIndexes>({
  identifier: 'RawSensorData',
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
  middlewares: {
    beforeSave(obj) {
      constraintChecking__SensorData('RawSensorData', obj)
    },
  },
})
