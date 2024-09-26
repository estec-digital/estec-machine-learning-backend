import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech'
import { APIGatewayEvent, Context } from 'aws-lambda'
import { HttpStatusCode } from 'axios'
import objectHash from 'object-hash'
import { middyfy } from '~core/lambda/lambda'
import { base64decode } from '~shared/utils'
import { GenerateTextToSpeech } from './types'

const s3Client = new S3Client({})

async function handler(event: APIGatewayEvent, context: Context) {
  const params = event.queryStringParameters ?? ({} as GenerateTextToSpeech)

  if (!params.text) {
    return {
      statusCode: HttpStatusCode.Ok,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Missing text in queryParams',
      }),
    }
  }

  console.log({ text: params.text })

  const synthesizeSpeechRequest: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
    input: { text: params.text },
    voice: { languageCode: 'vi-VN', name: 'vi-VN-Wavenet-A', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'OGG_OPUS' },
  }

  const audioHash = `PollyOutputs/${objectHash(synthesizeSpeechRequest)}`

  try {
    const headObjectResponse = await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.S3_PRIVATE_BUCKET_NAME,
        Key: audioHash,
      }),
    )

    if (headObjectResponse.ETag) {
      const getObjectResponse = await s3Client.send(
        new GetObjectCommand({
          Bucket: process.env.S3_PRIVATE_BUCKET_NAME,
          Key: audioHash,
        }),
      )

      const audioBuffer = Buffer.from(getObjectResponse.Body as any)
      const audioBase64 = audioBuffer.toString('base64')
      return {
        statusCode: HttpStatusCode.Ok,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': 'inline; filename="speech.mp3"',
        },
        isBase64Encoded: true,
        body: audioBase64,
      }
    }
  } catch (error) {}

  // Audio not exist in S3
  const credentials = JSON.parse(base64decode(process.env.GCP_CREDENTIALS_BASE64) ?? '{}')
  const client = new TextToSpeechClient({ credentials })
  const [response] = await client.synthesizeSpeech(synthesizeSpeechRequest)

  const audioBuffer = Buffer.from(response.audioContent)
  const audioBase64 = audioBuffer.toString('base64')

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_PRIVATE_BUCKET_NAME,
      Key: audioHash,
      Body: audioBuffer,
    }),
  )

  return {
    statusCode: HttpStatusCode.Ok,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename="speech.mp3"',
    },
    isBase64Encoded: true,
    body: audioBase64,
  }
}

export const main = middyfy(handler)
