import * as Types from './types'

export class AdminService {
  public static async initDataToDB(params: Types.IInitDataToDB): Promise<Types.IInitDataToDBResponse> {
    return {
      message: 'OK',
    }
  }
}
