import * as dynamoose from 'dynamoose'
import { Item } from 'dynamoose/dist/Item'

export class CSensorData extends Item {
  Date: string
  Time: string
  SensorData: {
    GA01_Oxi: number
    GA02_Oxi: number
    GA03_Oxi: number
    GA04_Oxi: number
    KilnDriAmp: number
    KilnInletTemp: number
    Nox: number
    Pyrometer: number
  }
  Prediction: {
    Status: string
    Description: string
  }
}

const sensorDataSchema = new dynamoose.Schema(
  {
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
    },
    Prediction: {
      type: Object,
      schema: {
        Status: {
          type: String,
        },
        Description: {
          type: String,
        },
      },
    },
  },
  {
    saveUnknown: false,
    timestamps: {
      updatedAt: ['UpdatedAt'],
    },
  },
)

export const SensorData = dynamoose.model<CSensorData>(process.env.DYNAMO_DB_TABLE_NAME__SensorDataTable, sensorDataSchema)
