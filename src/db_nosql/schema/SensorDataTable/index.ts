import * as dynamoose from 'dynamoose'
import { Item } from 'dynamoose/dist/Item'
import { CPredictionLabel, PredictionLabel } from '../PredictionLabelTable'

export class CSensorData extends Item {
  date: string
  time: string
  pyrometer: number
  nOx_GA01: number
  oxi_GA01: number
  kiln_inlet_temp: number
  labelId: number
  Label: CPredictionLabel
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
    labelId: {
      type: Number,
    },
    Label: {
      type: PredictionLabel,
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
