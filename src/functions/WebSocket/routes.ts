import { AWS } from '@serverless/typescript'
import { handlerPath } from '~core/lambda/handler-resolver'

const LambdaFunctionConfigs: AWS['functions'][any] = {
  handler: `${handlerPath(__dirname)}/index.main`,
  memorySize: 1024,
  timeout: 30,
  events: [
    { websocket: { route: '$connect' } },
    { websocket: { route: '$disconnect' } },
    { websocket: { route: '$default' } }
  ],
}

export default LambdaFunctionConfigs
