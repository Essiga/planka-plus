/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * EpicComment.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EpicComment:
 *       type: object
 *       required:
 *         - id
 *         - epicId
 *         - userId
 *         - text
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the epic comment
 *           example: "1357158568008091264"
 *         epicId:
 *           type: string
 *           description: ID of the epic the comment belongs to
 *           example: "1357158568008091265"
 *         userId:
 *           type: string
 *           nullable: true
 *           description: ID of the user who created the comment
 *           example: "1357158568008091266"
 *         text:
 *           type: string
 *           description: Content of the comment
 *           example: This epic is almost complete...
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the comment was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the comment was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    text: {
      type: 'string',
      required: true,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    epicId: {
      model: 'Epic',
      required: true,
      columnName: 'epic_id',
    },
    userId: {
      model: 'User',
      columnName: 'user_id',
    },
  },

  tableName: 'epic_comment',
};
