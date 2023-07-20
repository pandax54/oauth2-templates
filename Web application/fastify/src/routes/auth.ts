import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export const authRoutes = async (app: FastifyInstance): Promise<void> => {
  // TODO
  app.post('/users', (
    req: FastifyRequest<{ Body: { email: string; password: string } }>,
    reply: FastifyReply
  ) => {
    const { email, password } = req.body
    reply.send({ email, password })
  })
}
