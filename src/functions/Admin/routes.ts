import { AWS } from '@serverless/typescript'
import { handlerPath } from '~core/lambda/handler-resolver'
import schema from './schema'

const LambdaFunctionConfigs: AWS['functions'][any] = {
  handler: `${handlerPath(__dirname)}/index.main`,
  memorySize: 2048,
  timeout: 30,
  events: [
    {
      http: {
        method: 'POST',
        path: 'admin',
        cors: true,
        request: {
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
  ],
}

export default LambdaFunctionConfigs
