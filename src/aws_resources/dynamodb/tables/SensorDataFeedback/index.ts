import { v4 as uuidv4 } from 'uuid'
import { constraintChecking__SensorData } from '~aws_resources/dynamodb/middlewares'
import { DynamoDBTable } from '~core/dynamodb'
import { SchemaDefinition, SchemaSettings } from '~core/dynamodb/types'
import { ISensorData } from '../SensorData'

export type ISensorDataFeedback = ISensorData & {
  FactoryId_Date: string // Partition key: F_aBc1D::2023-07-30
  Hash: string // Sort key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
  Feedback: object
}

export enum ESensorDataFeedbackIndexes {
  LSI_Time = 'LSI_Time',
}

const schemaDefinition: SchemaDefinition = {
  FactoryId_Date: {
    type: String,
    hashKey: true,
  },
  Hash: {
    type: String,
    rangeKey: true,
    default: () => uuidv4(),
  },
  Time: {
    type: String,
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

  Feedback: {
    type: Object,
  },
}

const schemaSettings: SchemaSettings = {
  saveUnknown: ['Feedback.*', 'Feedback.**'],
  timestamps: {
    createdAt: ['CreatedAt'],
  },
}

export const SensorDataFeedback = new DynamoDBTable<ISensorDataFeedback, ESensorDataFeedbackIndexes>({
  identifier: 'SensorDataFeedback',
  schema: {
    definition: schemaDefinition,
    settings: schemaSettings,
  },
  billing: {
    mode: 'PAY_PER_REQUEST',
  },
  localSecondaryIndexes: [
    {
      indexName: ESensorDataFeedbackIndexes.LSI_Time,
      keySchema: [
        { attributeName: 'FactoryId_Date', keyType: 'HASH' },
        { attributeName: 'Time', keyType: 'RANGE' },
      ],
      projection: {
        projectionType: 'ALL',
      },
    },
  ],
  middlewares: {
    beforeSave(obj) {
      constraintChecking__SensorData('SensorDataFeedback', obj)
    },
  },
})
