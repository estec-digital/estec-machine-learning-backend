import { APIGatewayAuthorizerEvent } from 'aws-lambda'
import jwt from 'jsonwebtoken'
import { AuthService } from '~services/Auth'

// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html

interface IAuthEvent {
  authorizationToken: string
  requestContext: {
    apiId: string
    accountId: string
    requestId: string
    queryString: string
    operationName: string
    variables: {}
  }
}

exports.main = async (event: APIGatewayAuthorizerEvent, context: any, callback: (...params: any) => any) => {
  let token: undefined | string = undefined

  switch (event.type) {
    case 'TOKEN': {
      token = event.authorizationToken
      try {
        const jsonLoginCredential = JSON.parse(event.authorizationToken)
        if (jsonLoginCredential.username && jsonLoginCredential.password) {
          const authResult = await AuthService.login(jsonLoginCredential)
          token = authResult.token
        }
      } catch {}
      break
    }
    case 'REQUEST': {
      token = event.queryStringParameters.authorization
      break
    }
  }

  if (!token) throw new Error('Empty token')

  try {
    const userInfo = jwt.verify(token, process.env.AUTH_LOGIN_JWT_TOKEN)

    const IAMPolicy = {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:invoke',
            Effect: 'Allow',
            Resource: '*',
          },
        ],
      },
      context: {
        authData: JSON.stringify(userInfo),
      }, // In Lambda execution fn: this.event.requestContext.authorizer.authData,
    }
    callback(null, IAMPolicy)
  } catch (error) {
    console.log({ AuthError: error })
    callback('Unauthorized')
  }
}
