import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as lodash from 'lodash'
import { CUser, User } from '~db_nosql/schema/UserTable'
import * as Types from '../types'

export class AuthService {
  public static async register(params: Types.IRegister): Promise<Types.IRegisterResponse> {
    const existingUser = await User.get(params.username)

    if (existingUser instanceof User) {
      throw new Error('User is already registered. Please login.')
    }

    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(params.password, salt)

    await User.create({
      username: params.username,
      encryptedPassword: hashedPassword,
    })

    return {
      message: 'Created user successfully!',
      user: {
        username: params.username,
      },
    }
  }

  public static async login(params: Types.ILogin): Promise<Types.ILoginResponse> {
    const AUTH_LOGIN_JWT_TOKEN = process.env.AUTH_LOGIN_JWT_TOKEN
    const AUTH_LOGIN_JWT_TOKEN_EXPIRES_IN = process.env.AUTH_LOGIN_JWT_TOKEN_EXPIRES_IN
    if (!(AUTH_LOGIN_JWT_TOKEN && AUTH_LOGIN_JWT_TOKEN_EXPIRES_IN)) {
      throw new Error('Auth system is unavailable now!')
    }

    const existingUser = await User.get(params.username)

    if (existingUser instanceof User) {
      if (bcrypt.compareSync(params.password, existingUser.encryptedPassword)) {
        const authData: Types.IJwtAuthData = lodash.pick<CUser>(existingUser, [
          'id',
          'username',
          'firstName',
          'lastName',
          'email',
          'fullName',
          'createdAt',
          'updatedAt',
        ]) as Types.IJwtAuthData

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
