import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda'
import type { FromSchema } from 'json-schema-to-ts'

export type GetEvent<S> = Omit<APIGatewayProxyEvent, 'queryStringParameters'> & {
  queryStringParameters: FromSchema<S>
}
export type PostEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }

export type GetHandlerFunction<S> = Handler<GetEvent<S>, APIGatewayProxyResult>
export type PostHandlerFunction<S> = Handler<PostEvent<S>, APIGatewayProxyResult>

interface IHandlerFunctionResponse {
  statusCode?: number
  body: any
}

export interface ILambdaResponse {
  statusCode: number
  headers: Record<any, any>
  body: string
}

export const formatJSONSuccessResponse = ({ statusCode = 200, body }: IHandlerFunctionResponse): ILambdaResponse => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    body: JSON.stringify(body),
  }
}

export const formatJSONErrorResponse = ({ statusCode = 500, body }: IHandlerFunctionResponse): ILambdaResponse => {
  if (typeof body === 'string') {
    body = { message: body }
  } else if (body instanceof Error) {
    body = body.message ? { message: body.message } : body
  } else {
    body = { message: 'Unknown error' }
  }

  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    },
    body: JSON.stringify(body),
  }
}
