/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { call, put, select } from 'redux-saga/effects';

import request from '../request';
import selectors from '../../../selectors';
import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';

export function* createEpic(boardId, data) {
  const localId = yield call(createLocalId);

  const nextData = {
    ...data,
    position: yield select(selectors.selectNextEpicPosition, boardId),
  };

  yield put(
    actions.createEpic({
      ...nextData,
      boardId,
      id: localId,
    }),
  );

  let epic;
  try {
    ({ item: epic } = yield call(request, api.createEpic, boardId, nextData));
  } catch (error) {
    yield put(actions.createEpic.failure(localId, error));
    return;
  }

  yield put(actions.createEpic.success(localId, epic));
}

export function* createEpicInCurrentBoard(data) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(createEpic, boardId, data);
}

export function* handleEpicCreate(epic) {
  yield put(actions.handleEpicCreate(epic));
}

export function* updateEpic(id, data) {
  yield put(actions.updateEpic(id, data));

  let epic;
  try {
    ({ item: epic } = yield call(request, api.updateEpic, id, data));
  } catch (error) {
    yield put(actions.updateEpic.failure(id, error));
    return;
  }

  yield put(actions.updateEpic.success(epic));
}

export function* moveEpic(id, index) {
  const { boardId } = yield select(selectors.selectEpicById, id);
  const position = yield select(selectors.selectNextActiveEpicPosition, boardId, index, id);

  yield call(updateEpic, id, {
    position,
  });
}

export function* moveEpicInGantt(id, index) {
  const { boardId } = yield select(selectors.selectEpicById, id);
  const ganttPosition = yield select(selectors.selectNextEpicGanttPosition, boardId, index, id);

  yield call(updateEpic, id, {
    ganttPosition,
  });
}

export function* handleEpicUpdate(epic) {
  yield put(actions.handleEpicUpdate(epic));
}

export function* deleteEpic(id) {
  yield put(actions.deleteEpic(id));

  let epic;
  try {
    ({ item: epic } = yield call(request, api.deleteEpic, id));
  } catch (error) {
    yield put(actions.deleteEpic.failure(id, error));
    return;
  }

  yield put(actions.deleteEpic.success(epic));
}

export function* handleEpicDelete(epic) {
  yield put(actions.handleEpicDelete(epic));
}

export default {
  createEpic,
  createEpicInCurrentBoard,
  handleEpicCreate,
  moveEpic,
  moveEpicInGantt,
  updateEpic,
  handleEpicUpdate,
  deleteEpic,
  handleEpicDelete,
};
