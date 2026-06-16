/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';

import styles from './EpicModal.module.scss';

const Comment = React.memo(({ id }) => {
  const selectEpicCommentById = useMemo(() => selectors.makeSelectEpicCommentById(), []);

  const epicComment = useSelector((state) => selectEpicCommentById(state, id));
  const currentUserId = useSelector(selectors.selectCurrentUserId);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const handleDelete = useCallback(() => {
    dispatch(entryActions.deleteEpicComment(id));
  }, [id, dispatch]);

  if (!epicComment) {
    return null;
  }

  const canDelete = epicComment.isPersisted && epicComment.userId === currentUserId;

  return (
    <div className={styles.comment}>
      <div className={styles.commentAuthor}>
        {epicComment.user
          ? epicComment.user.name
          : t('common.unknown', { defaultValue: 'Unknown' })}
      </div>
      <div className={styles.commentText}>{epicComment.text}</div>
      {canDelete && (
        <div className={styles.commentActions}>
          <Button
            size="mini"
            basic
            content={t('action.delete', { defaultValue: 'Delete' })}
            onClick={handleDelete}
          />
        </div>
      )}
    </div>
  );
});

Comment.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Comment;
