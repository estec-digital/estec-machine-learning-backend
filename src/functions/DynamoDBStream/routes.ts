import { AWS } from '@serverless/typescript'
import { handlerPath } from '~core/lambda/handler-resolver'

const LambdaFunctionConfigs: AWS['functions'][any] = {
  handler: `${handlerPath(__dirname)}/index.main`,
  memorySize: 2048,
  timeout: 60,
  events: [
    {
      stream: {
        type: 'dynamodb',
        batchSize: 1,
        // batchWindow: 5,
        startingPosition: 'LATEST',
        arn: {
          'Fn::GetAtt': ['WebSocketConnection', 'StreamArn'],
        },
      },
    },
    {
      stream: {
        type: 'dynamodb',
        batchSize: 1,
        startingPosition: 'LATEST',
        arn: {
          'Fn::GetAtt': ['RawSensorData', 'StreamArn'],
        },
      },
    },
    {
      stream: {
        type: 'dynamodb',
        batchSize: 1,
        startingPosition: 'LATEST',
        arn: {
          'Fn::GetAtt': ['SensorData', 'StreamArn'],
        },
      },
    },
  ],
}

export default LambdaFunctionConfigs
