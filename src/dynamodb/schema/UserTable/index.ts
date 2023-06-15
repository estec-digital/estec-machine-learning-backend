import * as dynamoose from 'dynamoose'
import { Item } from 'dynamoose/dist/Item'

export class CUser extends Item {
  username: string
  encryptedPassword: string
}

const userSchema = new dynamoose.Schema(
  {
    username: {
      type: String,
      hashKey: true,
    },
    encryptedPassword: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  {
    saveUnknown: false,
    timestamps: {
      createdAt: ['createdAt'],
      updatedAt: ['updatedAt'],
    },
  },
)

export const User = dynamoose.model<CUser>(process.env.DYNAMO_DB_TABLE_NAME__UserTable, userSchema)
