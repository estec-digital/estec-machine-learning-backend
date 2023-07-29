import { IUser } from '~aws_resources/dynamodb/User'

export interface IRegister {
  username: string
  password: string
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
  user: Partial<IUser>
  token: string
}

export type TJwtAuthData = Pick<IUser, 'Username' | 'FirstName' | 'LastName' | 'Email'>
