import { Lambda } from 'aws-sdk'
import { InvocationType, LogType } from 'aws-sdk/clients/lambda'
const lambda = new Lambda()

export class LambdaService {
  static async invokeFunction(params: { functionName: string; invocationType?: InvocationType; logType?: LogType; payload: object }) {
    console.log({ invokeFunction: JSON.stringify(params) })
    const response = await lambda
      .invoke({
        FunctionName: params.functionName,
        InvocationType: params.invocationType ?? 'RequestResponse',
        LogType: params.logType ?? 'None',
        Payload: JSON.stringify(params.payload ?? {}),
      })
      .promise()
    if (response.StatusCode !== 200) {
      throw new Error('Failed to get response from lambda function')
    }
    return JSON.parse(response.Payload as string)
  }
}
