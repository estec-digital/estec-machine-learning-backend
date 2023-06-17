import * as dynamoose from 'dynamoose'
import { Item } from 'dynamoose/dist/Item'

export class CUser extends Item {
  Username: string
  EncryptedPassword: string
  FirstName: string
  LastName: string
  Email: string
}

const userSchema = new dynamoose.Schema(
  {
    Username: {
      type: String,
      hashKey: true,
    },
    EncryptedPassword: {
      type: String,
    },
    FirstName: {
      type: String,
    },
    LastName: {
      type: String,
    },
    Email: {
      type: String,
    },
  },
  {
    saveUnknown: false,
    timestamps: {
      createdAt: ['CreatedAt'],
      updatedAt: ['UpdatedAt'],
    },
  },
)

export const User = dynamoose.model<CUser>(process.env.DYNAMO_DB_TABLE_NAME__UserTable, userSchema)
