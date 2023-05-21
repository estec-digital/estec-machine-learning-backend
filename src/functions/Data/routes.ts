import { AWS } from '@serverless/typescript'
import { handlerPath } from '~core/lambda/handler-resolver'
import schema from './schema'

const LambdaFunctionConfigs: AWS['functions'][any] = {
  handler: `${handlerPath(__dirname)}/index.main`,
  memorySize: 1024,
  timeout: 30,
  events: [
    {
      http: {
        method: 'POST',
        path: 'data',
        cors: true,
        authorizer: 'AuthTokenValidation',
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
