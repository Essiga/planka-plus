/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import ActionTypes from '../constants/ActionTypes';

const fetchEpicComments = (epicId) => ({
  type: ActionTypes.EPIC_COMMENTS_FETCH,
  payload: {
    epicId,
  },
});

fetchEpicComments.success = (epicId, epicComments, users) => ({
  type: ActionTypes.EPIC_COMMENTS_FETCH__SUCCESS,
  payload: {
    epicId,
    epicComments,
    users,
  },
});

fetchEpicComments.failure = (epicId, error) => ({
  type: ActionTypes.EPIC_COMMENTS_FETCH__FAILURE,
  payload: {
    epicId,
    error,
  },
});

const createEpicComment = (epicComment) => ({
  type: ActionTypes.EPIC_COMMENT_CREATE,
  payload: {
    epicComment,
  },
});

createEpicComment.success = (localId, epicComment) => ({
  type: ActionTypes.EPIC_COMMENT_CREATE__SUCCESS,
  payload: {
    localId,
    epicComment,
  },
});

createEpicComment.failure = (localId, error) => ({
  type: ActionTypes.EPIC_COMMENT_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleEpicCommentCreate = (epicComment, users) => ({
  type: ActionTypes.EPIC_COMMENT_CREATE_HANDLE,
  payload: {
    epicComment,
    users,
  },
});

const updateEpicComment = (id, data) => ({
  type: ActionTypes.EPIC_COMMENT_UPDATE,
  payload: {
    id,
    data,
  },
});

updateEpicComment.success = (epicComment) => ({
  type: ActionTypes.EPIC_COMMENT_UPDATE__SUCCESS,
  payload: {
    epicComment,
  },
});

updateEpicComment.failure = (id, error) => ({
  type: ActionTypes.EPIC_COMMENT_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleEpicCommentUpdate = (epicComment) => ({
  type: ActionTypes.EPIC_COMMENT_UPDATE_HANDLE,
  payload: {
    epicComment,
  },
});

const deleteEpicComment = (id) => ({
  type: ActionTypes.EPIC_COMMENT_DELETE,
  payload: {
    id,
  },
});

deleteEpicComment.success = (epicComment) => ({
  type: ActionTypes.EPIC_COMMENT_DELETE__SUCCESS,
  payload: {
    epicComment,
  },
});

deleteEpicComment.failure = (id, error) => ({
  type: ActionTypes.EPIC_COMMENT_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleEpicCommentDelete = (epicComment) => ({
  type: ActionTypes.EPIC_COMMENT_DELETE_HANDLE,
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
