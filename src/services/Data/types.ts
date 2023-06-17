import { CSensorData } from '~root/dynamodb/schema/SensorDataTable'

export interface IQuerySensorData {
  partition: string
  range: object
}

export interface IGetData {
  date: CSensorData['Date']
  time: CSensorData['Time']
}

export interface IUpdatePrediction {
  date: CSensorData['Date']
  time: CSensorData['Time']
  prediction: CSensorData['Prediction']
}
