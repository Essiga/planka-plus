/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import { format } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Icon, Input } from 'semantic-ui-react';
import { push } from '../../../lib/redux-router';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useClosableModal } from '../../../hooks';
import Paths from '../../../constants/Paths';
import LabelColors from '../../../constants/LabelColors';
import Comment from './Comment';

import styles from './EpicModal.module.scss';
import globalStyles from '../../../styles.module.scss';

const toInputDate = (date) => (date ? format(date, 'yyyy-MM-dd') : '');

const EpicModal = React.memo(({ id, canEdit, onClose }) => {
  const selectEpicById = useMemo(() => selectors.makeSelectEpicById(), []);
  const selectCardIdsByEpicId = useMemo(() => selectors.makeSelectCardIdsByEpicId(), []);
  const selectCommentIdsByEpicId = useMemo(() => selectors.makeSelectCommentIdsByEpicId(), []);
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const epic = useSelector((state) => selectEpicById(state, id));
  const cardIds = useSelector((state) => selectCardIdsByEpicId(state, id));
  const commentIds = useSelector((state) => selectCommentIdsByEpicId(state, id));
  const boardCards = useSelector(selectors.selectCardsForCurrentBoard);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [name, setName] = useState(epic ? epic.name || '' : '');
  const [description, setDescription] = useState(epic ? epic.description || '' : '');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    dispatch(entryActions.fetchEpicComments(id));
  }, [id, dispatch]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleNameBlur = useCallback(() => {
    const cleanName = name.trim();

    if (cleanName === (epic.name || '')) {
      return;
    }

    dispatch(entryActions.updateEpic(id, { name: cleanName || null }));
  }, [id, name, epic, dispatch]);

  const handleDescriptionBlur = useCallback(() => {
    const cleanDescription = description.trim();

    if (cleanDescription === (epic.description || '')) {
      return;
    }

    dispatch(entryActions.updateEpic(id, { description: cleanDescription || null }));
  }, [id, description, epic, dispatch]);

  const handleColorClick = useCallback(
    (color) => {
      dispatch(entryActions.updateEpic(id, { color }));
    },
    [id, dispatch],
  );

  const handleStartDateChange = useCallback(
    (event) => {
      const { value } = event.target;
      dispatch(entryActions.updateEpic(id, { startDate: value ? new Date(value) : null }));
    },
    [id, dispatch],
  );

  const handleEndDateChange = useCallback(
    (event) => {
      const { value } = event.target;
      dispatch(entryActions.updateEpic(id, { endDate: value ? new Date(value) : null }));
    },
    [id, dispatch],
  );

  const handleCardClick = useCallback(
    (cardId) => {
      onClose();
      dispatch(push(Paths.CARDS.replace(':id', cardId)));
    },
    [dispatch, onClose],
  );

  const handleCardAdd = useCallback(
    (_, { value }) => {
      if (!value) {
        return;
      }

      dispatch(entryActions.updateCard(value, { epicId: id }));
    },
    [id, dispatch],
  );

  const handleCardRemove = useCallback(
    (cardId) => {
      dispatch(entryActions.updateCard(cardId, { epicId: null }));
    },
    [dispatch],
  );

  const availableCardOptions = useMemo(
    () =>
      boardCards
        .filter((card) => card.epicId !== id)
        .map((card) => ({
          key: card.id,
          value: card.id,
          text: card.name,
        })),
    [boardCards, id],
  );

  const handleDelete = useCallback(() => {
    onClose();
    dispatch(entryActions.deleteEpic(id));
  }, [id, dispatch, onClose]);

  const handleCommentSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const cleanText = commentText.trim();
      if (!cleanText) {
        return;
      }

      dispatch(entryActions.createEpicComment(id, { text: cleanText }));
      setCommentText('');
    },
    [id, commentText, dispatch],
  );

  const [ClosableModal] = useClosableModal();

  if (!epic) {
    return null;
  }

  return (
    <ClosableModal closeIcon size="small" centered={false} onClose={handleClose}>
      <ClosableModal.Header>
        <Icon name="bookmark" /> {epic.name || t('common.noName', { defaultValue: 'No name' })}
      </ClosableModal.Header>
      <ClosableModal.Content>
        {canEdit && (
          <>
            <div className={styles.fieldLabel}>{t('common.name', { defaultValue: 'Name' })}</div>
            <Input
              fluid
              value={name}
              onChange={(_, { value }) => setName(value)}
              onBlur={handleNameBlur}
            />

            <div className={styles.fieldLabel}>{t('common.color', { defaultValue: 'Color' })}</div>
            <div className={styles.colors}>
              {LabelColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  className={classNames(
                    styles.color,
                    epic.color === color && styles.colorSelected,
                    globalStyles[`background${upperFirst(camelCase(color))}`],
                  )}
                  onClick={() => handleColorClick(color)}
                />
              ))}
            </div>

            <div className={styles.dates}>
              <div className={styles.dateField}>
                <div className={styles.fieldLabel}>
                  {t('common.startDate', { defaultValue: 'Start date' })}
                </div>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={toInputDate(epic.startDate)}
                  onChange={handleStartDateChange}
                />
              </div>
              <div className={styles.dateField}>
                <div className={styles.fieldLabel}>
                  {t('common.endDate', { defaultValue: 'End date' })}
                </div>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={toInputDate(epic.endDate)}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>

            <div className={styles.fieldLabel}>
              {t('common.description', { defaultValue: 'Description' })}
            </div>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onBlur={handleDescriptionBlur}
            />
          </>
        )}

        <div className={styles.fieldLabel}>{t('common.cards', { defaultValue: 'Cards' })}</div>
        {canEdit && (
          <Dropdown
            fluid
            search
            selection
            selectOnBlur={false}
            selectOnNavigation={false}
            value=""
            options={availableCardOptions}
            placeholder={t('common.addCardToEpic', { defaultValue: 'Add a card...' })}
            noResultsMessage={t('common.noCards', { defaultValue: 'No cards' })}
            onChange={handleCardAdd}
          />
        )}
        {cardIds.length === 0 ? (
          <div className={styles.empty}>
            {t('common.noCardsInEpic', { defaultValue: 'No cards yet' })}
          </div>
        ) : (
          <ul className={styles.cardList}>
            {cardIds.map((cardId) => (
              <CardItem
                key={cardId}
                id={cardId}
                canEdit={canEdit}
                selectCardById={selectCardById}
                onClick={handleCardClick}
                onRemove={handleCardRemove}
              />
            ))}
          </ul>
        )}

        <div className={styles.fieldLabel}>
          {t('common.comments', { defaultValue: 'Comments' })}
        </div>
        <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
          <textarea
            className={styles.textarea}
            value={commentText}
            placeholder={t('common.writeComment', { defaultValue: 'Write a comment...' })}
            onChange={(event) => setCommentText(event.target.value)}
          />
          <div>
            <Button
              positive
              type="submit"
              content={t('action.addComment', { defaultValue: 'Add comment' })}
            />
          </div>
        </form>
        {commentIds.map((commentId) => (
          <Comment key={commentId} id={commentId} />
        ))}

        {canEdit && (
          <div className={styles.deleteButton}>
            <Button
              negative
              content={t('action.deleteEpic', { defaultValue: 'Delete epic' })}
              onClick={handleDelete}
            />
          </div>
        )}
      </ClosableModal.Content>
    </ClosableModal>
  );
});

const CardItem = React.memo(({ id, canEdit, selectCardById, onClick, onRemove }) => {
  const card = useSelector((state) => selectCardById(state, id));

  const handleClick = useCallback(() => {
    onClick(id);
  }, [id, onClick]);

  const handleRemoveClick = useCallback(
    (event) => {
      event.stopPropagation();
      onRemove(id);
    },
    [id, onRemove],
  );

  if (!card) {
    return null;
  }

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                   jsx-a11y/no-noninteractive-element-interactions */}
      <li
        className={classNames(styles.cardItem, card.isClosed && styles.cardItemClosed)}
        onClick={handleClick}
      >
        <Icon name={card.isClosed ? 'check circle' : 'circle outline'} />
        <span style={{ flex: '1 1 auto' }}>{card.name}</span>
        {canEdit && <Icon link name="times" onClick={handleRemoveClick} />}
      </li>
    </>
  );
});

CardItem.propTypes = {
  id: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  selectCardById: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

EpicModal.propTypes = {
  id: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EpicModal;
