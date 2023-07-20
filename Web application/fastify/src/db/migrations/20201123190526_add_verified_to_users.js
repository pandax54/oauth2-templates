const { TABLES } = require('../constants');

exports.up = (knex) => knex.schema.table(TABLES.users, t => {
  t.boolean('verified');
  t.string('verify_token');
});

exports.down = (knex) => knex.schema.table(TABLES.users, t => {
  t.dropColumn('verified');
  t.dropColumn('verify_token');
});
