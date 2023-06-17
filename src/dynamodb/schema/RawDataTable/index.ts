import * as dynamoose from 'dynamoose'
import { Item } from 'dynamoose/dist/Item'

export class CRawData extends Item {
  Date: string // YYYY-DD-MM
  Time: string // HH:mm:ss
  '4G1GA01XAC01_NO_AVG'?: number
  '4G1GA01XAC01_O2_AVG'?: number
  '4G1GA02XAC01_O2_AVG'?: number
  '4G1GA03XAC01_O2_AVG'?: number
  '4G1GA04XAC01_O2_AVG'?: number
  '4G1KJ01JST00_T8401_AVG'?: number
  '4K1KP01DRV01_M2001_EI_AVG'?: number
  '4K1KP01KHE01_B8701_AVG'?: number

  note: {
    triggedFnProcessDataToAppDB: boolean
  }
}

const rawDataSchema = new dynamoose.Schema(
  {
    Date: {
      type: String,
      hashKey: true,
    },
    Time: {
      type: String,
      rangeKey: true,
    },
    '4G1GA01XAC01_NO_AVG': {
      type: Number,
    },
    '4G1GA01XAC01_O2_AVG': {
      type: Number,
    },
    '4G1GA02XAC01_O2_AVG': {
      type: Number,
    },
    '4G1GA03XAC01_O2_AVG': {
      type: Number,
    },
    '4G1GA04XAC01_O2_AVG': {
      type: Number,
    },
    '4G1KJ01JST00_T8401_AVG': {
      type: Number,
    },
    '4K1KP01DRV01_M2001_EI_AVG': {
      type: Number,
    },
    '4K1KP01KHE01_B8701_AVG': {
      type: Number,
    },
    note: {
      type: Object,
      schema: {
        triggedFnProcessDataToAppDB: {
          type: Boolean,
        },
      },
      default: {
        triggedFnProcessDataToAppDB: false,
      },
    },
  },
  {
    // saveUnknown: false,
    timestamps: {
      updatedAt: ['UpdatedAt'],
    },
  },
)

export const RawData = dynamoose.model<CRawData>(process.env.DYNAMO_DB_TABLE_NAME__RawDataTable, rawDataSchema)
