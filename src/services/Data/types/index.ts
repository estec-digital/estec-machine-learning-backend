import { CSensorData } from '~root/dynamodb/schema/SensorDataTable'

export interface IQuerySensorData {
  partition: string
  range: object
}

export interface IGetData {
  date: CSensorData['date']
  time: CSensorData['time']
}

export interface IUpdatePrediction {
  date: CSensorData['date']
  time: CSensorData['time']
  prediction: CSensorData['prediction']
}
