/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports.up = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.boolean('use_fixed_card_size').notNullable().defaultTo(false);
  });

module.exports.down = (knex) =>
  knex.schema.alterTable('board', (table) => {
    table.dropColumn('use_fixed_card_size');
  });
