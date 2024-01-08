import { DynamoDB } from 'aws-sdk'
import axios from 'axios'
import dayjs from 'dayjs'
import { IRawSensorData, ISensorData, RawSensorData, SensorData } from '~aws_resources/dynamodb/tables/'
import { EWebSocketConnectionIndexes, IWebSocketConnection, WebSocketConnection } from '~aws_resources/dynamodb/tables/WebSocketConnection'
import { executeConcurrently } from '~core/dynamoose/model'
import { IDynamoDBRecord } from '~core/dynamoose/types'
import { ISensorDataStreamData } from '~functions/DynamoDBStream/types'
import { DataService } from '~services/Data'
import { WebSocketService } from '~services/WebSocket'

export class DynamoDBStreamService {
  public static async handleConnectionInsertionStream(record: IDynamoDBRecord<IWebSocketConnection>) {
    const newWSConnectionItem = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as IWebSocketConnection
    const connectionId = newWSConnectionItem.ConnectionId
    if (connectionId) {
      await WebSocketService.postData({
        type: 'POST_TO_SINGLE_CONNECTION',
        connectionId,
        data: async (): Promise<ISensorDataStreamData> => ({
          type: 'SENSOR_DATA__LAST_ITEMS',
          data: await DataService.appDBQueryLastItemsOfSensorData({ factoryId: newWSConnectionItem.FactoryId, numberOfItems: 30 }),
        }),
      })
    }
  }

  public static async handleSensorDataStream(record: IDynamoDBRecord<ISensorData>) {
    const newSensorDataItem = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as ISensorData

    const item = await SensorData.model.get({ FactoryId_Date: newSensorDataItem.FactoryId_Date, Time: newSensorDataItem.Time })

    if (!item) return

    const timeOfSensorData = dayjs(`${item.Date} ${item.Time}`, 'YYYY-MM-DD HH:mm:ss')
    const now = dayjs()

    if (item.Prediction === undefined || item.Trending === undefined) {
      item.Prediction = null
      item.Trending = null

      try {
        const nowDate = dayjs(`${item.Date} ${item.Time}`, 'YYYY-MM-DD HH:mm:ss')
        const fifteenMinutesAgo: dayjs.Dayjs[] = []
        for (let i = 0; i < 15; i++) {
          fifteenMinutesAgo.push(nowDate.subtract(i, 'minute'))
        }
        const fifteenMinutesAgoDataResponse = await SensorData.model.batchGet(
          fifteenMinutesAgo.map((dateTime) => ({
            FactoryId_Date: `${item.FactoryId}::${dateTime.format('YYYY-MM-DD')}`,
            Time: dateTime.format('HH:mm:ss'),
          })),
        )
        const fifteenMinutesAgoSensorData: ISensorData['Trending'] = []
        for (const dateTime of fifteenMinutesAgo) {
          const data = fifteenMinutesAgoDataResponse.find((e) => e.Date === dateTime.format('YYYY-MM-DD') && e.Time === dateTime.format('HH:mm:ss'))
          fifteenMinutesAgoSensorData.push(data?.SensorData || null)
        }

        const response = await axios.post(`${process.env.AI_BASE_URL}/classify_status_predict_trend`, fifteenMinutesAgoSensorData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.data) {
          item.Prediction = {
            GeneralStatus: response.data.status,
            RecommendationActions: response.data.recommendation,
            StatusInDetails: response.data.past_trend?.trend_info,
          }
          item.Trending = response.data?.future_trend?.data ?? null

          console.log('Success in getting trending', response.data)
        }
      } catch (error) {
        console.log('Failed in getting trending', error)
      }

      await item.save()

      console.log('Final item:', item)
    } else {
      if (timeOfSensorData.isValid() && Math.abs(now.diff(timeOfSensorData, 'second')) <= 60 * 15) {
        const allActiveWSConnections = await WebSocketConnection.model.query({ FactoryId: item.FactoryId }).using(EWebSocketConnectionIndexes.GSI_FactoryId).exec()

        const mapOfWSConnectionsByFactoryId: { [factoryId: string]: IWebSocketConnection[] } = allActiveWSConnections.reduce(
          (prev, current) => ({ [current.FactoryId]: [...(prev[current.FactoryId] ?? []), current] }),
          {},
        )

        for (const [factoryId, wsConnections] of Object.entries(mapOfWSConnectionsByFactoryId)) {
          if (wsConnections.length > 0) {
            await executeConcurrently(wsConnections, 10, async (connections) => {
              const data = await DataService.appDBQueryLastItemsOfSensorData({ factoryId: factoryId, numberOfItems: 30 })
              console.log({ bbb: { connections, length: connections.length } })
              await Promise.all(
                connections.map((connection) =>
                  WebSocketService.postData({
                    connectionId: connection.ConnectionId,
                    type: 'POST_TO_SINGLE_CONNECTION',
                    data: (): ISensorDataStreamData => ({
                      type: 'SENSOR_DATA__LAST_ITEMS',
                      data: data,
                    }),
                  }),
                ),
              )
            })
          }
        }
      }
    }
    return
  }

  public static async handleRawSensorDataStream(record: IDynamoDBRecord<IRawSensorData>) {
    const newRawSensorDataItem = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as IRawSensorData

    const rawSensorData = await RawSensorData.model.get({ FactoryId_Date: newRawSensorDataItem.FactoryId_Date, Time: newRawSensorDataItem.Time })
    if (!rawSensorData) return
    if (rawSensorData.note?.triggedFnProcessDataToAppDB === false) {
      rawSensorData.note.triggedFnProcessDataToAppDB = true
      await rawSensorData.save()
      // console.log(`[RawDB] Item(${item.Date} ${item.Time}) process data to save to [AppDB]...`)

      const sensorData: Partial<ISensorData> = {
        FactoryId_Date: newRawSensorDataItem.FactoryId_Date,
        Date: newRawSensorDataItem.Date,
        Time: newRawSensorDataItem.Time,
        FactoryId: newRawSensorDataItem.FactoryId,
        SensorData: {
          GA01_Oxi: newRawSensorDataItem['4G1GA01XAC01_O2_AVG'],
          GA02_Oxi: newRawSensorDataItem['4G1GA02XAC01_O2_AVG'],
          GA03_Oxi: newRawSensorDataItem['4G1GA03XAC01_O2_AVG'],
          // GA04_Oxi: newRawSensorDataItem['4G1GA04XAC01_O2_AVG'],
          KilnDriAmp: newRawSensorDataItem['4K1KP01DRV01_M2001_EI_AVG'],
          KilnInletTemp: newRawSensorDataItem['4G1KJ01JST00_T8401_AVG'],
          // Nox: newRawSensorDataItem['4G1GA01XAC01_NO_AVG'],
          Pyrometer: newRawSensorDataItem['4K1KP01KHE01_B8701_AVG'],
          MaterialTowerHeat: newRawSensorDataItem['_G1PJ01MCH02T8201_TIA_IO_Signal_Value'],
          TowerOilTemp: newRawSensorDataItem['4G1PS01GPJ02_T8201_AVG'],
          RecHeadTemp: newRawSensorDataItem['4R1GQ01JNT01_T8201_AVG'],
          FurnaceSpeedSP: newRawSensorDataItem['41KP01DRV01_SP_AVG'],
          CoalSP: newRawSensorDataItem['SZ_Coal_Setpt_AVG'],
          AlternativeCoalSP: newRawSensorDataItem['PC_Coal_setpt_AVG'],
          FanSP: newRawSensorDataItem['4G1FN01DRV01_M1001_SI_AVG'],
          FurnaceSpeed: newRawSensorDataItem['4K1KP01DRV01_Speed_AVG'],
          ActualFuel: newRawSensorDataItem['Actual_KF'],
          AvgBZT: newRawSensorDataItem['BZTL_AVG'],
          ActualFuelSP: newRawSensorDataItem['Kilnfeed_SP_Total_AVG'],
          HeatReplaceRatio: newRawSensorDataItem['Ratio_PC_AVG'],
          TotalHeatConsumption: newRawSensorDataItem['Result_AHC_AVG'],
        },
      }

      const sensorDataItem = await SensorData.model.get({ FactoryId_Date: sensorData.FactoryId_Date, Time: sensorData.Time })
      if (!sensorDataItem) {
        await SensorData.model.create(sensorData)
      }

      // console.log(`RawDB] Item(${item.Date} ${item.Time}) Saved data [AppDB] successfully.`)
    }

    return
  }
}
