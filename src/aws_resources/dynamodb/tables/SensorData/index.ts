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
  }
  Prediction: null | {
    GeneralStatus?: string
    RecommendationActions?: {
      [key in keyof ISensorData['SensorData']]?: string
    }
    StatusInDetails?: {
      [key in keyof ISensorData['SensorData']]?: string
    }
  }
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
    schema: {
      GA01_Oxi: {
        type: Number,
      },
      GA02_Oxi: {
        type: Number,
      },
      GA03_Oxi: {
        type: Number,
      },
      GA04_Oxi: {
        type: Number,
      },
      KilnDriAmp: {
        type: Number,
      },
      KilnInletTemp: {
        type: Number,
      },
      Nox: {
        type: Number,
      },
      Pyrometer: {
        type: Number,
      },

      MaterialTowerHeat: {
        type: Number,
      },
      TowerOilTemp: {
        type: Number,
      },
      RecHeadTemp: {
        type: Number,
      },
      FurnaceSpeedSP: {
        type: Number,
      },
      CoalSP: {
        type: Number,
      },
      AlternativeCoalSP: {
        type: Number,
      },
      FanSP: {
        type: Number,
      },
      FurnaceSpeed: {
        type: Number,
      },
      ActualFuel: {
        type: Number,
      },
      AvgBZT: {
        type: Number,
      },
      ActualFuelSP: {
        type: Number,
      },
      HeatReplaceRatio: {
        type: Number,
      },
      TotalHeatConsumption: {
        type: Number,
      },
    },
    default: {},
  },

  // Prediction: Nullable object

  // Trending: Nullable array
}

const schemaSettings: SchemaSettings = {
  saveUnknown: ['Prediction.*', 'Prediction.**', 'Trending.*', 'Trending.**'],
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
