import { MEDynamoDBTable } from '~core/dynamodb'
import { MESchemaDefinition, MESchemaSettings } from '~core/dynamodb/types'

export interface ISensorData {
  Date: string
  Time: string
  SensorData: {
    GA01_Oxi?: number
    GA02_Oxi?: number
    GA03_Oxi?: number
    GA04_Oxi?: number
    KilnDriAmp?: number
    KilnInletTemp?: number
    Nox?: number
    Pyrometer?: number
  }
  Prediction: {
    Status: string
    RecommendationActions: string
    Reliability: number
  }
}

export enum ESensorDataIndexes {}

const schemaDefinition: MESchemaDefinition = {
  Date: {
    type: String,
    hashKey: true,
  },
  Time: {
    type: String,
    rangeKey: true,
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
    },
    default: {},
  },
  Prediction: {
    type: Object,
    schema: {
      Status: {
        type: Object,
      },
      RecommendationActions: {
        type: Object,
      },
      Reliability: {
        type: Number,
      },
    },
  },
}

const schemaSettings: MESchemaSettings = {
  saveUnknown: ['Prediction.Status.**', 'Prediction.RecommendationActions.**'],
  timestamps: {
    updatedAt: ['UpdatedAt'],
  },
}

export const SensorData = new MEDynamoDBTable<ISensorData, ESensorDataIndexes>({
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
})
