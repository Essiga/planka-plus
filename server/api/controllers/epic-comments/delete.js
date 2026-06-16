/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /epic-comments/{id}:
 *   delete:
 *     summary: Delete epic comment
 *     description: Deletes an epic comment. Can be deleted by the author or a project manager.
 *     tags:
 *       - Epics
 *     operationId: deleteEpicComment
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the comment to delete
 *         schema:
 *           type: string
 *           example: "1357158568008091264"
 *     responses:
 *       200:
 *         description: Comment deleted successfully
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
  EPIC_COMMENT_NOT_FOUND: {
    epicCommentNotFound: 'Epic comment not found',
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
    epicCommentNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const pathToProject = await sails.helpers.epicComments
      .getPathToProjectById(inputs.id)
      .intercept('pathNotFound', () => Errors.EPIC_COMMENT_NOT_FOUND);

    let { epicComment } = pathToProject;
    const { epic, board, project } = pathToProject;

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    if (!isProjectManager) {
      if (epicComment.userId !== currentUser.id) {
        throw Errors.NOT_ENOUGH_RIGHTS;
      }

      const boardMembership = await BoardMembership.qm.getOneByBoardIdAndUserId(
        board.id,
        currentUser.id,
      );

      if (!boardMembership) {
        throw Errors.EPIC_COMMENT_NOT_FOUND; // Forbidden
      }

      if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
        if (!boardMembership.canComment) {
          throw Errors.NOT_ENOUGH_RIGHTS;
        }
      }
    }

    epicComment = await sails.helpers.epicComments.deleteOne.with({
      project,
      board,
      epic,
      record: epicComment,
      actorUser: currentUser,
      request: this.req,
    });

    if (!epicComment) {
      throw Errors.EPIC_COMMENT_NOT_FOUND;
    }

    return {
      item: epicComment,
    };
  },
};
