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
    epic: {
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
    const epicComment = await EpicComment.qm.deleteOne(inputs.record.id);

    if (epicComment) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'epicCommentDelete',
        {
          item: epicComment,
        },
        inputs.request,
      );
    }

    return epicComment;
  },
};
