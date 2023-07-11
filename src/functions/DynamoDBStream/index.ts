import { DynamoDBStreamHandler } from 'aws-lambda'
import { DynamoDBStreamService } from '~services/DynamoDBStream'

export const main: DynamoDBStreamHandler = async (event, context) => {
  console.log(JSON.stringify({ dynamoDBStreamEvent: event }))
  try {
    for (const record of event.Records) {
      // Process each record in the DynamoDB stream
      switch (record.eventSourceARN) {
        case process.env.WEBSOCKET_CONNECTION_DYNAMODB_STREAM: {
          await DynamoDBStreamService.handleConnectionStream(record)
          break
        }
        case process.env.WEBSOCKET_RAW_DATA_DYNAMODB_STREAM: {
          await DynamoDBStreamService.handleRawDataStream(record)
          break
        }
        case process.env.WEBSOCKET_SENSOR_DATA_DYNAMODB_STREAM: {
          await DynamoDBStreamService.handleSensorDataStream(record)
          break
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}
