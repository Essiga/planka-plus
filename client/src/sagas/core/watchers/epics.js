/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* epicsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.EPIC_IN_CURRENT_BOARD_CREATE, ({ payload: { data } }) =>
      services.createEpicInCurrentBoard(data),
    ),
    takeEvery(EntryActionTypes.EPIC_CREATE_HANDLE, ({ payload: { epic } }) =>
      services.handleEpicCreate(epic),
    ),
    takeEvery(EntryActionTypes.EPIC_MOVE, ({ payload: { id, index } }) =>
      services.moveEpic(id, index),
    ),
    takeEvery(EntryActionTypes.EPIC_IN_GANTT_MOVE, ({ payload: { id, index } }) =>
      services.moveEpicInGantt(id, index),
    ),
    takeEvery(EntryActionTypes.EPIC_UPDATE, ({ payload: { id, data } }) =>
      services.updateEpic(id, data),
    ),
    takeEvery(EntryActionTypes.EPIC_UPDATE_HANDLE, ({ payload: { epic } }) =>
      services.handleEpicUpdate(epic),
    ),
    takeEvery(EntryActionTypes.EPIC_DELETE, ({ payload: { id } }) => services.deleteEpic(id)),
    takeEvery(EntryActionTypes.EPIC_DELETE_HANDLE, ({ payload: { epic } }) =>
      services.handleEpicDelete(epic),
    ),
    takeEvery(EntryActionTypes.EPIC_TO_FILTER_IN_CURRENT_BOARD_ADD, ({ payload: { id } }) =>
      services.addEpicToFilterInCurrentBoard(id),
    ),
    takeEvery(EntryActionTypes.EPIC_FROM_FILTER_IN_CURRENT_BOARD_REMOVE, ({ payload: { id } }) =>
      services.removeEpicFromFilterInCurrentBoard(id),
    ),
  ]);
}
