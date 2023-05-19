import { AWS } from '@serverless/typescript'

export const apiGatewayResources: Omit<AWS['resources']['Resources'], 'Fn::Transform'> = {
  GatewayResponse: {
    Type: 'AWS::ApiGateway::GatewayResponse',
    Properties: {
      ResponseParameters: {
        'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
        'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
      },
      ResponseType: 'DEFAULT_4XX',
      RestApiId: {
        Ref: 'ApiGatewayRestApi',
      },
      StatusCode: '401',
    },
  },
}
