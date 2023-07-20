import { TArray, TObject } from '@sinclair/typebox'
import { NextFunction, Request, Response } from 'express'
import { JSONSchema4 } from 'json-schema'
import { Model, ModelProps } from 'objection'
import { CamelCasedPropertiesDeep, SnakeCasedPropertiesDeep } from 'type-fest'

export interface Req extends Request {
  query: any
  params: any
}

export interface Res extends Response {
  locals: {
    user: { id: number }
  }
  reply: (
    data: Record<string, any>,
    schema?: JSONSchema4 | TObject<Record<string, any>> | TArray<TObject<Record<string, any>>>,
    options?: { paginated: boolean }
  ) => void
}

export type Next = NextFunction

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

declare module 'fastify' {
  export interface FastifyRequest {
    user: {
      id?: number
      email?: string
      name?: string
      isRestricted: boolean
      isEmailVerified: boolean
    }
  }
}

export type CC<T> = CamelCasedPropertiesDeep<T>
export type SC<T> = SnakeCasedPropertiesDeep<T>

/**
 * This will extract the props defined in an Objection Model class while keeping their optional/required constraints.
 * For example, in the case where:
 *
 * export MyModel extends Model {
 *  name: string
 *  description?: string
 * }
 *
 * A `ModelObject<MyModel>` will yield `{ name: string, description?: string }` as the type.
 *
 * The reason for this is, when using Objection models directly (e.g. `const x: Model`), all Objection-specific
 * properties are returned too, polluting the types.
 */
export type ModelObject<M extends Model> = Pick<M, ModelProps<M>>

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never
