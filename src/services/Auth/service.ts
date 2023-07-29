import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as lodash from 'lodash'
import { IUser, User } from '~aws_resources/dynamodb/User'
import * as Types from './types'

export class AuthService {
  public static async register(params: Types.IRegister): Promise<Types.IRegisterResponse> {
    const existingUser = await User.model.get(params.username)

    if (existingUser) {
      throw new Error('User is already registered. Please login.')
    }

    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(params.password, salt)

    await User.model.create({
      Username: params.username,
      EncryptedPassword: hashedPassword,
    })

    return {
      message: 'Created user successfully!',
      user: {
        Username: params.username,
      },
    }
  }

  public static async login(params: Types.ILogin): Promise<Types.ILoginResponse> {
    const AUTH_LOGIN_JWT_TOKEN = process.env.AUTH_LOGIN_JWT_TOKEN
    const AUTH_LOGIN_JWT_TOKEN_EXPIRES_IN = process.env.AUTH_LOGIN_JWT_TOKEN_EXPIRES_IN
    if (!(AUTH_LOGIN_JWT_TOKEN && AUTH_LOGIN_JWT_TOKEN_EXPIRES_IN)) {
      throw new Error('Auth system is unavailable now!')
    }

    const existingUser = await User.model.get(params.username)

    if (existingUser) {
      if (bcrypt.compareSync(params.password, existingUser.EncryptedPassword)) {
        const authData: Types.TJwtAuthData = lodash.pick<IUser>(existingUser, ['Username', 'FirstName', 'LastName', 'Email']) as Types.TJwtAuthData

        return {
          message: 'Login successfully!',
          user: authData,
          token: jwt.sign(authData, AUTH_LOGIN_JWT_TOKEN, { expiresIn: AUTH_LOGIN_JWT_TOKEN_EXPIRES_IN }),
        }
      }
    }

    throw new Error('Invalid credential. Please try again.')
  }
}
