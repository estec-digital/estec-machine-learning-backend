import { CUser } from '~root/dynamodb/schema/UserTable'

export interface IRegister {
  username: string
  password: string
}

export interface IRegisterResponse {}

export interface ILogin {
  username: string
  password: string
}

export interface ILoginResponse {
  message: string
  user: Partial<CUser>
  token: string
}

export type TJwtAuthData = Pick<CUser, 'Username' | 'FirstName' | 'LastName' | 'Email'>
