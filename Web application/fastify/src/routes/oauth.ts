import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import * as oauthService from '@app/services/oauth2'
import { OAuthPlatform } from '@app/common/enums'

export const oauthRoutes = async (app: FastifyInstance): Promise<void> => {
  app.route({
    method: 'GET',
    url: '/oauth-connect',
    handler: async (req: FastifyRequest, reply: FastifyReply) => {
      const client = oauthService.createClient({ platform: OAuthPlatform.OAUTH })
      const url = client.getAuthorizationUrl({ state: 'test' })
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
      console.log('redirect')
      console.log(req.query)
      console.log(req.body)
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
    handler: async (req: FastifyRequest<{ Params: { code: string, state: string } }>, reply: FastifyReply) => {
      const { code, state } = req.params
      if (state !== 'test') {
        throw new Error('Invalid state')
      }
      console.log(req.query)
      // https://13a5-168-195-163-80.ngrok-free.app/callback?code=bei3giXqqxHu9cKI4x-FFgvkHcL_CzY-wXRW4BMp3U_im&state=test
      const client = oauthService.createClient({ platform: OAuthPlatform.OAUTH })
      const tokenSet = await client.createTokenSet({ extraParams: { code } })
      reply.send(tokenSet)
    },
    schema: {
      querystring: {},
      tags: ['OAuth'],
      description: 'Get code and state for token request',
    },
  })

  app.route({
    method: 'GET',
    url: '/user-info',
    handler: async (req: FastifyRequest<{ Body: { accessToken: string } }>, reply: FastifyReply) => {
      console.log('user-info')
      console.log(req.body)
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
