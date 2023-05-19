import * as dynamoose from 'dynamoose'
import { Item } from 'dynamoose/dist/Item'

export class CPredictionLabel extends Item {
  id: number
  status: string
  description: string
}

const predictionLabelSchema = new dynamoose.Schema(
  {
    id: {
      type: Number,
      hashKey: true,
    },
    status: {
      type: String,
    },
    description: {
      type: String,
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

export const PredictionLabel = dynamoose.model<CPredictionLabel>(process.env.DYNAMO_DB_TABLE_NAME__PredictionLabelTable, predictionLabelSchema)
