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

  _G1PJ01MCH02T8201_TIA_IO_Signal_Value: number
  '4G1PS01GPJ02_T8201_AVG'?: number
  '4R1GQ01JNT01_T8201_AVG'?: number
  '41KP01DRV01_SP_AVG'?: number
  SZ_Coal_Setpt_AVG?: number
  PC_Coal_setpt_AVG?: number
  '4G1FN01DRV01_M1001_SI_AVG'?: number
  '4K1KP01DRV01_Speed_AVG'?: number
  Actual_KF?: number
  BZTL_AVG?: number
  Kilnfeed_SP_Total_AVG?: number
  Ratio_PC_AVG?: number
  Result_AHC_AVG?: number

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
  _G1PJ01MCH02T8201_TIA_IO_Signal_Value: {
    type: Number,
  },
  '4G1PS01GPJ02_T8201_AVG': {
    type: Number,
  },
  '4R1GQ01JNT01_T8201_AVG': {
    type: Number,
  },
  '41KP01DRV01_SP_AVG': {
    type: Number,
  },
  SZ_Coal_Setpt_AVG: {
    type: Number,
  },
  PC_Coal_setpt_AVG: {
    type: Number,
  },
  '4G1FN01DRV01_M1001_SI_AVG': {
    type: Number,
  },
  '4K1KP01DRV01_Speed_AVG': {
    type: Number,
  },
  Actual_KF: {
    type: Number,
  },
  BZTL_AVG: {
    type: Number,
  },
  Kilnfeed_SP_Total_AVG: {
    type: Number,
  },
  Ratio_PC_AVG: {
    type: Number,
  },
  Result_AHC_AVG: {
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
