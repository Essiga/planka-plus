/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = (knex) =>
  knex.schema.alterTable('epic', (table) => {
    /* Columns */

    table.specificType('gantt_position', 'double precision');

    /* Indexes */

    table.index('gantt_position');
  });

exports.down = (knex) =>
  knex.schema.alterTable('epic', (table) => {
    table.dropColumn('gantt_position');
  });
