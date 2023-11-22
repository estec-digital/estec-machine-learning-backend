import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { APIGatewayEvent, Context } from 'aws-lambda'
import { HttpStatusCode } from 'axios'
import { middyfy } from '~core/lambda/lambda'
import { base64decode } from '~shared/utils'
import { GenerateTextToSpeech } from './types'

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

  const credentials = JSON.parse(base64decode(process.env.GCP_CREDENTIALS_BASE64) ?? '{}')

  const client = new TextToSpeechClient({ credentials })

  const [response] = await client.synthesizeSpeech({
    input: { text: params.text },
    voice: { languageCode: 'vi-VN', name: 'vi-VN-Wavenet-A', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'OGG_OPUS' },
  })

  const audioBuffer = Buffer.from(response.audioContent)
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

export const main = middyfy(handler)
