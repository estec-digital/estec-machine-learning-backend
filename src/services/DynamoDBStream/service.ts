import dayjs from 'dayjs'
import * as lodash from 'lodash'
import { IRawData, RawData } from '~aws_resources/dynamodb/RawData'
import { ISensorData, SensorData } from '~aws_resources/dynamodb/SensorData'
import { IWebSocketConnection } from '~aws_resources/dynamodb/WebSocketConnection'
import { IDynamoDBRecord } from '~core/dynamoose/types'
import { ISensorDataStreamData } from '~functions/DynamoDBStream/types'
import { DataService } from '~services/Data'
import { LambdaService } from '~services/Lambda'
import { WebSocketService } from '~services/WebSocket'

export class DynamoDBStreamService {
  public static async handleConnectionStream(record: IDynamoDBRecord<IWebSocketConnection>) {
    if (record.eventName === 'INSERT') {
      const connectionId = record.dynamodb.Keys?.ConnectionId?.S
      if (connectionId) {
        await WebSocketService.postData({
          type: 'POST_TO_SINGLE_CONNECTION',
          connectionId,
          data: async (): Promise<ISensorDataStreamData> => ({
            type: 'SENSOR_DATA__LAST_ITEMS',
            data: await DataService.appDBQueryLastItemsOfSensorData(60),
          }),
        })
      }
    }
  }

  public static async handleSensorDataStream(record: IDynamoDBRecord<ISensorData>) {
    const date = record.dynamodb.Keys.Date.S
    const time = record.dynamodb.Keys.Time.S
    const item = await SensorData.model.get({ Date: date, Time: time })

    if (!(date && time && item)) return

    const timeOfSensorData = dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm:ss')
    const now = dayjs()

    if (item.Prediction === undefined) {
      // console.log(`[AppDB] Item(${item.Date} ${item.Time}) calling ML lambda fn to get prediction...`)

      const predictionData = await LambdaService.invokeFunction({
        functionName: 'ximangBinhPhuoc',
        payload: {
          SensorData: item.SensorData,
        },
      })

      if (predictionData) {
        item.Prediction = predictionData
      }

      await item.save()

      // console.log(`[AppDB] Item(${item.Date} ${item.Time}) got prediction successfully.`)
    } else {
      if (timeOfSensorData.isValid() && Math.abs(now.diff(timeOfSensorData, 'second')) <= 60 * 15) {
        await WebSocketService.postData({
          type: 'POST_TO_ALL_CONNECTIONS',
          data: async (): Promise<ISensorDataStreamData> => ({
            type: 'SENSOR_DATA__LAST_ITEMS',
            data: await DataService.appDBQueryLastItemsOfSensorData(60),
          }),
        })
      }
    }
    return
  }

  public static async handleRawDataStream(record: IDynamoDBRecord<IRawData>) {
    const image = record.dynamodb.NewImage
    const item = await RawData.model.get({ Date: record.dynamodb.Keys.Date.S, Time: record.dynamodb.Keys.Time.S })
    if (!item) return
    if (item.note?.triggedFnProcessDataToAppDB === false) {
      item.note.triggedFnProcessDataToAppDB = true
      await item.save()
      // console.log(`[RawDB] Item(${item.Date} ${item.Time}) process data to save to [AppDB]...`)

      const sensorData: Partial<ISensorData> = {
        Date: image.Date.S,
        Time: image.Time.S,
        SensorData: {
          GA01_Oxi: lodash.toNumber(image['4G1GA01XAC01_O2_AVG']?.N),
          GA02_Oxi: lodash.toNumber(image['4G1GA02XAC01_O2_AVG']?.N),
          GA03_Oxi: lodash.toNumber(image['4G1GA03XAC01_O2_AVG']?.N),
          GA04_Oxi: lodash.toNumber(image['4G1GA04XAC01_O2_AVG']?.N),
          KilnDriAmp: lodash.toNumber(image['4K1KP01DRV01_M2001_EI_AVG']?.N),
          KilnInletTemp: lodash.toNumber(image['4G1KJ01JST00_T8401_AVG']?.N),
          Nox: lodash.toNumber(image['4G1GA01XAC01_NO_AVG']?.N),
          Pyrometer: lodash.toNumber(image['4K1KP01KHE01_B8701_AVG']?.N),
        },
      }

      await SensorData.model.create(sensorData)
      // console.log(`RawDB] Item(${item.Date} ${item.Time}) Saved data [AppDB] successfully.`)
    }

    return
  }
}
