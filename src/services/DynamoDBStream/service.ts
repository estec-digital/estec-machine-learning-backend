import { unmarshall } from '@aws-sdk/util-dynamodb'
import axios from 'axios'
import dayjs from 'dayjs'
import { Cache, IRawSensorData, ISensorData, RawSensorData, SensorData } from '~aws_resources/dynamodb/tables/'
import { CACHE_SORT_KEY } from '~aws_resources/dynamodb/tables/Cache/types'
import { EWebSocketConnectionIndexes, IWebSocketConnection, WebSocketConnection } from '~aws_resources/dynamodb/tables/WebSocketConnection'
import { executeConcurrently } from '~core/dynamoose/model'
import { IDynamoDBRecord } from '~core/dynamoose/types'
import { ISensorDataStreamData } from '~functions/DynamoDBStream/types'
import { DataService } from '~services/Data'
import { WebSocketService } from '~services/WebSocket'
import { SensorDataIssue } from './types'

export class DynamoDBStreamService {
  public static async handleConnectionInsertionStream(record: IDynamoDBRecord<IWebSocketConnection>) {
    // On a new connection connect to the system
    return true
  }

  public static async handleSensorDataStream(record: IDynamoDBRecord<ISensorData>) {
    const newSensorDataItem = unmarshall(record.dynamodb.NewImage as any) as ISensorData

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
        for (let i = 0; i < 60; i++) {
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

        let response1
        let response2: SensorDataIssue[]

        try {
          response1 = await axios
            .post(`${process.env.AI_BASE_URL}/classify_status_predict_trend`, fifteenMinutesAgoSensorData, {
              headers: {
                'Content-Type': 'application/json',
              },
            })
            .then((res) => res.data)
        } catch (error) {
          console.log('Failed in getting prediction', error)
        }

        try {
          response2 = await axios
            .post(`${process.env.AI_BASE_URL}/find_issues`, fifteenMinutesAgoSensorData, {
              headers: {
                'Content-Type': 'application/json',
              },
            })
            .then((res) => res.data)
        } catch (error) {
          console.log('Failed in getting issues', error)
        }

        console.log('Response1: ', response1)
        console.log('Response2: ', response2)

        if (response1) {
          item.Prediction = {
            GeneralStatus: response1.status,
            RecommendationActions: response1.recommendation,
            StatusInDetails: response1.past_trend?.trend_info,
          }
          item.Trending = response1.future_trend?.data ?? null
          item.PastTrendData = response1.past_trend?.data ?? null

          if (Array.isArray(response2) && response2.length > 0) {
            response2 = response2.map((issue) => ({
              ...issue,
              SensorDataInfo: {
                FactoryId: item.FactoryId,
                Date: item.Date,
                Time: item.Time,
              },
            }))

            item.Issues = response2
            await DynamoDBStreamService.updateLastSensorDataIssues(item.FactoryId, response2 ?? [])
          }
        }
      } catch (error) {
        console.log('Failed in getting trending', error)
      }

      console.log('Final item before save:', item)
      await item.save()
      console.log('Final item after save:', item)
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
              const data = await DataService.appDBQueryLastItemsOfSensorData({ factoryId: factoryId, numberOfItems: 1 })
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
    const newRawSensorDataItem = unmarshall(record.dynamodb.NewImage as any) as IRawSensorData

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
          Nox: newRawSensorDataItem['4G1GA01XAC01_NO_AVG'],
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
          Fan_4S1: newRawSensorDataItem['4S1FN01DRV01_M2001_EI'],
          Kilnhood_Pressure: newRawSensorDataItem['4K1KP01KHE01_B5001'],
          Thermal_Exhaust: newRawSensorDataItem['4S1GP01JST00_T8104'],
          Fan_4E1_Valve_Open_Close_Degree: newRawSensorDataItem['4E1FN01TVJ01_PID_MV'],
          '4E1GP1JST01_Pressure': newRawSensorDataItem['4E1GP01JST00_B5002'],
          Valve_Open_Degree: newRawSensorDataItem['4C1DD02DDJ01_M5501_MV'],
          Actual_Feed_Rate_PC: newRawSensorDataItem['Actual_coal_PC'],
          Coal_Blower_Pressure_01: newRawSensorDataItem['CW1RB01JST00_B5001'],
          Actual_Feed_Rate_SZ: newRawSensorDataItem['Actual_coal_SZ'],
          Coal_Blower_Pressure_02: newRawSensorDataItem['CW1RB02JST00_B5001'],
          Fabric_Scale: newRawSensorDataItem['_L72BW01_W01'],
          Temperature_C1: newRawSensorDataItem['4G1PS01GPJ02_T8201'],
          Temperature_C2: newRawSensorDataItem['4G1PS02PGP02_T8201'],
          Temperature_C3: newRawSensorDataItem['4G1PS03PGP02_T8201'],
          Hydraulic_Pressure: newRawSensorDataItem['Grate_Hyd_Pressure'],
          Conveyor_Flow_Rate_01: newRawSensorDataItem['_4C1BE01DRV01_M2001.Current.Value'],
          Conveyor_Flow_Rate_02: newRawSensorDataItem['_4C1BE01DRV02_M2001.Current.Value'],
          CaO_f: newRawSensorDataItem['BP_KSCL_CL_CaOf'],
          S03_hot_meal: newRawSensorDataItem['BP_KSCL_CL_SO3'],
          Conveyor_Flow: newRawSensorDataItem['4C1BE01DRV01_M2001_I'],
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

  private static async updateLastSensorDataIssues(factoryId: string, issues: SensorDataIssue[]) {
    if (!(Array.isArray(issues) && issues.length > 0)) {
      return false
    }

    const lastSensorDataIssues = await Cache.model.get({
      FactoryId: factoryId,
      CacheKey: CACHE_SORT_KEY.LAST_SENSOR_DATA_ISSUES,
    })

    issues = issues.map((issue) => ({
      ...issue,
      Acknowledge: false,
    }))

    let lastIssuesInDB: SensorDataIssue[] = []

    if (lastSensorDataIssues) {
      try {
        lastIssuesInDB = JSON.parse(lastSensorDataIssues.Data)
        if (!Array.isArray(lastIssuesInDB)) {
          lastIssuesInDB = []
        }
        lastIssuesInDB.push(...issues)
        // Keep only the last 10 issues
        lastIssuesInDB = lastIssuesInDB.slice(-10)
        await Cache.model.update({
          FactoryId: factoryId,
          CacheKey: CACHE_SORT_KEY.LAST_SENSOR_DATA_ISSUES,
          Data: JSON.stringify(lastIssuesInDB),
        })
        return true
      } catch (error) {
        console.log('Failed in getting last sensor data issues')
      }
    }

    lastIssuesInDB = issues

    // If there is no last sensor data issues, create a new one
    await Cache.model.create({
      FactoryId: factoryId,
      CacheKey: CACHE_SORT_KEY.LAST_SENSOR_DATA_ISSUES,
      Data: JSON.stringify(lastIssuesInDB),
    })
    return true
  }
}
