import { FastifyDynamicSwaggerOptions } from '@fastify/swagger'

export const apiOpenApiConfig: FastifyDynamicSwaggerOptions = {
  exposeRoute: false,
  hideUntagged: true,
  openapi: {
    info: {
      title: 'API',
      version: '1.0.0',
      description: `Documentation for REST API`,
      contact: { email: 'admin@example.com' },
      // @ts-ignore
      'x-logo': {
        url: '/docs/logo.png',
      },
    },
    servers: [],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          name: 'Bearer',
          in: 'header',
        },
      },
    },
  },
}
