import { v4 as uuidv4 } from 'uuid'
import { MEDynamoDBTable } from '~core/dynamodb'
import { MESchemaDefinition, MESchemaSettings } from '~core/dynamodb/types'

export interface ISensorDataFeedback {
  Date: string
  Hash: string
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

export enum ESensorDataFeedbackIndexes {}

const schemaDefinition: MESchemaDefinition = {
  Date: {
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
    // hashKey: true,
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
          // IsGood: {
          //   type: Boolean,
          // }, // allow Boolean and null
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
          // IsGood: {
          //   type: Boolean,
          // }, // allow Boolean and null
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

const schemaSettings: MESchemaSettings = {
  saveUnknown: ['Feedback.Status.*', 'Feedback.RecommendationActions.*'],
  timestamps: {
    createdAt: ['CreatedAt'],
  },
}

export const SensorDataFeedback = new MEDynamoDBTable<ISensorDataFeedback, ESensorDataFeedbackIndexes>({
  identifier: 'SensorDataFeedback',
  schema: {
    definition: schemaDefinition,
    settings: schemaSettings,
  },
  billing: {
    mode: 'PAY_PER_REQUEST',
  },
})
