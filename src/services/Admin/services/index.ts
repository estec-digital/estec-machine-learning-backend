import csv from 'csv-parser'
import dayjs from 'dayjs'
import fs from 'fs'
import { DeepPartial } from 'typeorm'
import { Data } from '~db/entities/Data'
import { Label } from '~db/entities/Label'
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
    await Data.save(demoDataArr)

    return {
      message: 'OK',
    }
  }
}
