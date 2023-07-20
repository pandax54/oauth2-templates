import 'make-promises-safe'

import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyStatic from '@fastify/static'
import fastifySwagger from '@fastify/swagger'
import fastify, { FastifyInstance } from 'fastify'
import fastifyRawBody from 'fastify-raw-body'
import qs from 'query-string'
import { join } from 'path'
import { authRoutes } from '@app/routes/auth'
import { Env } from '@app/common/enums'
import { logger } from '@app/common/logger'
import { config } from '@app/config'
import { apiOpenApiConfig } from '@app/config/openapi'
import { database } from '@app/database'
import { errorHandler } from '@app/plugins/error-handler'
import { oauthRoutes } from '@app/routes/oauth'

const startedAt = new Date().toISOString()

let app: FastifyInstance

export function setup() {
  if (app?.version) {
    return app
  } else {
    app = fastify({
      exposeHeadRoutes: false,
      trustProxy: true,
      ignoreTrailingSlash: true,
      ajv: { customOptions: { keywords: ['modifier', 'kind'], useDefaults: true } },
      querystringParser: (str) => qs.parse(str, { arrayFormat: 'bracket' }),
    })
  }

  // Plugins
  app.register(fastifyCors, config.cors)
  app.register(fastifyRawBody, { global: false })
  app.register(fastifySwagger, apiOpenApiConfig)
  app.register(fastifyMultipart, { attachFieldsToBody: true })
  app.register(fastifyRateLimit, { max: 200, timeWindow: '1 minute' })

  if (config.env !== Env.Production) {
    app.register(fastifyStatic, {
      prefixAvoidTrailingSlash: true,
      prefix: '/docs',
      root: join(__dirname, '../docs/api'),
    })
    app.get('/spec', async () => app.swagger())
  }

  // Routes
  app
    .get('/', async () => ({ startedAt }))
    .register(authRoutes, { prefix: '/' })
    .register(oauthRoutes, { prefix: '/oauth' })

  app.setErrorHandler(errorHandler)

  return app
}

export async function start() {
  // Expected termination
  process.once('SIGINT', async () => stop())
  process.once('SIGTERM', async () => stop())
  process.once('SIGHUP', async () => stop())
  process.once('SIGUSR2', () => process.kill(process.pid, 'SIGUSR2'))

  // Unexpected termination
  process.once('uncaughtException', fatal)

  const server = await setup()

  await app.ready()

  try {
    await database.migrate.latest()
    logger.info(`[Database]: Migrations applied`)

    await database.seed.run()
    logger.info(`[Database]: Seeds applied`)
  } catch (error) {
    return fatal(error)
  }

  return server.listen({ host: '0.0.0.0', port: config.port }, (err) => {
    if (err) return fatal(err)
    logger.info(`[API]: Started on port ${config.port} on "${config.env}" env`)
  })
}

export function fatal(err: Error) {
  logger.error(`[🔴 Fatal] ${err.stack}`)
  process.removeAllListeners('uncaughtException')
}

export async function stop() {
  if (!app) return

  await app?.close()

  process.removeAllListeners('SIGINT')
  process.removeAllListeners('SIGTERM')
  process.removeAllListeners('SIGHUP')
}
