import { handlerPath } from '~core/lambda/handler-resolver'
import schema from './schema'

export default {
  handler: `${handlerPath(__dirname)}/index.main`,
  memorySize: 1024,
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
