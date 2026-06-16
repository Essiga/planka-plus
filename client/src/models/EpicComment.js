/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { attr, fk } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'EpicComment';

  static fields = {
    id: attr(),
    text: attr(),
    createdAt: attr({
      getDefault: () => new Date(),
    }),
    epicId: fk({
      to: 'Epic',
      as: 'epic',
      relatedName: 'comments',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'epicComments',
    }),
  };

  static reducer({ type, payload }, EpicComment) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        EpicComment.all().delete();

        break;
      case ActionTypes.EPIC_COMMENTS_FETCH__SUCCESS:
        payload.epicComments.forEach((epicComment) => {
          EpicComment.upsert(epicComment);
        });

        break;
      case ActionTypes.EPIC_COMMENT_CREATE:
      case ActionTypes.EPIC_COMMENT_CREATE_HANDLE:
      case ActionTypes.EPIC_COMMENT_UPDATE__SUCCESS:
      case ActionTypes.EPIC_COMMENT_UPDATE_HANDLE:
        EpicComment.upsert(payload.epicComment);

        break;
      case ActionTypes.EPIC_COMMENT_CREATE__SUCCESS:
        EpicComment.withId(payload.localId).delete();
        EpicComment.upsert(payload.epicComment);

        break;
      case ActionTypes.EPIC_COMMENT_CREATE__FAILURE:
        EpicComment.withId(payload.localId).delete();

        break;
      case ActionTypes.EPIC_COMMENT_UPDATE:
        EpicComment.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.EPIC_COMMENT_DELETE:
        EpicComment.withId(payload.id).delete();

        break;
      case ActionTypes.EPIC_COMMENT_DELETE__SUCCESS:
      case ActionTypes.EPIC_COMMENT_DELETE_HANDLE: {
        const epicCommentModel = EpicComment.withId(payload.epicComment.id);

        if (epicCommentModel) {
          epicCommentModel.delete();
        }

        break;
      }
      default:
    }
  }
}
