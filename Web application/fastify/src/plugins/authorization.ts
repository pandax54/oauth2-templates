import { FastifyRequest } from 'fastify'
import { Unauthorized } from 'http-errors'
import { config } from '@app/config'

import { verifyAuthJwt } from '@app/common/jwt'
import { User } from '@app/models/users'

export async function authorize(req: FastifyRequest) {
  const [_, token] = req?.headers?.authorization?.split(' ') ?? []

  if (!token) {
    throw new Unauthorized('Bearer token not found')
  }

  let decoded

  try {
    decoded = await verifyAuthJwt({ token })
  } catch (error) {
    throw new Unauthorized('Invalid token')
  }

  if (!decoded?.userId) {
    throw new Unauthorized('Invalid authentication token')
  }

  const user = await User.query()
    .findOne({ id: decoded.userId })
    .select(
      'id',
      'email',
      'firstName',
      'lastName',
      'isEmailVerified',
      'restrictReason',
      'isLocked',
      'isPhoneVerified'
    )
    .throwIfNotFound()

  if (!user.isPhoneVerified) {
    throw new Unauthorized(`Please verify your phone number first.`)
  }

  if (user.isLocked) {
    throw new Unauthorized(
      `Action unavailable. Please contact us at ${config.support.email} or using our in-app chat.`
    )
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.fullName,
    isRestricted: user.isRestricted,
    isEmailVerified: user.isEmailVerified,
  }
}
