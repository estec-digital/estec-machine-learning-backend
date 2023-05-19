import type { AWS, AwsLogRetentionInDays } from '@serverless/typescript'
import * as dotenv from 'dotenv'

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
    region: 'ap-southeast-1',

    // CloudFormation stage
    stage: '${opt:stage, "alpha"}',

    // AWS Lambda configs
    runtime: 'nodejs16.x',
    timeout: 10,
    memorySize: 1024,

    vpc: {
      securityGroupIds: JSON.parse(process.env.SECURITY_GROUP_IDS ?? '[]'),
      subnetIds: JSON.parse(process.env.SUBNET_IDS ?? '[]'),
    },

    // AWS API Gateway configs
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },

    // Environment variables
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      S3_IMAGE_BUCKET: {
        Ref: 'ImageBucket',
      },
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
      ImageBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedOrigins: ['*'],
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                MaxAge: 3000,
              },
            ],
          },
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: false,
            BlockPublicPolicy: false,
            IgnorePublicAcls: false,
            RestrictPublicBuckets: false,
          },
        },
      },
      ImageBucketBucketPolicy: {
        Type: 'AWS::S3::BucketPolicy',
        Properties: {
          Bucket: { Ref: 'ImageBucket' },
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: {
                  'Fn::Join': ['', ['arn:aws:s3:::', { Ref: 'ImageBucket' }, '/*']],
                },
              },
            ],
          },
        },
      },
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
    },
    Outputs: {
      AttachmentsBucketName: {
        Value: {
          Ref: 'ImageBucket',
        },
      },
    },
  },
}

module.exports = serverlessConfiguration
