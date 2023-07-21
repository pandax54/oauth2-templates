import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import * as oauthService from '@app/services/oauth2'
import { OAuthPlatform } from '@app/common/enums'
// import { authorize } from '@app/plugins/authorization'

export const oauthRoutes = async (app: FastifyInstance): Promise<void> => {
  app.route({
    method: 'GET',
    url: '/oauth-connect',
    handler: async (req: FastifyRequest, reply: FastifyReply) => {
      const client = oauthService.createClient({ platform: OAuthPlatform.OAUTH })
      const url = client.getAuthorizationUrl({ state: '79db51f0ae12083bffe3bc231b4afe156dce967437a3b7f4a11ee725' })
      reply.redirect(url)
    },
    schema: {
      querystring: {},
      tags: ['OAuth'],
      description: 'Connect to OAuth',
    },
  })

  app.route({
    method: 'GET',
    url: '/redirect',
    handler: async (req: FastifyRequest, reply: FastifyReply) => {
      reply.send('redirect')
    },
    schema: {
      querystring: {},
      tags: ['OAuth'],
      description: 'Redirect to app',
    },
  })

  app.route({
    method: 'GET',
    url: '/callback',
    handler: async (req: FastifyRequest<{ Querystring: { code: string, state: string } }>, reply: FastifyReply) => {
      const { code, state } = req.query
      // make state dynamic, but also if you're using PKCE it's not necessary
      if (state != '79db51f0ae12083bffe3bc231b4afe156dce967437a3b7f4a11ee725') {
        throw new Error('Invalid state')
      }
      // example: url/callback?code=bei3giXqqxHu9cKI4x-FFgvkHcL_CzY-wXRW4BMp3U_im&state=test
      const client = oauthService.createClient({ platform: OAuthPlatform.OAUTH })
      const tokenSet = await client.createTokenSet({ url: req.url, extraParams: { code } })

      reply.send(tokenSet)
    },
    schema: {
      querystring: {},
      tags: ['OAuth'],
      description: 'Get code and state for token request',
    },
  })

  app.route({
    method: 'POST',
    url: '/refresh-token',
    handler: async (req: FastifyRequest<{ Body: { refresh: string } }>, reply: FastifyReply) => {
      // refresh token should be store in db
      const { refresh } = req.body
      const client = oauthService.createClient({ platform: OAuthPlatform.OAUTH })
      const tokenSet = await client.refreshTokenSet({refreshToken: refresh})
      reply.send(tokenSet)
    },
    schema: {
      querystring: {},
      tags: ['OAuth'],
      description: 'Use refresh token to generate new token set',
    },
  })

  app.route({
    method: 'POST',
    url: '/user-info',
    // preHandler: authorize, // add Bearer token for requests TODO create user and add token to db
    handler: async (req: FastifyRequest<{ Body: { accessToken: string } }>, reply: FastifyReply) => {
      // store access token in db
      const client = oauthService.createClient({ platform: OAuthPlatform.OAUTH })
      const user = await client.userinfo(req.body.accessToken, { method: 'GET' })
      reply.send(user)
    },
    schema: {
      querystring: {},
      tags: ['OAuth'],
      description: 'Get user info',
    },
  })
}
