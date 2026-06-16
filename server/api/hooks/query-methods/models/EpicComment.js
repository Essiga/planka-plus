/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const LIMIT = 50;

const defaultFind = (criteria, { limit } = {}) =>
  EpicComment.find(criteria).sort('id DESC').limit(limit);

/* Query methods */

const createOne = (values) => EpicComment.create({ ...values }).fetch();

const getByIds = (ids) => defaultFind(ids);

const getByEpicId = (epicId, { beforeId } = {}) => {
  const criteria = {
    epicId,
  };

  if (beforeId) {
    criteria.id = {
      '<': beforeId,
    };
  }

  return defaultFind(criteria, { limit: LIMIT });
};

const getOneById = (id) => EpicComment.findOne(id);

const updateOne = (criteria, values) => EpicComment.updateOne(criteria).set({ ...values });

// eslint-disable-next-line no-underscore-dangle
const delete_ = (criteria) => EpicComment.destroy(criteria).fetch();

const deleteOne = (criteria) => EpicComment.destroyOne(criteria);

module.exports = {
  createOne,
  getByIds,
  getByEpicId,
  getOneById,
  updateOne,
  deleteOne,
  delete: delete_,
};
