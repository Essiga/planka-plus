/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.createTable('epic', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('board_id').notNullable();

    table.specificType('position', 'double precision').notNullable();
    table.text('name');
    table.text('description');
    table.text('color').notNullable();
    table.timestamp('start_date', true);
    table.timestamp('end_date', true);

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('board_id');
    table.index('position');
  });

  await knex.schema.createTable('epic_comment', (table) => {
    /* Columns */

    table.bigInteger('id').primary().defaultTo(knex.raw('next_id()'));

    table.bigInteger('epic_id').notNullable();
    table.bigInteger('user_id');

    table.text('text').notNullable();

    table.timestamp('created_at', true);
    table.timestamp('updated_at', true);

    /* Indexes */

    table.index('epic_id');
  });

  await knex.schema.alterTable('card', (table) => {
    /* Columns */

    table.bigInteger('epic_id');

    /* Indexes */

    table.index('epic_id');
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('card', (table) => {
    table.dropColumn('epic_id');
  });

  await knex.schema.dropTable('epic_comment');
  await knex.schema.dropTable('epic');
};
