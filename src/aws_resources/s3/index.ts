import { AWS } from '@serverless/typescript'

const bucketName = 'EstecElskin'

export const s3Resources: Omit<AWS['resources']['Resources'], 'Fn::Transform'> = {
  [bucketName]: {
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
      // Public access
      // PublicAccessBlockConfiguration: {
      //   BlockPublicAcls: false,
      //   BlockPublicPolicy: false,
      //   IgnorePublicAcls: false,
      //   RestrictPublicBuckets: false,
      // },
    },
  },
  // [`${bucketName}BucketPolicy`]: {
  //   Type: 'AWS::S3::BucketPolicy',
  //   Properties: {
  //     Bucket: { Ref: bucketName },
  //     PolicyDocument: {
  //       Version: '2012-10-17',
  //       Statement: [
  //         // Public access
  //         {
  //           Effect: 'Allow',
  //           Principal: '*',
  //           Action: ['s3:GetObject'],
  //           Resource: {
  //             'Fn::Join': ['', ['arn:aws:s3:::', { Ref: bucketName }, '/*']],
  //           },
  //         },
  //       ],
  //     },
  //   },
  // },
}

export const s3EnvironmentVariables = {
  S3_PRIVATE_BUCKET_NAME: {
    Ref: bucketName,
  },
}
