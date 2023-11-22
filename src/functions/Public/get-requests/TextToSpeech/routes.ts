import { AWS } from '@serverless/typescript'
import { handlerPath } from '~core/lambda/handler-resolver'

const LambdaFunctionConfigs: AWS['functions'][any] = {
  handler: `${handlerPath(__dirname)}/handler2.main`,
  memorySize: 1024,
  timeout: 30,
  events: [
    {
      http: {
        method: 'GET',
        path: 'public/text-to-speech',
        cors: true,
      },
    },
  ],
}

export default LambdaFunctionConfigs
