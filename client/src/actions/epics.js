/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const createEpic = (epic) => ({
  type: ActionTypes.EPIC_CREATE,
  payload: {
    epic,
  },
});

createEpic.success = (localId, epic) => ({
  type: ActionTypes.EPIC_CREATE__SUCCESS,
  payload: {
    localId,
    epic,
  },
});

createEpic.failure = (localId, error) => ({
  type: ActionTypes.EPIC_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleEpicCreate = (epic) => ({
  type: ActionTypes.EPIC_CREATE_HANDLE,
  payload: {
    epic,
  },
});

const updateEpic = (id, data) => ({
  type: ActionTypes.EPIC_UPDATE,
  payload: {
    id,
    data,
  },
});

updateEpic.success = (epic) => ({
  type: ActionTypes.EPIC_UPDATE__SUCCESS,
  payload: {
    epic,
  },
});

updateEpic.failure = (id, error) => ({
  type: ActionTypes.EPIC_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleEpicUpdate = (epic) => ({
  type: ActionTypes.EPIC_UPDATE_HANDLE,
  payload: {
    epic,
  },
});

const deleteEpic = (id) => ({
  type: ActionTypes.EPIC_DELETE,
  payload: {
    id,
  },
});

deleteEpic.success = (epic) => ({
  type: ActionTypes.EPIC_DELETE__SUCCESS,
  payload: {
    epic,
  },
});

deleteEpic.failure = (id, error) => ({
  type: ActionTypes.EPIC_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleEpicDelete = (epic) => ({
  type: ActionTypes.EPIC_DELETE_HANDLE,
  payload: {
    epic,
  },
});

const addEpicToBoardFilter = (id, boardId) => ({
  type: ActionTypes.EPIC_TO_BOARD_FILTER_ADD,
  payload: {
    id,
    boardId,
  },
});

const removeEpicFromBoardFilter = (id, boardId) => ({
  type: ActionTypes.EPIC_FROM_BOARD_FILTER_REMOVE,
  payload: {
    id,
    boardId,
  },
});

export default {
  createEpic,
  handleEpicCreate,
  updateEpic,
  handleEpicUpdate,
  deleteEpic,
  handleEpicDelete,
  addEpicToBoardFilter,
  removeEpicFromBoardFilter,
};
