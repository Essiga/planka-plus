/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /epics/{epicId}/comments:
 *   get:
 *     summary: Get epic comments
 *     description: Retrieves comments for an epic with pagination support. Requires access to the epic.
 *     tags:
 *       - Epics
 *     operationId: getEpicComments
 *     parameters:
 *       - name: epicId
 *         in: path
 *         required: true
 *         description: ID of the epic to retrieve comments for
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *       - name: beforeId
 *         in: query
 *         required: false
 *         description: ID to get comments before (for pagination)
 *         schema:
 *           type: string
 *           example: "1357158568008091265"
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - items
 *                 - included
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EpicComment'
 *                 included:
 *                   type: object
 *                   required:
 *                     - users
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

const { idInput } = require('../../../utils/inputs');

const Errors = {
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
    beforeId: idInput,
  },

  exits: {
    epicNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { epic, project } = await sails.helpers.epics
      .getPathToProjectById(inputs.epicId)
      .intercept('pathNotFound', () => Errors.EPIC_NOT_FOUND);

    if (currentUser.role !== User.Roles.ADMIN || project.ownerProjectManagerId) {
      const isProjectManager = await sails.helpers.users.isProjectManager(
        currentUser.id,
        project.id,
      );

      if (!isProjectManager) {
        const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
          epic.boardId,
          currentUser.id,
        );

        if (!boardMembership) {
          throw Errors.EPIC_NOT_FOUND; // Forbidden
        }
      }
    }

    const epicComments = await EpicComment.qm.getByEpicId(epic.id, {
      beforeId: inputs.beforeId,
    });

    const userIds = sails.helpers.utils.mapRecords(epicComments, 'userId', true, true);
    const users = await User.qm.getByIds(userIds);

    return {
      items: epicComments,
      included: {
        users: sails.helpers.users.presentMany(users, currentUser),
      },
    };
  },
};
