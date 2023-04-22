import { handlerPath } from '~core/lambda/handler-resolver'
import schema from './schema'

export default {
  handler: `${handlerPath(__dirname)}/index.main`,
  events: [
    {
      http: {
        method: 'POST',
        path: 'auth',
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
