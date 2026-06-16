/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import socket from './socket';

/* Transformers */

export const transformEpic = (epic) => ({
  ...epic,
  ...(epic.startDate && {
    startDate: new Date(epic.startDate),
  }),
  ...(epic.endDate && {
    endDate: new Date(epic.endDate),
  }),
});

export const transformEpicData = (data) => ({
  ...data,
  ...(data.startDate && {
    startDate: data.startDate.toISOString(),
  }),
  ...(data.endDate && {
    endDate: data.endDate.toISOString(),
  }),
});

/* Actions */

const createEpic = (boardId, data, headers) =>
  socket.post(`/boards/${boardId}/epics`, transformEpicData(data), headers).then((body) => ({
    ...body,
    item: transformEpic(body.item),
  }));

const updateEpic = (id, data, headers) =>
  socket.patch(`/epics/${id}`, transformEpicData(data), headers).then((body) => ({
    ...body,
    item: transformEpic(body.item),
  }));

const deleteEpic = (id, headers) =>
  socket.delete(`/epics/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformEpic(body.item),
  }));

/* Event handlers */

const makeHandleEpicCreate = (next) => (body) => {
  next({
    ...body,
    item: transformEpic(body.item),
  });
};

const makeHandleEpicUpdate = makeHandleEpicCreate;

const makeHandleEpicDelete = makeHandleEpicCreate;

export default {
  createEpic,
  updateEpic,
  deleteEpic,
  makeHandleEpicCreate,
  makeHandleEpicUpdate,
  makeHandleEpicDelete,
};
