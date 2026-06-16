/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    pathNotFound: {},
  },

  async fn(inputs) {
    const epic = await Epic.qm.getOneById(inputs.id);

    if (!epic) {
      throw 'pathNotFound';
    }

    const pathToProject = await sails.helpers.boards
      .getPathToProjectById(epic.boardId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          epic,
          ...nodes,
        },
      }));

    return {
      epic,
      ...pathToProject,
    };
  },
};
