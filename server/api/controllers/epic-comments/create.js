/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /epics/{epicId}/comments:
 *   post:
 *     summary: Create epic comment
 *     description: Creates a new comment on an epic. Requires board editor or comment permissions.
 *     tags:
 *       - Epics
 *     operationId: createEpicComment
 *     parameters:
 *       - name: epicId
 *         in: path
 *         required: true
 *         description: ID of the epic to create the comment on
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 maxLength: 1048576
 *     responses:
 *       200:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/EpicComment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  EPIC_NOT_FOUND: {
    epicNotFound: 'Epic not found',
  },
};

module.exports = {
  inputs: {
    epicId: {
      ...idInput,
      required: true,
    },
    text: {
      type: 'string',
      maxLength: 1048576,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    epicNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { epic, board, project } = await sails.helpers.epics
      .getPathToProjectById(inputs.epicId)
      .intercept('pathNotFound', () => Errors.EPIC_NOT_FOUND);

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.EPIC_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      if (!boardMembership.canComment) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }
    }

    const values = _.pick(inputs, ['text']);

    const epicComment = await sails.helpers.epicComments.createOne.with({
      project,
      board,
      values: {
        ...values,
        epic,
        user: currentUser,
      },
      request: this.req,
    });

    return {
      item: epicComment,
    };
  },
};
