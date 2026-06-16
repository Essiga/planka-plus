/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /epics/{id}:
 *   delete:
 *     summary: Delete epic
 *     description: Deletes an epic. Requires board editor permissions.
 *     tags:
 *       - Epics
 *     operationId: deleteEpic
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the epic to delete
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Epic deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Epic'
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
    id: {
      ...idInput,
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

    const pathToProject = await sails.helpers.epics
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.EPIC_NOT_FOUND);

    let { epic } = pathToProject;
    const { board, project } = pathToProject;

    const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
      board.id,
      currentUser.id,
    );

    if (!boardMembership) {
      throw Errors.EPIC_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    epic = await sails.helpers.epics.deleteOne.with({
      project,
      board,
      record: epic,
      actorUser: currentUser,
      request: this.req,
    });

    if (!epic) {
      throw Errors.EPIC_NOT_FOUND;
    }

    return {
      item: epic,
    };
  },
};
