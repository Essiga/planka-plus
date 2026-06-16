/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Transformers */

export const transformEpicComment = (epicComment) => ({
  ...epicComment,
  ...(epicComment.createdAt && {
    createdAt: new Date(epicComment.createdAt),
  }),
});

/* Actions */

const getEpicComments = (epicId, headers) =>
  socket.get(`/epics/${epicId}/comments`, undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformEpicComment),
  }));

const createEpicComment = (epicId, data, headers) =>
  socket.post(`/epics/${epicId}/comments`, data, headers).then((body) => ({
    ...body,
    item: transformEpicComment(body.item),
  }));

const updateEpicComment = (id, data, headers) =>
  socket.patch(`/epic-comments/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformEpicComment(body.item),
  }));

const deleteEpicComment = (id, headers) =>
  socket.delete(`/epic-comments/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformEpicComment(body.item),
  }));

/* Event handlers */

const makeHandleEpicCommentCreate = (next) => (body) => {
  next({
    ...body,
    item: transformEpicComment(body.item),
  });
};

const makeHandleEpicCommentUpdate = makeHandleEpicCommentCreate;

const makeHandleEpicCommentDelete = makeHandleEpicCommentCreate;

export default {
  getEpicComments,
  createEpicComment,
  updateEpicComment,
  deleteEpicComment,
  makeHandleEpicCommentCreate,
  makeHandleEpicCommentUpdate,
  makeHandleEpicCommentDelete,
};
