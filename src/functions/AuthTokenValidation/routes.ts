import { handlerPath } from '~core/lambda/handler-resolver'

const AuthTokenValidation = {
  handler: `${handlerPath(__dirname)}/index.main`,
}

export default AuthTokenValidation
