/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* epicCommentsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.EPIC_COMMENTS_FETCH, ({ payload: { epicId } }) =>
      services.fetchEpicComments(epicId),
    ),
    takeEvery(EntryActionTypes.EPIC_COMMENT_CREATE, ({ payload: { epicId, data } }) =>
      services.createEpicComment(epicId, data),
    ),
    takeEvery(EntryActionTypes.EPIC_COMMENT_CREATE_HANDLE, ({ payload: { epicComment, users } }) =>
      services.handleEpicCommentCreate(epicComment, users),
    ),
    takeEvery(EntryActionTypes.EPIC_COMMENT_UPDATE, ({ payload: { id, data } }) =>
      services.updateEpicComment(id, data),
    ),
    takeEvery(EntryActionTypes.EPIC_COMMENT_UPDATE_HANDLE, ({ payload: { epicComment } }) =>
      services.handleEpicCommentUpdate(epicComment),
    ),
    takeEvery(EntryActionTypes.EPIC_COMMENT_DELETE, ({ payload: { id } }) =>
      services.deleteEpicComment(id),
    ),
    takeEvery(EntryActionTypes.EPIC_COMMENT_DELETE_HANDLE, ({ payload: { epicComment } }) =>
      services.handleEpicCommentDelete(epicComment),
    ),
  ]);
}
