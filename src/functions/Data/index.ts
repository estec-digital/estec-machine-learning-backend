import { IActionHandlerParams, RestHandler } from '~core/rest-handler/RestHandler'
import { SensorData } from '~db_nosql/schema/SensorDataTable'
import { DataService, Types as DataServiceTypes } from '~services/Data'
import * as Types from './types'

class FunctionHandler extends RestHandler<Types.TAllowAction>() {
  protected static setActions() {
    this.restHandler.setAction('get-data', FunctionHandler.getData, ['fromDate', 'toDate'])
    this.restHandler.setAction('test', FunctionHandler.test, ['partition', 'range'])
  }

  private static async getData(params: IActionHandlerParams<DataServiceTypes.IGetData>) {
    return await DataService.getData(params.bodyPayload)
  }

  private static async test(params: IActionHandlerParams<DataServiceTypes.ISensorDataQuery>) {
    // SensorData.batchGet([]).po
    let data = await SensorData.query({
      date: {
        eq: params.bodyPayload.partition,
      },
      time: {
        // between: ['01:00:00', '05:00:00'],
        ...(params.bodyPayload.range ?? {}),
      },
    }).exec()

    const aa = data[0]
    const bb = await aa.populate({ properties: ['labelId'] })

    // const data = await SensorData.query('date').eq('2022-08-28').between('00:00:00', '01:00:00').exec()
    return data
  }
}

export const main = FunctionHandler.getHandlerFunction()
