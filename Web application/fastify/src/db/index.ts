// const knex = require('knex')
// const knexConfig = require('./knexfile').default

// module.exports = knex(knexConfig)

import { knex } from 'knex'
import { config } from '../config'
import knexConfig from './knexfile'

export const db = knex(knexConfig)
