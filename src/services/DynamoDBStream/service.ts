import dayjs from 'dayjs'
import * as lodash from 'lodash'
import { IDynamoDBRecord } from '~core/dynamoose/types'
import { ISensorDataStreamData } from '~functions/DynamoDBStream/types'
import { CRawData, RawData } from '~root/dynamodb/schema/RawDataTable'
import { CSensorData, SensorData } from '~root/dynamodb/schema/SensorDataTable'
import { CWebSocketConnection } from '~root/dynamodb/schema/WebSocketConnectionTable'
import { DataService } from '~services/Data'
import { WebSocketService } from '~services/WebSocket'

export class DynamoDBStreamService {
  public static async handleConnectionStream(record: IDynamoDBRecord<CWebSocketConnection>) {
    if (record.eventName === 'INSERT') {
      const connectionId = record.dynamodb.Keys?.ConnectionId?.S
      if (connectionId) {
        const message: ISensorDataStreamData = {
          type: 'SENSOR_DATA__LAST_15_ITEMS',
          data: await DataService.queryLast15ItemsOfSensorData(),
        }
        await WebSocketService.postData({
          type: 'POST_TO_SINGLE_CONNECTION',
          connectionId,
          data: message,
        })
      }
    }
  }

  public static async handleSensorDataStream(record: IDynamoDBRecord<CSensorData>) {
    const date = record.dynamodb.Keys.Date.S
    const time = record.dynamodb.Keys.Time.S
    const item = await SensorData.get({ Date: date, Time: time })

    if (!(date && time && item)) return

    const timeOfSensorData = dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm:ss')
    const now = dayjs()

    if (item.Prediction === undefined) {
      console.log(`[AppDB] Item(${item.Date} ${item.Time}) calling ML lambda fn to get prediction...`)

      item.Prediction = {
        Status: 'Sample status',
        Description: 'Sample description',
      }
      await item.save()

      console.log(`[AppDB] Item(${item.Date} ${item.Time}) got prediction successfully.`)
    } else {
      if (timeOfSensorData.isValid() && Math.abs(now.diff(timeOfSensorData, 'second')) <= 60 * 15) {
        const message: ISensorDataStreamData = {
          type: 'SENSOR_DATA__LAST_15_ITEMS',
          data: await DataService.queryLast15ItemsOfSensorData(),
        }
        await WebSocketService.postData({
          type: 'POST_TO_ALL_CONNECTIONS',
          data: message,
        })
      }
    }
    return
  }

  public static async handleRawDataStream(record: IDynamoDBRecord<CRawData>) {
    const image = record.dynamodb.NewImage
    const item = await RawData.get({ Date: record.dynamodb.Keys.Date.S, Time: record.dynamodb.Keys.Time.S })
    if (!item) return
    if (item.note?.triggedFnProcessDataToAppDB === false) {
      item.note.triggedFnProcessDataToAppDB = true
      await item.save()
      console.log(`[RawDB] Item(${item.Date} ${item.Time}) process data to save to [AppDB]...`)

      const sensorData: Partial<CSensorData> = {
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

      await SensorData.create(sensorData)
      console.log(`RawDB] Item(${item.Date} ${item.Time}) Saved data [AppDB] successfully.`)
    }

    return
  }
}
