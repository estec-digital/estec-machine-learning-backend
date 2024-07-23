import { InvocationType, InvokeCommand, LambdaClient, LogType } from '@aws-sdk/client-lambda'

const lambdaClient = new LambdaClient()
export class LambdaService {
  static async invokeFunction(params: { functionName: string; invocationType?: InvocationType; logType?: LogType; payload: object }) {
    console.log({ invokeFunction: JSON.stringify(params) })
    const response = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: params.functionName,
        InvocationType: params.invocationType ?? 'RequestResponse',
        LogType: params.logType ?? 'None',
        Payload: JSON.stringify(params.payload ?? {}),
      }),
    )

    if (response.StatusCode !== 200) {
      throw new Error('Failed to get response from lambda function')
    }
    return JSON.parse(response.Payload as any as string)
  }
}
