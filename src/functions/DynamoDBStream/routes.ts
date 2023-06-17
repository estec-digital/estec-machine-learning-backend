import { AWS } from '@serverless/typescript'
import { handlerPath } from '~core/lambda/handler-resolver'

const LambdaFunctionConfigs: AWS['functions'][any] = {
  handler: `${handlerPath(__dirname)}/index.main`,
  memorySize: 1024,
  timeout: 30,
  events: [],
}

if (process.env.WEBSOCKET_CONNECTION_DYNAMODB_STREAM) {
  LambdaFunctionConfigs.events.push({
    stream: {
      type: 'dynamodb',
      arn: process.env.WEBSOCKET_CONNECTION_DYNAMODB_STREAM,
    },
  })
}

if (process.env.WEBSOCKET_RAW_DATA_DYNAMODB_STREAM) {
  LambdaFunctionConfigs.events.push({
    stream: {
      type: 'dynamodb',
      arn: process.env.WEBSOCKET_RAW_DATA_DYNAMODB_STREAM,
    },
  })
}

if (process.env.WEBSOCKET_SENSOR_DATA_DYNAMODB_STREAM) {
  LambdaFunctionConfigs.events.push({
    stream: {
      type: 'dynamodb',
      arn: process.env.WEBSOCKET_SENSOR_DATA_DYNAMODB_STREAM,
    },
  })
}

export default LambdaFunctionConfigs
