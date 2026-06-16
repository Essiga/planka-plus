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
    board: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    const epicComment = await EpicComment.qm.createOne({
      ..._.pick(values, ['text']),
      epicId: values.epic.id,
      userId: values.user.id,
    });

    sails.sockets.broadcast(
      `board:${inputs.board.id}`,
      'epicCommentCreate',
      {
        item: epicComment,
        included: {
          users: [sails.helpers.users.presentOne(values.user, {})],
        },
      },
      inputs.request,
    );

    return epicComment;
  },
};
