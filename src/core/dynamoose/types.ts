import { AttributeValue, DynamoDBRecord } from 'aws-lambda'
import { Item } from 'dynamoose/dist/Item'

export type IDynamoDBStreamImage<I extends Item> = {
  [key in keyof I]?: AttributeValue
}

export type IDynamoDBRecord<I> = Omit<DynamoDBRecord, 'dynamodb'> & {
  dynamodb?: {
    ApproximateCreationDateTime?: number
    Keys?: IDynamoDBStreamImage<I & Item>
    NewImage?: IDynamoDBStreamImage<I & Item>
    OldImage?: IDynamoDBStreamImage<I & Item>
    SequenceNumber?: string
    SizeBytes?: number
    StreamViewType?: 'KEYS_ONLY' | 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES'
  }
}
