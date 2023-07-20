import { knex } from 'knex'
import { Model } from 'objection'
import knexConfig from '@app/db/knexfile'

const connection = knex(knexConfig)

Model.knex(connection)

export const database = connection
