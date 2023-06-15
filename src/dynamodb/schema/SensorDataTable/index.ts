import * as dynamoose from 'dynamoose'
import { Item } from 'dynamoose/dist/Item'

export class CSensorData extends Item {
  date: string
  time: string
  pyrometer: number
  nOx_GA01: number
  oxi_GA01: number
  kiln_inlet_temp: number
  prediction: {
    status: string
    description: string
  }
}

const sensorDataSchema = new dynamoose.Schema(
  {
    date: {
      type: String,
      hashKey: true,
    },
    time: {
      type: String,
      rangeKey: true,
    },
    pyrometer: {
      type: Number,
    },
    nOx_GA01: {
      type: Number,
    },
    oxi_GA01: {
      type: Number,
    },
    kiln_inlet_temp: {
      type: Number,
    },
    prediction: {
      type: Object,
      schema: {
        status: {
          type: String,
        },
        description: {
          type: String,
        },
      },
    },
  },
  {
    saveUnknown: false,
    timestamps: {
      // createdAt: ['createdAt'],
      updatedAt: ['updatedAt'],
    },
  },
)

export const SensorData = dynamoose.model<CSensorData>(process.env.DYNAMO_DB_TABLE_NAME__SensorDataTable, sensorDataSchema)
