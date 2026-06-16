/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      required: true,
    },
    project: {
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
    const { values } = inputs;

    const epics = await Epic.qm.getByBoardId(values.board.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(
      values.position,
      epics,
    );

    // eslint-disable-next-line no-restricted-syntax
    for (const reposition of repositions) {
      // eslint-disable-next-line no-await-in-loop
      await Epic.qm.updateOne(
        {
          id: reposition.record.id,
          boardId: reposition.record.boardId,
        },
        {
          position: reposition.position,
        },
      );

      sails.sockets.broadcast(`board:${values.board.id}`, 'epicUpdate', {
        item: {
          id: reposition.record.id,
          position: reposition.position,
        },
      });
    }

    const epic = await Epic.qm.createOne({
      ..._.omit(values, ['board']),
      position,
      boardId: values.board.id,
    });

    sails.sockets.broadcast(
      `board:${epic.boardId}`,
      'epicCreate',
      {
        item: epic,
      },
      inputs.request,
    );

    return epic;
  },
};
