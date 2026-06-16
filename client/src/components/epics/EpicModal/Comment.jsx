/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Comment as UiComment, Form } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import TimeAgo from '../../common/TimeAgo';
import Markdown from '../../common/Markdown';
import UserAvatar from '../../users/UserAvatar';

import styles from './Comment.module.scss';

const Comment = React.memo(({ id, canEdit }) => {
  const selectEpicCommentById = useMemo(() => selectors.makeSelectEpicCommentById(), []);

  const epicComment = useSelector((state) => selectEpicCommentById(state, id));
  const currentUserId = useSelector(selectors.selectCurrentUserId);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [isEditOpened, setIsEditOpened] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleEditClick = useCallback(() => {
    setEditValue(epicComment ? epicComment.text : '');
    setIsEditOpened(true);
  }, [epicComment]);

  const handleEditCancel = useCallback(() => {
    setIsEditOpened(false);
  }, []);

  const handleEditSubmit = useCallback(
    (event) => {
      if (event) {
        event.preventDefault();
      }

      const cleanValue = editValue.trim();
      if (cleanValue && cleanValue !== epicComment.text) {
        dispatch(entryActions.updateEpicComment(id, { text: cleanValue }));
      }

      setIsEditOpened(false);
    },
    [id, editValue, epicComment, dispatch],
  );

  const handleDeleteClick = useCallback(() => {
    dispatch(entryActions.deleteEpicComment(id));
  }, [id, dispatch]);

  if (!epicComment) {
    return null;
  }

  const isCurrentUser = epicComment.userId === currentUserId;
  const canModify = canEdit && isCurrentUser && epicComment.isPersisted;

  return (
    <UiComment>
      {!isCurrentUser && (
        <span className={styles.user}>
          <UserAvatar id={epicComment.userId} />
        </span>
      )}
      <div className={classNames(styles.content, isCurrentUser && styles.contentWithoutUser)}>
        {isEditOpened ? (
          <Form onSubmit={handleEditSubmit}>
            <textarea
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              className={styles.editTextarea}
              value={editValue}
              onChange={(event) => setEditValue(event.target.value)}
            />
            <div className={styles.editControls}>
              <Button positive type="submit" content={t('action.save', { defaultValue: 'Save' })} />
              <Button
                type="button"
                content={t('action.cancel', { defaultValue: 'Cancel' })}
                onClick={handleEditCancel}
              />
            </div>
          </Form>
        ) : (
          <div className={classNames(styles.bubble, isCurrentUser && styles.bubbleRight)}>
            <div className={styles.header}>
              {epicComment.user
                ? epicComment.user.name
                : t('common.unknown', { defaultValue: 'Unknown' })}
            </div>
            <Markdown>{epicComment.text}</Markdown>
            <UiComment.Actions className={styles.information}>
              <span className={styles.date}>
                <TimeAgo date={epicComment.createdAt} />
              </span>
              {canModify && (
                <span className={styles.actions}>
                  <UiComment.Action
                    as="button"
                    content={t('action.edit', { defaultValue: 'Edit' })}
                    onClick={handleEditClick}
                  />
                  <UiComment.Action
                    as="button"
                    content={t('action.delete', { defaultValue: 'Delete' })}
                    onClick={handleDeleteClick}
                  />
                </span>
              )}
            </UiComment.Actions>
          </div>
        )}
      </div>
    </UiComment>
  );
});

Comment.propTypes = {
  id: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
};

export default Comment;
