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
    const epicComment = await EpicComment.qm.getOneById(inputs.id);

    if (!epicComment) {
      throw 'pathNotFound';
    }

    const pathToProject = await sails.helpers.epics
      .getPathToProjectById(epicComment.epicId)
      .intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          epicComment,
          ...nodes,
        },
      }));

    return {
      epicComment,
      ...pathToProject,
    };
  },
};
