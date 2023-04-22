import jwt from 'jsonwebtoken'

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

exports.main = async (event: IAuthEvent, context: any, callback: (...params: any) => any) => {
  const { authorizationToken } = event

  try {
    const userInfo = jwt.verify(authorizationToken, process.env.AUTH_LOGIN_JWT_TOKEN)

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
    // console.log('Auth failed!')
    callback('Unauthorized')
  }
}
