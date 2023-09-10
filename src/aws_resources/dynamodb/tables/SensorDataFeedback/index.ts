import { v4 as uuidv4 } from 'uuid'
import { constraintChecking__SensorData } from '~aws_resources/dynamodb/middlewares'
import { DynamoDBTable } from '~core/dynamodb'
import { SchemaDefinition, SchemaSettings } from '~core/dynamodb/types'

export interface ISensorDataFeedback {
  FactoryId_Date: string // Partition key: F_aBc1D::2023-07-30
  Hash: string // Sort key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
  Date: string
  Time: string // LSI
  FactoryId: string // F_aBc1D
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
    Status: object
    RecommendationActions: object
    Reliability: number
  }
  Feedback: {
    Status: {
      IsGood: boolean | null
      Suggestions: string[]
      FeedbackDetail: string
    }
    RecommendationActions: {
      IsGood: boolean | null
      Suggestions: string[]
      FeedbackDetail: string
    }
  }
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
  Date: {
    type: String,
    required: true,
  },
  Time: {
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
  Feedback: {
    type: Object,
    schema: {
      Status: {
        type: Object,
        schema: {
          // IsGood: Boolean | Null
          Suggestions: {
            type: Set,
            schema: [String],
          },
          FeedbackDetail: {
            type: String,
          },
        },
      },
      RecommendationActions: {
        type: Object,
        schema: {
          // IsGood: Boolean | Null
          Suggestions: {
            type: Set,
            schema: [String],
          },
          FeedbackDetail: {
            type: String,
          },
        },
      },
    },
  },
}

const schemaSettings: SchemaSettings = {
  saveUnknown: ['Feedback.Status.*', 'Feedback.RecommendationActions.*'],
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
