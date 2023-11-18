import type { AWS, AwsLogRetentionInDays } from '@serverless/typescript'
import * as dotenv from 'dotenv'
import { apiGatewayResources } from '~aws_resources/api-gateway'

dotenv.config()

// Admin
// import AdminFunction from '~functions/Admin/routes'
// Auth
import AuthFunction from '~functions/Auth/routes'
import AuthTokenValidation from '~functions/AuthTokenValidation/routes'
// Data
import DataFunction from '~functions/Data/routes'
// WebSocket
import WebSocketFunction from '~functions/WebSocket/routes'
// Public functions (object)
import PublicFunctions from '~functions/Public/routes'

// DynamoDB stream
import { dynamoDBEnvironmentVariables, dynamoDBResources } from '~aws_resources/dynamodb'
import { s3EnvironmentVariables, s3Resources } from '~aws_resources/s3'
import DynamoDBStream from '~functions/DynamoDBStream/routes'

// const serviceName = 'estec-backend'
// const defaultStage = 'alpha'

const serverlessConfiguration: AWS = {
  service: 'estec-backend',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dotenv-plugin'],
  provider: {
    // Cloud provider's name and region
    name: (process.env.PROVIDER_NAME ?? 'aws') as AWS['provider']['name'],
    region: (process.env.REGION ?? 'ap-southeast-1') as AWS['provider']['region'],
    versionFunctions: false,

    // CloudFormation stage
    stage: process.env.STAGE ?? '${opt:stage, "alpha"}',

    // AWS Lambda configs
    runtime: 'nodejs16.x',
    timeout: 10,
    memorySize: 1024,

    // vpc: {
    //   securityGroupIds: JSON.parse(process.env.SECURITY_GROUP_IDS ?? '[]'),
    //   subnetIds: JSON.parse(process.env.SUBNET_IDS ?? '[]'),
    // },

    // AWS API Gateway configs
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },

    // Environment variables
    environment: {
      SERVICE: '${self:service}',
      STAGE: '${self:provider.stage}',
      REGION: '${self:provider.region}',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      // WEBSOCKET_ENDPOINT: '${self:provider.stage}-${self:service}-websockets',
      WEBSOCKET_WSS_ENDPOINT: {
        'Fn::Join': ['', ['wss://', { Ref: 'WebsocketsApi' }, '.execute-api.${self:provider.region}.amazonaws.com/${self:provider.stage}']],
      },
      WEBSOCKET_HTTPS_ENDPOINT: {
        'Fn::Join': ['', ['https://', { Ref: 'WebsocketsApi' }, '.execute-api.${self:provider.region}.amazonaws.com/${self:provider.stage}']],
      },
      ...dynamoDBEnvironmentVariables,
      ...s3EnvironmentVariables,
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['*'],
            Resource: `*`,
          },
        ],
      },
    },
    logRetentionInDays: Number('${custom.logRetentionInDays.${custom.stage}}' ?? '7') as unknown as AwsLogRetentionInDays,
  },

  // AWS Lambda functions declaration
  functions: {
    // AdminFunction,
    AuthFunction,
    AuthTokenValidation,
    DataFunction,
    WebSocketFunction,
    DynamoDBStream,
    ...PublicFunctions,
  },
  package: {
    individually: true,
    exclude: ['./node_modules/**'],
    excludeDevDependencies: true,
  },

  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    logRetentionInDays: {
      prod: 90,
      dev: 7,
      alpha: 7,
      beta: 7,
      edu: 7,
    },
    'serverless-offline': {
      httpPort: 4000,
      lambdaPort: 4002,
    },
  },

  resources: {
    Resources: {
      ...dynamoDBResources,
      ...apiGatewayResources,
      ...s3Resources,
    },
  },
}

module.exports = serverlessConfiguration
