import { CSensorData } from '~root/dynamodb/schema/SensorDataTable'

export interface IQuerySensorData {
  partition: string
  range: object
}

export interface IGetData {
  Date: CSensorData['Date']
  Time: CSensorData['Time']
}

export interface IUpdatePrediction {
  Date: CSensorData['Date']
  Time: CSensorData['Time']
  Prediction: CSensorData['Prediction']
}
