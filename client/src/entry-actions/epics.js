/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const createEpicInCurrentBoard = (data) => ({
  type: EntryActionTypes.EPIC_IN_CURRENT_BOARD_CREATE,
  payload: {
    data,
  },
});

const handleEpicCreate = (epic) => ({
  type: EntryActionTypes.EPIC_CREATE_HANDLE,
  payload: {
    epic,
  },
});

const moveEpic = (id, index) => ({
  type: EntryActionTypes.EPIC_MOVE,
  payload: {
    id,
    index,
  },
});

const updateEpic = (id, data) => ({
  type: EntryActionTypes.EPIC_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleEpicUpdate = (epic) => ({
  type: EntryActionTypes.EPIC_UPDATE_HANDLE,
  payload: {
    epic,
  },
});

const deleteEpic = (id) => ({
  type: EntryActionTypes.EPIC_DELETE,
  payload: {
    id,
  },
});

const handleEpicDelete = (epic) => ({
  type: EntryActionTypes.EPIC_DELETE_HANDLE,
  payload: {
    epic,
  },
});

export default {
  createEpicInCurrentBoard,
  handleEpicCreate,
  moveEpic,
  updateEpic,
  handleEpicUpdate,
  deleteEpic,
  handleEpicDelete,
};
