import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { DataSource } from 'typeorm'
import '~core/typeorm/Override'
import { Data } from './entities/Data'
import { Label } from './entities/Label'
import { User } from './entities/User'

dayjs.extend(utc)
dayjs.extend(timezone)

export class AppDataSource {
  private static _instance: DataSource

  private constructor() {
    throw new Error('Use AppDataSource.getInstance()')
  }

  static async initializeConnection(params?: { isTesting: boolean }) {
    const instance = this.getInstance(params)
    if (instance && instance?.isInitialized === false) {
      await instance.initialize()
    }
  }

  static async terminateConnection() {
    const instance = AppDataSource._instance
    if (instance && instance.isInitialized) {
      await instance.destroy()
    }
  }

  static getInstance(params?: { isTesting: boolean }): DataSource {
    if (!AppDataSource._instance) {
      const entities = [User, Data, Label]

      /* istanbul ignore next */
      if ((params && params.isTesting === true) || process.env.IS_TESTING === 'true') {
        // TESTING
        AppDataSource._instance = new DataSource({
          type: 'better-sqlite3',
          database: ':memory:',
          synchronize: true,
          dropSchema: true,
          entities: entities,
        })
      } else {
        // REAL
        /* istanbul ignore next */
        AppDataSource._instance = new DataSource({
          type: 'mysql',
          port: Number(process.env.MYSQL_DB_PORT) || 3306,
          host: process.env.MYSQL_DB_HOST,
          database: process.env.MYSQL_DB_NAME,
          username: process.env.MYSQL_DB_USERNAME,
          password: process.env.MYSQL_DB_PASSWORD,
          // IMPORTANT: false on production
          synchronize: true,
          entities: entities,
        })
      }
    }
    return AppDataSource._instance
  }
}
