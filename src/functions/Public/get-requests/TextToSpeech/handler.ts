import { APIGatewayEvent, Context } from 'aws-lambda'
import { Polly } from 'aws-sdk'
import { HttpStatusCode } from 'axios'
import { middyfy } from '~core/lambda/lambda'

const polly = new Polly()

async function handler(event: APIGatewayEvent, context: Context) {
  const params = Object.assign(
    {
      speechRate: 1,
      text: '',
      voiceId: 'Matthew',
      languageCode: 'en-US',
      engine: 'standard',
    },
    event.queryStringParameters,
  )

  const synthesizeSpeechInput: Polly.SynthesizeSpeechInput = {
    OutputFormat: 'mp3',
    Text: `<speak><prosody rate="${params.speechRate ?? 1}">${params.text}</prosody></speak>`,
    TextType: 'ssml',
    VoiceId: params.voiceId ?? 'Matthew',
    LanguageCode: params.languageCode ?? 'en-US',
    Engine: params.engine ?? 'standard',
  }

  const data = await polly.synthesizeSpeech(synthesizeSpeechInput).promise()
  const audioStream = data.AudioStream
  const audioBuffer = Buffer.from(audioStream as any)
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
