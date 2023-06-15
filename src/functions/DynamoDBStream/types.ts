import { CSensorData } from '~root/dynamodb/schema/SensorDataTable'

type TDataBaseAction = 'init-data-to-db'

export type TAllowAction = TDataBaseAction

export interface ISensorDataStreamData {
  type: 'SENSOR_DATA__LAST_15_ITEMS'
  data: CSensorData[]
}
