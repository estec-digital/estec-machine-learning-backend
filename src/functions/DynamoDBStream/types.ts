import { ISensorData } from '~aws_resources/dynamodb/tables'

type TDataBaseAction = 'init-data-to-db'

export type TAllowAction = TDataBaseAction

export interface ISensorDataStreamData {
  type: 'SENSOR_DATA__LAST_ITEMS' | 'SENSOR_DATA__FULL_DAY'
  data: Partial<ISensorData>[]
}
