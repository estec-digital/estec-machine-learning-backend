import * as AWS from 'aws-sdk'
import dayjs from 'dayjs'
import { S3ServiceTypes } from '.'

export class S3Service {
  private s3: AWS.S3

  constructor() {
    this.s3 = new AWS.S3({ signatureVersion: 'v4' })
  }

  async logsGetUploadUrl(params: S3ServiceTypes.Logs_GetUploadUrl) {
    const bucketName = process.env.S3_BUCKET_NAME
    let fileKey = dayjs().format('YYYY-MM-DD HH:mm:ss:SSS')

    if (params.Folder) {
      fileKey = `${params.Folder}${fileKey}`
    }

    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Expires: 600, // URL will be expired in 10mins
      ContentType: '*',
    }

    return await this.s3.getSignedUrlPromise('putObject', uploadParams)
  }
}
