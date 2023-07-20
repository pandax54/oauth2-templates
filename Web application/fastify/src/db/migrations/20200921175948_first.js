// make sure to run first, will automate extension creation later:
// CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

const { TABLES } = require('../constants')

exports.up = (knex) =>
  knex.schema
    // usually a seller, but can also be fit_shipper employees
    .createTable(TABLES.users, (t) => {
      t.increments('id').primary()
      // non-master users will not have settings_id, instead will use the 'master' users settings
      t.string('email').index()
      t.string('first_name')
      t.string('last_name')
      t.string('company_name')
      t.string('phone')
      t.string('password')
      t.boolean('account_locked')
      t.timestamp('created_at').defaultTo(knex.fn.now())
      t.timestamp('updated_at').defaultTo(knex.fn.now())
    })

exports.down = (knex) =>
  knex.schema
    .dropTableIfExists(TABLES.users)
