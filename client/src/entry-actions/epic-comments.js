/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import EntryActionTypes from '../constants/EntryActionTypes';

const fetchEpicComments = (epicId) => ({
  type: EntryActionTypes.EPIC_COMMENTS_FETCH,
  payload: {
    epicId,
  },
});

const createEpicComment = (epicId, data) => ({
  type: EntryActionTypes.EPIC_COMMENT_CREATE,
  payload: {
    epicId,
    data,
  },
});

const handleEpicCommentCreate = (epicComment, users) => ({
  type: EntryActionTypes.EPIC_COMMENT_CREATE_HANDLE,
  payload: {
    epicComment,
    users,
  },
});

const updateEpicComment = (id, data) => ({
  type: EntryActionTypes.EPIC_COMMENT_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleEpicCommentUpdate = (epicComment) => ({
  type: EntryActionTypes.EPIC_COMMENT_UPDATE_HANDLE,
  payload: {
    epicComment,
  },
});

const deleteEpicComment = (id) => ({
  type: EntryActionTypes.EPIC_COMMENT_DELETE,
  payload: {
    id,
  },
});

const handleEpicCommentDelete = (epicComment) => ({
  type: EntryActionTypes.EPIC_COMMENT_DELETE_HANDLE,
  payload: {
    epicComment,
  },
});

export default {
  fetchEpicComments,
  createEpicComment,
  handleEpicCommentCreate,
  updateEpicComment,
  handleEpicCommentUpdate,
  deleteEpicComment,
  handleEpicCommentDelete,
};
