/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'Epic';

  static fields = {
    id: attr(),
    position: attr(),
    ganttPosition: attr(),
    name: attr(),
    description: attr(),
    color: attr(),
    startDate: attr(),
    endDate: attr(),
    isCommentsFetching: attr({
      getDefault: () => false,
    }),
    isCommentsFetched: attr({
      getDefault: () => false,
    }),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'epics',
    }),
  };

  static reducer({ type, payload }, Epic) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.USER_UPDATE_HANDLE:
      case ActionTypes.PROJECT_UPDATE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.epics) {
          payload.epics.forEach((epic) => {
            Epic.upsert(epic);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Epic.all().delete();

        if (payload.epics) {
          payload.epics.forEach((epic) => {
            Epic.upsert(epic);
          });
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
        if (payload.epics) {
          payload.epics.forEach((epic) => {
            Epic.upsert(epic);
          });
        }

        break;
      case ActionTypes.EPIC_CREATE:
      case ActionTypes.EPIC_CREATE_HANDLE:
      case ActionTypes.EPIC_UPDATE__SUCCESS:
      case ActionTypes.EPIC_UPDATE_HANDLE:
        Epic.upsert(payload.epic);

        break;
      case ActionTypes.EPIC_CREATE__SUCCESS:
        Epic.withId(payload.localId).delete();
        Epic.upsert(payload.epic);

        break;
      case ActionTypes.EPIC_CREATE__FAILURE:
        Epic.withId(payload.localId).delete();

        break;
      case ActionTypes.EPIC_UPDATE:
        Epic.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.EPIC_DELETE:
        Epic.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.EPIC_DELETE__SUCCESS:
      case ActionTypes.EPIC_DELETE_HANDLE: {
        const epicModel = Epic.withId(payload.epic.id);

        if (epicModel) {
          epicModel.deleteWithRelated();
        }

        break;
      }
      case ActionTypes.EPIC_COMMENTS_FETCH:
        Epic.withId(payload.epicId).update({
          isCommentsFetching: true,
        });

        break;
      case ActionTypes.EPIC_COMMENTS_FETCH__SUCCESS:
        Epic.withId(payload.epicId).update({
          isCommentsFetching: false,
          isCommentsFetched: true,
        });

        break;
      default:
    }
  }

  getCommentsQuerySet() {
    return this.comments.orderBy(['id.length', 'id'], ['desc', 'desc']);
  }

  getCardsQuerySet() {
    return this.cards.orderBy(['epicPosition', 'id.length', 'id']);
  }

  deleteRelated() {
    this.cards.toModelArray().forEach((cardModel) => {
      cardModel.update({
        epicId: null,
      });
    });

    this.comments.delete();
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
