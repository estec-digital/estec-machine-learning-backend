import { constraintChecking__SensorData } from '~aws_resources/dynamodb/middlewares'
import { DynamoDBTable } from '~core/dynamodb'
import { SchemaDefinition, SchemaSettings } from '~core/dynamodb/types'
export interface ISensorData {
  FactoryId_Date: string // Partition key: F_aBc1D::2023-07-30
  Time: string // Sort key: 19:35:18
  Date: string
  FactoryId: string // F_aBc1D
  SensorData: {
    GA01_Oxi?: number
    GA02_Oxi?: number
    GA03_Oxi?: number
    // GA04_Oxi?: number
    KilnDriAmp?: number
    KilnInletTemp?: number
    // Nox?: number
    Pyrometer?: number
    MaterialTowerHeat?: number
    TowerOilTemp?: number
    RecHeadTemp?: number
    FurnaceSpeedSP?: number
    CoalSP?: number
    AlternativeCoalSP?: number
    FanSP?: number
    FurnaceSpeed?: number
    ActualFuel?: number
    AvgBZT?: number
    ActualFuelSP?: number
    HeatReplaceRatio?: number
    TotalHeatConsumption?: number
    Fan_4S1?: number
    Kilnhood_Pressure?: number
    Thermal_Exhaust?: number
    Fan_4E1_Valve_Open_Close_Degree?: number
    '4E1GP1JST01_Pressure'?: number
    Valve_Open_Degree?: number
    Actual_Feed_Rate_PC?: number
    Coal_Blower_Pressure_01?: number
    Actual_Feed_Rate_SZ?: number
    Coal_Blower_Pressure_02?: number
    Fabric_Scale?: number
    Temperature_C1?: number
    Temperature_C2?: number
    Temperature_C3?: number
    Hydraulic_Pressure?: number
    Conveyor_Flow_Rate_01?: number
    Conveyor_Flow_Rate_02?: number

    CaO_f?: number
    S03_hot_meal?: number
  }
  Prediction: null | {
    GeneralStatus?: string
    RecommendationActions?: {
      [key in keyof ISensorData['SensorData']]?: number
    }
    StatusInDetails?: {
      [key in keyof ISensorData['SensorData']]?: string
    }
  }
  PastTrendData: Partial<ISensorData['SensorData'] | null>[]
  Trending: Partial<ISensorData['SensorData'] | null>[]
}

export enum ESensorDataIndexes {}

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
  SensorData: {
    type: Object,
    default: {},
  },

  // Prediction: Nullable object

  // Trending: Nullable array
}

const schemaSettings: SchemaSettings = {
  saveUnknown: ['SensorData.*', 'Prediction.*', 'Prediction.**', 'Trending.*', 'Trending.**', 'PastTrendData.*', 'PastTrendData.**'],
  timestamps: {
    updatedAt: ['UpdatedAt'],
  },
}

export const SensorData = new DynamoDBTable<ISensorData, ESensorDataIndexes>({
  identifier: 'SensorData',
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
      constraintChecking__SensorData('SensorData', obj)
    },
  },
})
