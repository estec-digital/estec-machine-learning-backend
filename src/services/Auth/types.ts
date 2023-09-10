import { IUser } from '~aws_resources/dynamodb/tables'

export interface IRegister {
  username: string
  password: string
  factoryId: string
}

export interface IRegisterResponse {
  message: string
  user: {
    Username: string
  }
}

export interface ILogin {
  username: string
  password: string
}

export interface ILoginResponse {
  message: string
  user: TJwtAuthUserInfo
  token: string
}

export type TJwtAuthUserInfo = Omit<IUser, 'EncryptedPassword'>
