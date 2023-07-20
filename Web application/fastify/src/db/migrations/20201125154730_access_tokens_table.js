const { TABLES } = require('../constants');

exports.up = knex => knex.schema
  .createTable(TABLES.access_tokens, t => {
    t.string('name');
    t.string('token', 1000);
    // soft delete, but retain incase
    t.boolean('delete');
    t.timestamp('expires_at');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

exports.down = knex => knex.schema
  .dropTableIfExists(TABLES.access_tokens);
