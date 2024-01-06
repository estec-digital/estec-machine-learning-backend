import * as GetRequestFunctions from './get-requests'
import { LambdaFunctionConfigs } from './post-requests/routes'

export default {
  PublicFunction: LambdaFunctionConfigs,
  ...GetRequestFunctions,
}
