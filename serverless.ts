import type { AWS, AwsLogRetentionInDays } from '@serverless/typescript'
import * as dotenv from 'dotenv'
import { apiGatewayResources } from '~aws_resources/api-gateway'
import { dynamoDBEnvironmentVariables, dynamoDBResources } from '~aws_resources/dynamodb'

// Admin
import AdminFunction from '~functions/Admin/routes'

// Auth
import AuthFunction from '~functions/Auth/routes'
import AuthTokenValidation from '~functions/AuthTokenValidation/routes'

// Data
import DataFunction from '~functions/Data/routes'

dotenv.config()

const serverlessConfiguration: AWS = {
  service: 'estec-backend',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dotenv-plugin'],
  provider: {
    // Cloud provider's name and region
    name: 'aws',
    // region: 'ap-southeast-1',
    region: 'eu-north-1',

    // CloudFormation stage
    stage: '${opt:stage, "alpha"}',

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
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      ...dynamoDBEnvironmentVariables,
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
    AdminFunction,
    AuthFunction,
    AuthTokenValidation,
    DataFunction,
  },
  package: { individually: true },
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
    },
  },
}

module.exports = serverlessConfiguration
