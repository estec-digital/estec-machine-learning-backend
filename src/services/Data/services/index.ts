import dayjs from 'dayjs'
import { Raw } from 'typeorm'
import { Data } from '~db/entities/Data'
import * as Types from '../types'

export class DataService {
  public static async getData(params: Types.IGetData): Promise<Types.IGetDataResponse> {
    const data = await Data.find({
      where: {
        datetime: Raw((columnAlias) => `${columnAlias} >= '${dayjs(params.fromDate).format()}' AND ${columnAlias} <= '${dayjs(params.toDate).format()}'`),
      },
    })
    return {
      fromDate: params.fromDate,
      toDate: params.toDate,
      data,
    }
  }
}
