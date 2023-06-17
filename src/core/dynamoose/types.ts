import { AttributeValue, DynamoDBRecord } from 'aws-lambda'
import { Item } from 'dynamoose/dist/Item'

export type IDynamoDBStreamImage<I extends Item> = {
  [key in keyof I]?: AttributeValue
}

export type IDynamoDBRecord<I extends Item> = Omit<DynamoDBRecord, 'dynamodb'> & {
  dynamodb?: {
    ApproximateCreationDateTime?: number
    Keys?: IDynamoDBStreamImage<I>
    NewImage?: IDynamoDBStreamImage<I>
    OldImage?: IDynamoDBStreamImage<I>
    SequenceNumber?: string
    SizeBytes?: number
    StreamViewType?: 'KEYS_ONLY' | 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES'
  }
}
