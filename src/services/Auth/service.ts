import bcrypt from 'bcryptjs'
import { Item } from 'dynamoose/dist/Item'
import jwt from 'jsonwebtoken'
import * as lodash from 'lodash'
import { Factory, IUser, User } from '~aws_resources/dynamodb/tables'
import * as Types from './types'

export class AuthService {
  public static async register(params: Types.IRegister): Promise<Types.IRegisterResponse> {
    const [existingFactory, existingUser] = await Promise.all([Factory.model.get({ FactoryId: params.factoryId }), User.model.get(params.username)])

    if (!existingFactory) {
      throw new Error('Factory is not exist')
    }

    if (existingUser) {
      throw new Error('User is already registered. Please login.')
    }

    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(params.password, salt)

    await User.model.create({
      Username: params.username,
      FactoryId: existingFactory.FactoryId,
      EncryptedPassword: hashedPassword,
    })

    return {
      message: 'Created user successfully!',
      user: {
        Username: params.username,
      },
    }
  }

  public static generateAuthUserInfo(user: IUser & Item): Types.TJwtAuthUserInfo {
    const _user = lodash.cloneDeep(user.toJSON()) as IUser
    delete _user.EncryptedPassword
    return _user
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
        const authData = AuthService.generateAuthUserInfo(existingUser)

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
