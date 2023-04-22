import { DeepPartial } from 'typeorm'
import { User } from '~db/entities/User'

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
  user: DeepPartial<User>
  token: string
}

export interface IJwtAuthData {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
}
