import csv from 'csv-parser'
import dayjs from 'dayjs'
import fs from 'fs'
import { executeConcurrently } from '~core/dynamoose/model'
import { CSensorData, SensorData } from '~db_nosql/schema/SensorDataTable'
import * as Types from '../types'

export class AdminService {
  private static async readCSVFile<RowType>(params: Types.IReadCSVFile<RowType>) {
    return new Promise((resolve, reject) => {
      fs.createReadStream(params.file)
        .pipe(csv())
        .on('data', params.onData)
        .on('end', async () => {
          if (typeof params.onEnd === 'function') {
            await params.onEnd()
          }
          resolve(true)
        })
        .on('error', (err) => reject(err))
    })
  }

  public static async initDataToDBNoSQL(params: Types.IInitDataToDB): Promise<Types.IInitDataToDBResponse> {
    const labels: { [id: number]: Types.IFile_LabelDescription } = {}
    await this.readCSVFile<Types.IFile_LabelDescription>({
      file: 'src/data/Label_Description.csv',
      onData: async (data) => {
        labels[Number(data.Label)] = data
      },
    })

    const demoDataArr: Partial<CSensorData>[] = []
    await this.readCSVFile<Types.IFile_DemoData>({
      file: 'src/data/demo_data.csv',
      onData: async (data) => {
        demoDataArr.push({
          date: dayjs(`${data.Date} ${data.Time}`, 'MM/DD/YYYY HH:mm:ss').format('YYYY-MM-DD'),
          time: dayjs(`${data.Date} ${data.Time}`, 'MM/DD/YYYY HH:mm:ss').format('HH:mm:ss'),
          pyrometer: Number(data.Pyrometer),
          nOx_GA01: Number(data.NOx_GA01),
          oxi_GA01: Number(data.Oxi_GA01),
          kiln_inlet_temp: Number(data.Kiln_inlet_temp),
          prediction: {
            description: labels[Number(data.Prediction)].Description,
            status: labels[Number(data.Prediction)].Status,
          },
        })
      },
    })

    await executeConcurrently(demoDataArr, 25, async (items) => {
      await SensorData.batchPut(items)
    })

    return {
      message: 'OK',
    }
  }
}
