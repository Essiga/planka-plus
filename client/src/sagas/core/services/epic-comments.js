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

export function* fetchEpicComments(epicId) {
  yield put(actions.fetchEpicComments(epicId));

  let epicComments;
  let users;

  try {
    ({
      items: epicComments,
      included: { users },
    } = yield call(request, api.getEpicComments, epicId));
  } catch (error) {
    yield put(actions.fetchEpicComments.failure(epicId, error));
    return;
  }

  yield put(actions.fetchEpicComments.success(epicId, epicComments, users));
}

export function* createEpicComment(epicId, data) {
  const localId = yield call(createLocalId);
  const currentUser = yield select(selectors.selectCurrentUser);

  yield put(
    actions.createEpicComment({
      ...data,
      epicId,
      id: localId,
      userId: currentUser.id,
    }),
  );

  let epicComment;
  try {
    ({ item: epicComment } = yield call(request, api.createEpicComment, epicId, data));
  } catch (error) {
    yield put(actions.createEpicComment.failure(localId, error));
    return;
  }

  yield put(actions.createEpicComment.success(localId, epicComment));
}

export function* handleEpicCommentCreate(epicComment, users) {
  yield put(actions.handleEpicCommentCreate(epicComment, users));
}

export function* updateEpicComment(id, data) {
  yield put(actions.updateEpicComment(id, data));

  let epicComment;
  try {
    ({ item: epicComment } = yield call(request, api.updateEpicComment, id, data));
  } catch (error) {
    yield put(actions.updateEpicComment.failure(id, error));
    return;
  }

  yield put(actions.updateEpicComment.success(epicComment));
}

export function* handleEpicCommentUpdate(epicComment) {
  yield put(actions.handleEpicCommentUpdate(epicComment));
}

export function* deleteEpicComment(id) {
  yield put(actions.deleteEpicComment(id));

  let epicComment;
  try {
    ({ item: epicComment } = yield call(request, api.deleteEpicComment, id));
  } catch (error) {
    yield put(actions.deleteEpicComment.failure(id, error));
    return;
  }

  yield put(actions.deleteEpicComment.success(epicComment));
}

export function* handleEpicCommentDelete(epicComment) {
  yield put(actions.handleEpicCommentDelete(epicComment));
}

export default {
  fetchEpicComments,
  createEpicComment,
  handleEpicCommentCreate,
  updateEpicComment,
  handleEpicCommentUpdate,
  deleteEpicComment,
  handleEpicCommentDelete,
};
