import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import dayjs from 'dayjs'
import { S3ServiceTypes } from '.'

export class S3Service {
  private s3Client = new S3Client({})

  async logsGetUploadUrl(params: S3ServiceTypes.Logs_GetUploadUrl) {
    const bucketName = process.env.S3_PRIVATE_BUCKET_NAME
    let fileKey = dayjs().format('YYYY-MM-DD HH:mm:ss:SSS')

    if (params.Folder) {
      fileKey = `${params.Folder}${fileKey}`
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: '*',
    })

    return getSignedUrl(this.s3Client as any, command as any, { expiresIn: 3600 })
  }
}
