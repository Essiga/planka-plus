/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /epics/{id}:
 *   patch:
 *     summary: Update epic
 *     description: Updates an epic. Requires board editor permissions.
 *     tags:
 *       - Epics
 *     operationId: updateEpic
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the epic to update
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               position:
 *                 type: number
 *                 minimum: 0
 *               name:
 *                 type: string
 *                 maxLength: 128
 *                 nullable: true
 *               description:
 *                 type: string
 *                 maxLength: 1048576
 *                 nullable: true
 *               color:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Epic updated successfully
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

const { isDueDate } = require('../../../utils/validators');
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
    position: {
      type: 'number',
      min: 0,
    },
    ganttPosition: {
      type: 'number',
      min: 0,
      allowNull: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 128,
      allowNull: true,
    },
    description: {
      type: 'string',
      isNotEmptyString: true,
      maxLength: 1048576,
      allowNull: true,
    },
    color: {
      type: 'string',
      custom: (value) => Epic.COLORS.includes(value) || /^#[0-9a-fA-F]{6}$/.test(value),
    },
    startDate: {
      type: 'string',
      custom: isDueDate,
      allowNull: true,
    },
    endDate: {
      type: 'string',
      custom: isDueDate,
      allowNull: true,
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

    const values = _.pick(inputs, [
      'position',
      'ganttPosition',
      'name',
      'description',
      'color',
      'startDate',
      'endDate',
    ]);

    epic = await sails.helpers.epics.updateOne.with({
      values,
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
