import Ajv, { Options as AjvOptions } from 'ajv'
import envSchema from 'env-schema'
import { LoggerOptions } from 'pino'

import { Env } from '@app/common/enums'
import { FastifyCorsOptions } from '@fastify/cors'
import { Static, Type } from '@sinclair/typebox'

const appEnv: Env = (process.env.NODE_ENV as Env) ?? Env.Local
const getDefaultPort = () => 8005

const schema = Type.Object({
  PORT: Type.Number({ default: getDefaultPort() }),
  API_URL: Type.String({ default: `http://localhost:${getDefaultPort()}` }),
  AUTH_URL: Type.String({ default: `http://localhost:${getDefaultPort()}` }),
  POSTGRES_URL: Type.String({
    default: 'postgresql://postgres:password@localhost:5432/postgres',
  }),
  // POSTGRES_URL_TEST: Type.Optional(
  //   Type.String({
  //     default: 'postgresql://postgres:password@localhost:5440/dbtest',
  //   })
  JWT_SECRET: Type.String({ default: 'super-secret' }),
  JWT_STORE_CONNECTION_SECRET: Type.String({ default: 'top-secret' }),
  OAUTH_CLIENT_ID: Type.String({ default: 'client_id' }),
  OAUTH_CLIENT_SECRET: Type.String({ default: 'client_secret' }),
  OAUTH_ISSUER: Type.String({ default: 'https://example.com' }),
  OAUTH_APP_NAME: Type.String({ default: 'My APP' }),
  OAUTH_REDIRECT_URI: Type.String({ default: 'http://localhost:3000/stores' }),
})

const env = envSchema<Static<typeof schema>>({
  schema: schema,
  data: process.env,
  ajv: new Ajv({
    useDefaults: [Env.Local, Env.Test].includes(appEnv),
    allErrors: true,
    coerceTypes: true,
    removeAdditional: true,
    allowUnionTypes: true,
  })
    .addKeyword('kind')
    .addKeyword('modifier'),
})

export interface Config {
  port: number
  env: Env
  apiUrl: string

  server: {
    concurrency: number
  }

  support: {
    email: string
  }

  cors: FastifyCorsOptions

  auth: {
    minPasswordLength: number
    resetTokenSecret: string
    saltRounds: number
    authTokenSecret: string
    authUrl: string
    authTokenExpiration: string
    oauthConnectionTokenSecret: string
    updatePhoneTokenSecret: string
  }

  postgres: {
    url: string
    // testUrl: string
  }

  logging: LoggerOptions

  ajv: AjvOptions

  oauth: {
    clientid: string
    clientSecret: string
    issuer: string
    scopes: string,
    redirectUri: string,
  }
}

export const defaultConfig: Config = {
  port: env.PORT,
  env: appEnv,
  apiUrl: env.API_URL,

  support: {
    email: 'email@support.com'
  },

  server: {
    concurrency: 1,
  },

  cors: {
    origin:
      appEnv === Env.Production
        ? [
            'https://example.com',
            'https://other.example.com',
          ]
        : '*',
  },

  auth: {
    saltRounds: 10,
    minPasswordLength: 8,
    authUrl: env.AUTH_URL,
    authTokenExpiration: '30d',
    resetTokenSecret: 'super-secret-reset-token',
    authTokenSecret: env.JWT_SECRET,
    oauthConnectionTokenSecret: env.JWT_STORE_CONNECTION_SECRET,
    updatePhoneTokenSecret: 'ultra-secret-update-phone',
  },

  postgres: {
    url: env.POSTGRES_URL,
    // testUrl: env.POSTGRES_URL_TEST,
  },

  logging: {
    level: appEnv === Env.Test ? 'silent' : 'debug',
  },

  ajv: {
    removeAdditional: 'all',
    useDefaults: true,
  },

  oauth: {
    clientid: env.OAUTH_CLIENT_ID,
    clientSecret: env.OAUTH_CLIENT_SECRET,
    issuer: env.OAUTH_ISSUER,
    scopes: [
      'openid',
      'profile',
      'email',
      'read:appointments',
      'write:appointments',
      'delete:appointments', 
    ].join(' '),
    redirectUri: env.OAUTH_REDIRECT_URI,
  },

}

export const config = defaultConfig
