import { MEDynamoDBTable } from '~core/dynamodb'
import { MESchemaDefinition, MESchemaSettings } from '~core/dynamodb/types'

export interface IRawData {
  Date: string // YYYY-DD-MM
  Time: string // HH:mm:ss
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

export enum ERawDataIndexes {}

const schemaDefinition: MESchemaDefinition = {
  Date: {
    type: String,
    hashKey: true,
  },
  Time: {
    type: String,
    rangeKey: true,
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

const schemaSettings: MESchemaSettings = {
  timestamps: {
    updatedAt: ['UpdatedAt'],
  },
}

export const RawData = new MEDynamoDBTable<IRawData, ERawDataIndexes>({
  identifier: 'RawData',
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
})
