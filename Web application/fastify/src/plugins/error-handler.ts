import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { HttpError } from 'http-errors'
import { pick } from 'lodash'

import { logger } from '@app/common/logger'
import { NotFoundError } from 'objection'
import { config } from '@app/config'
import { Env } from '@app/common/enums'

interface APIError {
  message: string
  statusCode: number
  stack?: string | Record<string, any>
}

const isOrdersApi = ['true', '1', 1, true].includes(process.env.ORDERS_API)

export async function errorHandler(error: FastifyError, req: FastifyRequest, reply: FastifyReply) {
  let apiError: APIError = {
    message: 'Internal Server Error',
    statusCode: 500,
  }

  if (error instanceof NotFoundError) {
    // Known error (Objection)
    apiError.statusCode = 404
    apiError.message = 'Resource not found'
  } else if (error.validation) {
    // Known error (Fastify/ajv)
    apiError.message = error.message || `Invalid params in '${error.validationContext}'`
    apiError.statusCode = 400
  } else if (error?.name === 'RequestError') {
    // Vesyl API Error

    logger.error(
      { error, ...pick(req, ['body', 'method', 'url', 'user']) },
      `[🔴 VesylAPIError]: ${error?.message || 'Unknown error'}`
    )

    apiError.message = 'Service error. Our team has been notified.'
    apiError.statusCode = 500

    const ErrorInstance = new Error()
    ErrorInstance.name = `VesylAPIError`
    ErrorInstance.stack = error.stack
    ErrorInstance.message = (error as any)?.error?.text || 'Error calling API'

  } else if (error instanceof HttpError) {
    // Known error (http-errors)
    apiError.message = error.message
    apiError.statusCode = error.statusCode
  } else {
    // Unknown error
    logger.error(
      { error, ...pick(req, ['body', 'method', 'url', 'user']) },
      `[🔴 Fatal]: ${error?.message || 'Unknown error'}`
    )
  }

  // Returns the stack on non-production environments
  if (!isOrdersApi && config.env !== Env.Production) {
    apiError.stack = error.stack
  }

  reply.status(apiError?.statusCode).send(apiError)
}
