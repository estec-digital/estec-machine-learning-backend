import { handlerPath } from '~core/lambda/handler-resolver'
import schema from './schema'

export default {
  handler: `${handlerPath(__dirname)}/index.main`,
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
