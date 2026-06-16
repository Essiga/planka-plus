/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    actorUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    await sails.helpers.epics.deleteRelated(inputs.record);

    const epic = await Epic.qm.deleteOne(inputs.record.id);

    if (epic) {
      sails.sockets.broadcast(
        `board:${epic.boardId}`,
        'epicDelete',
        {
          item: epic,
        },
        inputs.request,
      );
    }

    return epic;
  },
};
