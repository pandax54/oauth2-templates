import { OAuthPlatform  } from '@app/common/enums'
import { config } from '@app/config'
import jwt from 'jsonwebtoken'


/**
 * Auth tokens (Bearer token)
 */

interface AuthPayload {
  userId: number
}

export function createAuthJwt(data: AuthPayload) {
  return jwt.sign(data, config.auth.authTokenSecret, { expiresIn: config.auth.authTokenExpiration })
}

export function verifyAuthJwt(data: { token: string }) {
  return jwt.verify(data.token, config.auth.authTokenSecret) as AuthPayload
}


/**
 * OAuth2 Connection
 */

export interface OAuthConnectionPayload {
  userId: number
  platform: OAuthPlatform
}

export function createOAuthConnectionJwt(data: OAuthConnectionPayload) {
  return jwt.sign(data, config.auth.oauthConnectionTokenSecret, { expiresIn: '1d' })
}

export async function verifyOAuthConnectionJwt(data: { token: string }) {
  return jwt.verify(data.token, config.auth.oauthConnectionTokenSecret) as OAuthConnectionPayload
}

