/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { createSelector } from 'redux-orm';

import orm from '../orm';
import { isLocalId } from '../utils/local-id';
import { selectPath } from './router';

export const makeSelectEpicById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Epic }, id) => {
      const epicModel = Epic.withId(id);

      if (!epicModel) {
        return epicModel;
      }

      return {
        ...epicModel.ref,
        isPersisted: !isLocalId(epicModel.id),
      };
    },
  );

export const selectEpicById = makeSelectEpicById();

export const makeSelectEpicProgressById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Epic }, id) => {
      const epicModel = Epic.withId(id);

      if (!epicModel) {
        return {
          total: 0,
          completed: 0,
          isCompleted: false,
        };
      }

      const cards = epicModel.cards.toRefArray();
      const total = cards.length;
      const completed = cards.reduce((result, card) => (card.isClosed ? result + 1 : result), 0);

      return {
        total,
        completed,
        isCompleted: total > 0 && completed === total,
      };
    },
  );

export const selectEpicProgressById = makeSelectEpicProgressById();

export const makeSelectCardIdsByEpicId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Epic }, id) => {
      const epicModel = Epic.withId(id);

      if (!epicModel) {
        return [];
      }

      return epicModel
        .getCardsQuerySet()
        .toRefArray()
        .map((card) => card.id);
    },
  );

export const selectCardIdsByEpicId = makeSelectCardIdsByEpicId();

export const makeSelectEpicByCardId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Card }, id) => {
      const cardModel = Card.withId(id);

      if (!cardModel || !cardModel.epic) {
        return null;
      }

      return cardModel.epic.ref;
    },
  );

export const selectEpicByCardId = makeSelectEpicByCardId();

export const makeSelectCommentIdsByEpicId = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ Epic }, id) => {
      const epicModel = Epic.withId(id);

      if (!epicModel) {
        return [];
      }

      return epicModel
        .getCommentsQuerySet()
        .toRefArray()
        .map((epicComment) => epicComment.id);
    },
  );

export const selectCommentIdsByEpicId = makeSelectCommentIdsByEpicId();

export const makeSelectEpicCommentById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ EpicComment }, id) => {
      const epicCommentModel = EpicComment.withId(id);

      if (!epicCommentModel) {
        return epicCommentModel;
      }

      return {
        ...epicCommentModel.ref,
        isPersisted: !isLocalId(epicCommentModel.id),
        user: epicCommentModel.user && epicCommentModel.user.ref,
      };
    },
  );

export const selectEpicCommentById = makeSelectEpicCommentById();

export const selectEpicsForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, boardId) => {
    if (!boardId) {
      return [];
    }

    const boardModel = Board.withId(boardId);

    if (!boardModel) {
      return [];
    }

    return boardModel.getEpicsQuerySet().toRefArray();
  },
);

export const selectEpicsWithCompletionForCurrentBoard = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, boardId) => {
    if (!boardId) {
      return [];
    }

    const boardModel = Board.withId(boardId);

    if (!boardModel) {
      return [];
    }

    return boardModel
      .getEpicsQuerySet()
      .toModelArray()
      .map((epicModel) => {
        const cards = epicModel.cards.toRefArray();
        const total = cards.length;
        const completed = cards.reduce((result, card) => (card.isClosed ? result + 1 : result), 0);

        return {
          ...epicModel.ref,
          isCompleted: total > 0 && completed === total,
        };
      });
  },
);

export const selectEpicsForCurrentBoardByGantt = createSelector(
  orm,
  (state) => selectPath(state).boardId,
  ({ Board }, boardId) => {
    if (!boardId) {
      return [];
    }

    const boardModel = Board.withId(boardId);

    if (!boardModel) {
      return [];
    }

    return boardModel.getEpicsByGanttQuerySet().toRefArray();
  },
);

export default {
  makeSelectEpicById,
  selectEpicById,
  makeSelectEpicProgressById,
  selectEpicProgressById,
  makeSelectCardIdsByEpicId,
  selectCardIdsByEpicId,
  makeSelectEpicByCardId,
  selectEpicByCardId,
  makeSelectCommentIdsByEpicId,
  selectCommentIdsByEpicId,
  makeSelectEpicCommentById,
  selectEpicCommentById,
  selectEpicsForCurrentBoard,
  selectEpicsWithCompletionForCurrentBoard,
  selectEpicsForCurrentBoardByGantt,
};
