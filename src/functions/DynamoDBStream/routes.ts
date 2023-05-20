import { AWS } from '@serverless/typescript'
import { handlerPath } from '~core/lambda/handler-resolver'

const LambdaFunctionConfigs: AWS['functions'][any] = {
  handler: `${handlerPath(__dirname)}/index.main`,
  memorySize: 1024,
  timeout: 30,
  events: [
    {
      stream: {
        type: 'dynamodb',
        arn: process.env.WEBSOCKET_DYNAMODB_STREAM,
      },
    },
  ],
}

export default LambdaFunctionConfigs
