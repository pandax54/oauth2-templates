const { TABLES } = require('../constants');

exports.up = (knex) => knex.schema.table(TABLES.users, t => {
  t.unique('email');
});

exports.down = (knex) => knex.schema.table(TABLES.user, t => {
  t.dropUnique('email');
});
