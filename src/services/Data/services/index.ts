import { QueryResponse } from 'dynamoose/dist/ItemRetriever'
import { CSensorData, SensorData } from '~db_nosql/schema/SensorDataTable'
import * as Types from '../types'

export class DataService {
  public static async queryData(params: Types.IQuerySensorData): Promise<QueryResponse<CSensorData>> {
    const data = await SensorData.query({
      date: {
        eq: params.partition,
      },
      time: {
        // between: ['01:00:00', '05:00:00'],
        ...(params.range ?? {}),
      },
    }).exec()

    // const data = await SensorData.query('date').eq('2022-08-28').between('00:00:00', '01:00:00').exec()
    return data
  }
}
