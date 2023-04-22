import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as lodash from 'lodash'
import { User } from '~db/entities/User'
import * as Types from '../types'

export class AuthService {
  public static async register(params: Types.IRegister): Promise<Types.IRegisterResponse> {
    const existingUser = await User.findOneBy({ username: params.username })

    if (existingUser instanceof User) {
      throw new Error('User is already registered. Please login.')
    }

    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(params.password, salt)

    const newUser = new User()
    newUser.username = params.username
    newUser.password = hashedPassword
    await newUser.save()

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

    const existingUser = await User.findOne({
      select: {
        id: true,
        username: true,
        password: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        username: params.username,
      },
    })

    if (existingUser instanceof User) {
      if (bcrypt.compareSync(params.password, existingUser.password)) {
        const authData: Types.IJwtAuthData = lodash.pick<User>(existingUser, [
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
