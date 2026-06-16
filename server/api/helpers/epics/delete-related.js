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
  },

  async fn(inputs) {
    const { record } = inputs;

    // Detach the epic from any cards that reference it
    const { cards } = await Card.qm.update(
      {
        epicId: record.id,
      },
      {
        epicId: null,
      },
    );

    cards.forEach((card) => {
      sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', {
        item: {
          id: card.id,
          epicId: null,
        },
      });
    });

    await EpicComment.qm.delete({
      epicId: record.id,
    });
  },
};
