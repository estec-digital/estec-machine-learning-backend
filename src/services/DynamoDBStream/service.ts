import { DynamoDBRecord } from 'aws-lambda'
import dayjs from 'dayjs'
import { ISensorDataStreamData } from '~functions/DynamoDBStream/types'
import { DataService } from '~services/Data'
import { WebSocketService } from '~services/WebSocket'

export class DynamoDBStreamService {
  public static async handleConnectionStream(record: DynamoDBRecord) {
    if (record.eventName === 'INSERT') {
      const connectionId = record.dynamodb.Keys?.connectionId?.S
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

  public static async handleSensorDataStream(record: DynamoDBRecord) {
    const partitionKey = record.dynamodb.Keys?.date?.S
    const sortKey = record.dynamodb.Keys?.time?.S

    if (!(partitionKey && sortKey)) return

    const timeOfSensorData = dayjs(`${partitionKey} ${sortKey}`, 'YYYY-MM-DD HH:mm:ss')
    const now = dayjs()

    console.log({
      timeOfSensorData: timeOfSensorData.toISOString(),
      now: now.toISOString(),
      dynamoDBItem: record.dynamodb,
    })

    if (Math.abs(now.diff(timeOfSensorData, 'second')) <= 60 * 15) {
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

  public static async handleRawDataStream(record: DynamoDBRecord) {
    console.log(record)
  }
}
