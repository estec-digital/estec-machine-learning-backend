import csv from 'csv-parser'
import dayjs from 'dayjs'
import fs from 'fs'
import { DeepPartial } from 'typeorm'
import { executeConcurrently } from '~core/dynamoose/model'
import { Data } from '~db/entities/Data'
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

  public static async initDataToDB(params: Types.IInitDataToDB): Promise<Types.IInitDataToDBResponse> {
    // const labels: DeepPartial<Label>[] = []
    // await this.readCSVFile<Types.IFile_LabelDescription>({
    //   file: 'src/data/Label_Description.csv',
    //   onData: async (data) => {
    //     labels.push({
    //       id: data.Label,
    //       status: data.Status,
    //       description: data.Desccription,
    //     })
    //   },
    // })
    // console.log('Finnish inserting: Label_Description.csv')
    // await Label.save(labels)

    const demoDataArr: DeepPartial<Data>[] = []
    await this.readCSVFile<Types.IFile_DemoData>({
      file: 'src/data/demo_data.csv',
      onData: async (data) => {
        demoDataArr.push({
          datetime: dayjs(`${data.Date} ${data.Time}`, 'MM/DD/YYYY HH:mm:ss').toDate(),
          pyrometer: Number(data.Pyrometer),
          nOx_GA01: Number(data.NOx_GA01),
          oxi_GA01: Number(data.Oxi_GA01),
          kiln_inlet_temp: Number(data.Kiln_inlet_temp),
          labelId: Number(data.Prediction),
        })
      },
    })
    console.log('Finnish inserting: demo_data.csv')

    // const totalThread = 10
    // const chunkSize = Math.ceil(demoDataArr.length / totalThread)
    // const result = Array.from({ length: totalThread }, (_, i) => demoDataArr.slice(i * chunkSize, (i + 1) * chunkSize))

    // await Promise.all(result.map((e) => Data.save(e)))

    await Data.insert(demoDataArr)

    return {
      message: 'OK',
    }
  }

  public static async initDataToDBNoSQL(params: Types.IInitDataToDB): Promise<Types.IInitDataToDBResponse> {
    // const labels: DeepPartial<CPredictionLabel>[] = []
    // await this.readCSVFile<Types.IFile_LabelDescription>({
    //   file: 'src/data/Label_Description.csv',
    //   onData: async (data) => {
    //     labels.push({
    //       id: Number(data.Label),
    //       status: data.Status,
    //       description: data.Desccription,
    //     })
    //   },
    // })
    // console.log('Finnish inserting: Label_Description.csv')
    // executeConcurrently(labels, 25, async (items) => {
    //   await PredictionLabel.batchPut(items)
    // })
    // return {
    //   message: 'OK',
    // }

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
          labelId: Number(data.Prediction),
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
