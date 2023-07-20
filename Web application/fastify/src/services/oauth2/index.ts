import camelCaseKeys from 'camelcase-keys'
import { ClientMetadata, generators, Issuer, IssuerMetadata, TokenSet } from 'openid-client'
import snakecaseKeys from 'snakecase-keys'
// import urlJoin from 'url-join'
import {
  OAuthPlatform
} from '@app/common/enums'
import { CC } from '@app/common/types'
import { config } from '@app/config'

const oauthProviders: {
  [key in OAuthPlatform]?: {
    codeVerifier: string
    codeAlgorithm: string
    redirectUri: string
    scopes: string[]
    issuer: CC<IssuerMetadata>
    client: CC<ClientMetadata>
  }
} = {
  [OAuthPlatform.OAUTH]: {
    scopes: [
      "openid",
      "profile",
      "offline_access",
      "email",
      "read:appointments",
      "write:appointments",
      "delete:appointments"
    ],
    codeVerifier: 'custom-code',
    redirectUri: 'http://localhost:8000//oauth/callback',
    codeAlgorithm: 'S256',
    client: {
      clientId: config.oauth.clientid,
      clientSecret: config.oauth.clientSecret,
      responseTypes: ['code'],
    },
    issuer: {
      issuer: config.oauth.issuer,
      authorizationEndpoint: 'https://dev-pip2r20aaaid2plx.us.auth0.com/authorize',
      tokenEndpoint: 'https://dev-pip2r20aaaid2plx.us.auth0.com/oauth/token',
      userinfoEndpoint: 'https://dev-pip2r20aaaid2plx.us.auth0.com/userinfo'
    },
  },
}

export function getConfig(platform: OAuthPlatform) {
  return oauthProviders[platform]
}

export function createClient(input: { storeUrl?: string; platform: OAuthPlatform }) {
  const { platform } = input

  const providerConfig = getConfig(platform)

  let issuerOptions = { ...providerConfig.issuer }
  let clientOptions = { ...providerConfig.client }

  // prettier-ignore - some plataforms like Shopify requires the store url to be added to the issuer options
  // if ([OAuthPlatform.??].includes(platform)) {
  //   issuerOptions.authorizationEndpoint = urlJoin(storeUrl, issuerOptions.authorizationEndpoint || '')
  //   issuerOptions.tokenEndpoint = urlJoin(storeUrl, issuerOptions.tokenEndpoint || '')
  //   issuerOptions.userinfoEndpoint = urlJoin(storeUrl, issuerOptions.userinfoEndpoint || '')
  // }

  const issuer = new Issuer(snakecaseKeys(issuerOptions, { deep: true }))
  const client = new issuer.Client(snakecaseKeys(clientOptions, { deep: true }))

  return {
    getAuthorizationUrl(input: { state: string;[key: string]: unknown }) {
      // const codeVerifier = generators.codeVerifier()
      const codeChallenge = generators.codeChallenge(providerConfig.codeVerifier)

      const { state, ...params } = input

      return client.authorizationUrl({
        state,
        scope: providerConfig.scopes.join(' '),
        code_challenge: codeChallenge,
        code_challenge_method: providerConfig.codeAlgorithm,
        redirect_uri: providerConfig.redirectUri,
        response_type: 'code',
        ...params,
      })
    },
    async createTokenSet(input: { url?: string, extraParams?: Record<string, unknown> }) {
      const params = client.callbackParams(input?.url)

      const tokenSet = await client.oauthCallback(providerConfig.redirectUri, params, {
        state: params.state,
        response_type: 'code',
        code_verifier: providerConfig.codeVerifier,
        ...input.extraParams,
      })

      return camelCaseKeys(tokenSet, { deep: true }) as CC<TokenSet>
    },
    async refreshTokenSet(input: { refreshToken: string }) {
      const tokenSet = await client.refresh(input.refreshToken)
      // grantType: 'refresh_token',

      return camelCaseKeys(tokenSet, { deep: true }) as CC<TokenSet>
    },
    userinfo<TUserInfo>(
      accessToken: string,
      options?: { method?: 'GET' | 'POST'; via?: 'header' | 'body'; tokenType?: string, params?: Record<string, unknown> }
    ) {
      return client.userinfo<TUserInfo>(accessToken, options)
    },
  }
}
