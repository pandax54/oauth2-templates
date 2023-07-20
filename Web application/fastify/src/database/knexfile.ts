import 'tsconfig-paths/register'

import { join } from 'path'
import { Knex } from 'knex'

import { config } from '../config'
import { Env } from '../common/enums'
import { knexSnakeCaseMappers } from 'objection'

const defaultConfig: Knex.Config = {
  client: 'pg',
  connection: config.postgres.url,
  ...knexSnakeCaseMappers(),
  seeds: {
    directory: join(__dirname, '../db/seeds'),
  },
  migrations: {
    directory: join(__dirname, '../db/migrations'),
  },
}

export = {
  [Env.Local]: { ...defaultConfig },
  // [Env.Test]: { ...defaultConfig, connection: config.postgres.testUrl },

  [Env.Development]: {
    ...defaultConfig,
    connection: {
      connectionString: config.postgres.url,
      ssl: { rejectUnauthorized: false },
    },
  },
  [Env.Staging]: {
    ...defaultConfig,
    connection: {
      connectionString: config.postgres.url,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 10 },
  },

  [Env.Production]: {
    ...defaultConfig,
    connection: {
      connectionString: config.postgres.url,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 10 },
  },
}
