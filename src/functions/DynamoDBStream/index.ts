import { DynamoDBStreamHandler } from 'aws-lambda'
import { DynamoDBStreamService } from '~services/DynamoDBStream'

export const main: DynamoDBStreamHandler = async (event, context) => {
  console.log(JSON.stringify({ dynamoDBStreamEvent: event }))
  try {
    for (const record of event.Records) {
      // Process each record in the DynamoDB stream
      switch (record.eventSourceARN) {
        case process.env['DYNAMODB_ARN__WebSocketConnection']: {
          if (record.eventName === 'INSERT') {
            await DynamoDBStreamService.handleConnectionInsertionStream(record)
          }
          break
        }
        case process.env['DYNAMODB_ARN__RawSensorData']: {
          if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
            await DynamoDBStreamService.handleRawSensorDataStream(record)
          }

          break
        }
        case process.env['DYNAMODB_ARN__SensorData']: {
          if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
            await DynamoDBStreamService.handleSensorDataStream(record)
          }

          break
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}
