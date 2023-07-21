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
    codeVerifier: 'c55729e2222908b5780080ff4ad8fc9812612c6e293444ba65048152', // make it dynamic using db
    redirectUri: 'http://localhost:8005/oauth/callback',
    codeAlgorithm: 'S256',
    client: {
      clientId: config.oauth.clientid,
      clientSecret: config.oauth.clientSecret,
      responseTypes: ['code'],
    },
    // openID config: https://dev-pip2r20aaaid2plx.us.auth0.com/.well-known/openid-configuration 
    issuer: {
      jwksUri: 'https://dev-pip2r20aaaid2plx.us.auth0.com/.well-known/jwks.json',
      issuer: config.oauth.issuer,
      authorizationEndpoint: 'https://dev-pip2r20aaaid2plx.us.auth0.com/authorize',
      tokenEndpoint: 'https://dev-pip2r20aaaid2plx.us.auth0.com/oauth/token',
      userinfoEndpoint: 'https://dev-pip2r20aaaid2plx.us.auth0.com/userinfo',
      introspectionEndpoint: 'https://dev-pip2r20aaaid2plx.us.auth0.com/oauth/token', // The Introspection endpoint is an optional OIDC endpoint that allows the client to check the validity of an access token. Not always available though.
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
    getIssuerInfo(url: string) {
      // This method discovers the OpenID Connect provider's configuration by querying the well-known OpenID Connect discovery document at the given url. It retrieves important information such as the issuer's endpoints, supported scopes, claims, and other OIDC-related configurations
      return Issuer.discover(url)
    },
    async introspectToken(accessToken: string) {
      return client.introspect(accessToken)
    },
    getAuthorizationUrl(input: { state: string;[key: string]: unknown }) {
      // const codeVerifier = generators.codeVerifier()
      const codeChallenge = generators.codeChallenge(providerConfig.codeVerifier)

      const { state, ...params } = input

      console.log('metadata:', client.issuer.metadata)

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

      // client.callback() instead of client.oauthCallback() if you don't need to validate the state
      const tokenSet = await client.callback(providerConfig.redirectUri, params, {
        code_verifier: providerConfig.codeVerifier,
        ...input.extraParams,
      })

      return camelCaseKeys(tokenSet, { deep: true }) as CC<TokenSet>
    },
    async createTokenSetWithState(input: { url?: string, extraParams?: Record<string, unknown> }) {
      const params = client.callbackParams(input?.url)

      const tokenSet = await client.oauthCallback(providerConfig.redirectUri, params, {
        state: params.state,
        code_verifier: providerConfig.codeVerifier,
        ...input.extraParams,
      })

      return camelCaseKeys(tokenSet, { deep: true }) as CC<TokenSet>
    },
    async refreshTokenSet(input: { refreshToken: string }) {
      const tokenSet = await client.refresh(input.refreshToken)

      return camelCaseKeys(tokenSet, { deep: true }) as CC<TokenSet>
    },
    async revokeToken(input: { token: string; tokenTypeHint?: string }) {
      // tokenTypeHint:  'access_token' | 'refresh_token' | string;
      return client.revoke(input.token, input.tokenTypeHint)
    },
    userinfo<TUserInfo>(
      accessToken: string,
      options?: { method?: 'GET' | 'POST'; via?: 'header' | 'body'; tokenType?: string, params?: Record<string, unknown> }
    ) {
      const token = new TokenSet({ access_token: accessToken }) // add expires_at / expires_in 
      // console.log('token:', token.claims()) // id_token needs to be present in TokenSet
      // https://github.com/panva/node-openid-client/blob/main/docs/README.md#tokensetexpired
      if (token.expired()) {
        throw new Error('Token expired')
      }
      return client.userinfo<TUserInfo>(accessToken, options)
    },
  }
}
