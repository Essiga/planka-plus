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
    values: {
      type: 'json',
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
    const { values } = inputs;

    if (!_.isUndefined(values.position)) {
      const epics = await Epic.qm.getByBoardId(inputs.record.boardId, {
        exceptIdOrIds: inputs.record.id,
      });

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.position,
        epics,
      );

      values.position = position;

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

        sails.sockets.broadcast(`board:${inputs.record.boardId}`, 'epicUpdate', {
          item: {
            id: reposition.record.id,
            position: reposition.position,
          },
        });
      }
    }

    if (!_.isUndefined(values.ganttPosition) && !_.isNull(values.ganttPosition)) {
      const epics = await Epic.qm.getByBoardId(inputs.record.boardId, {
        exceptIdOrIds: inputs.record.id,
      });

      // Gantt order is independent of the backlog order; fall back to the backlog
      // position for epics that have not been reordered in the Gantt yet
      const positionables = epics
        .map((epicItem) => ({
          ...epicItem,
          position: _.isNil(epicItem.ganttPosition) ? epicItem.position : epicItem.ganttPosition,
        }))
        .sort((a, b) => a.position - b.position);

      const { position, repositions } = sails.helpers.utils.insertToPositionables(
        values.ganttPosition,
        positionables,
      );

      values.ganttPosition = position;

      // eslint-disable-next-line no-restricted-syntax
      for (const reposition of repositions) {
        // eslint-disable-next-line no-await-in-loop
        await Epic.qm.updateOne(
          {
            id: reposition.record.id,
            boardId: reposition.record.boardId,
          },
          {
            ganttPosition: reposition.position,
          },
        );

        sails.sockets.broadcast(`board:${inputs.record.boardId}`, 'epicUpdate', {
          item: {
            id: reposition.record.id,
            ganttPosition: reposition.position,
          },
        });
      }
    }

    const epic = await Epic.qm.updateOne(inputs.record.id, values);

    if (epic) {
      sails.sockets.broadcast(
        `board:${epic.boardId}`,
        'epicUpdate',
        {
          item: epic,
        },
        inputs.request,
      );
    }

    return epic;
  },
};
