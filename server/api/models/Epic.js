/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * Epic.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Epic:
 *       type: object
 *       required:
 *         - id
 *         - boardId
 *         - position
 *         - name
 *         - description
 *         - color
 *         - startDate
 *         - endDate
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the epic
 *           example: "1357158568008091264"
 *         boardId:
 *           type: string
 *           description: ID of the board the epic belongs to
 *           example: "1357158568008091265"
 *         position:
 *           type: number
 *           description: Position of the epic within the board
 *           example: 65536
 *         name:
 *           type: string
 *           nullable: true
 *           description: Name/title of the epic
 *           example: User Onboarding
 *         description:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the epic
 *           example: Everything needed to onboard a new user...
 *         color:
 *           type: string
 *           description: Color of the epic
 *           example: berry-red
 *         startDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Start date of the epic
 *           example: 2024-01-01T00:00:00.000Z
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: End date of the epic
 *           example: 2024-02-01T00:00:00.000Z
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the epic was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the epic was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

// Reuse the same palette as labels
const COLORS = [
  'muddy-grey',
  'autumn-leafs',
  'morning-sky',
  'antique-blue',
  'egg-yellow',
  'desert-sand',
  'dark-granite',
  'fresh-salad',
  'lagoon-blue',
  'midnight-blue',
  'light-orange',
  'pumpkin-orange',
  'light-concrete',
  'sunny-grass',
  'navy-blue',
  'lilac-eyes',
  'apricot-red',
  'orange-peel',
  'silver-glint',
  'bright-moss',
  'deep-ocean',
  'summer-sky',
  'berry-red',
  'light-cocoa',
  'grey-stone',
  'tank-green',
  'coral-green',
  'sugar-plum',
  'pink-tulip',
  'shady-rust',
  'wet-rock',
  'wet-moss',
  'turquoise-sea',
  'lavender-fields',
  'piggy-red',
  'light-mud',
  'gun-metal',
  'modern-green',
  'french-coast',
  'sweet-lilac',
  'red-burgundy',
  'pirate-gold',
];

module.exports = {
  COLORS,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    position: {
      type: 'number',
      required: true,
    },
    ganttPosition: {
      type: 'number',
      allowNull: true,
      columnName: 'gantt_position',
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    color: {
      type: 'string',
      // Accept either a named palette color or a custom hex value (#rrggbb)
      custom: (value) => COLORS.includes(value) || /^#[0-9a-fA-F]{6}$/.test(value),
      required: true,
    },
    startDate: {
      type: 'ref',
      columnName: 'start_date',
    },
    endDate: {
      type: 'ref',
      columnName: 'end_date',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    boardId: {
      model: 'Board',
      required: true,
      columnName: 'board_id',
    },
    cards: {
      collection: 'Card',
      via: 'epicId',
    },
    comments: {
      collection: 'EpicComment',
      via: 'epicId',
    },
  },
};
