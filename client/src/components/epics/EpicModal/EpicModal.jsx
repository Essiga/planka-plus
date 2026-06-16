/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import { Button, Comment as SuiComment, Dropdown, Grid, Icon } from 'semantic-ui-react';
import { push } from '../../../lib/redux-router';
import { useDidUpdate } from '../../../lib/hooks';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useClosableModal } from '../../../hooks';
import { isUsableMarkdownElement } from '../../../utils/element-helpers';
import Paths from '../../../constants/Paths';
import LabelColors from '../../../constants/LabelColors';
import NameField from '../../cards/CardModal/NameField';
import EditMarkdown from '../../common/EditMarkdown';
import ExpandableMarkdown from '../../common/ExpandableMarkdown';
import Comment from './Comment';

import styles from './EpicModal.module.scss';
import globalStyles from '../../../styles.module.scss';

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

  const [descriptionDraft, setDescriptionDraft] = useState(null);
  const [isEditDescriptionOpened, setIsEditDescriptionOpened] = useState(false);
  const [commentText, setCommentText] = useState('');

  const [ClosableModal, , , , setIsClosableActive] = useClosableModal();

  useEffect(() => {
    dispatch(entryActions.fetchEpicComments(id));
  }, [id, dispatch]);

  useDidUpdate(() => {
    setIsClosableActive(isEditDescriptionOpened);
  }, [isEditDescriptionOpened]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleNameUpdate = useCallback(
    (name) => {
      dispatch(entryActions.updateEpic(id, { name: name || null }));
    },
    [id, dispatch],
  );

  const handleColorClick = useCallback(
    (color) => {
      dispatch(entryActions.updateEpic(id, { color }));
    },
    [id, dispatch],
  );

  const handleStartDateChange = useCallback(
    (date) => {
      dispatch(entryActions.updateEpic(id, { startDate: date || null }));
    },
    [id, dispatch],
  );

  const handleEndDateChange = useCallback(
    (date) => {
      dispatch(entryActions.updateEpic(id, { endDate: date || null }));
    },
    [id, dispatch],
  );

  const handleDescriptionUpdate = useCallback(
    (description) => {
      dispatch(entryActions.updateEpic(id, { description }));
    },
    [id, dispatch],
  );

  const handleEditDescriptionClick = useCallback((event) => {
    if (window.getSelection().toString() || isUsableMarkdownElement(event.target)) {
      return;
    }

    setIsEditDescriptionOpened(true);
  }, []);

  const handleEditDescriptionClose = useCallback((nextDescriptionDraft) => {
    setDescriptionDraft(nextDescriptionDraft);
    setIsEditDescriptionOpened(false);
  }, []);

  const handleCardClick = useCallback(
    (cardId) => {
      onClose();
      dispatch(push(Paths.CARDS.replace(':id', cardId)));
    },
    [dispatch, onClose],
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

  const handleCardAdd = useCallback(
    (_, { value }) => {
      // Only assign when the selected value is an existing card (not a typed addition,
      // which is handled by onAddItem -> handleCardCreate)
      if (!value || !availableCardOptions.some((option) => option.value === value)) {
        return;
      }

      dispatch(entryActions.updateCard(value, { epicId: id }));
    },
    [id, dispatch, availableCardOptions],
  );

  const handleCardCreate = useCallback(
    (_, { value }) => {
      const cleanName = value.trim();
      if (!cleanName) {
        return;
      }

      dispatch(entryActions.createCardInEpic(id, cleanName));
    },
    [id, dispatch],
  );

  const handleCardRemove = useCallback(
    (cardId) => {
      dispatch(entryActions.updateCard(cardId, { epicId: null }));
    },
    [dispatch],
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

  if (!epic) {
    return null;
  }

  return (
    <ClosableModal closeIcon centered={false} className={styles.wrapper} onClose={handleClose}>
      <Grid className={styles.gridWrapper}>
        <Grid.Row className={styles.headerPadding}>
          <Grid.Column width={16} className={styles.headerPadding}>
            <div className={styles.headerWrapper}>
              <Icon name="bookmark" className={styles.moduleIcon} />
              <div className={styles.headerTitleWrapper}>
                {canEdit ? (
                  <NameField defaultValue={epic.name || ''} onUpdate={handleNameUpdate} />
                ) : (
                  <div className={styles.headerTitle}>
                    {epic.name || t('common.noName', { defaultValue: 'No name' })}
                  </div>
                )}
              </div>
            </div>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className={styles.modalPadding}>
          <Grid.Column width={12} className={styles.contentPadding}>
            <div className={classNames(styles.contentModule, styles.contentModuleDescription)}>
              <div className={styles.moduleWrapper}>
                <Icon name="align left" className={styles.moduleIcon} />
                <div className={styles.moduleHeader}>
                  {t('common.description', { defaultValue: 'Description' })}
                  {canEdit && !isEditDescriptionOpened && descriptionDraft && (
                    <span className={styles.draftChip}>
                      {t('common.unsavedChanges', { defaultValue: 'Unsaved changes' })}
                    </span>
                  )}
                </div>
                {canEdit ? (
                  <>
                    {isEditDescriptionOpened && (
                      <EditMarkdown
                        defaultValue={epic.description}
                        draftValue={descriptionDraft}
                        onUpdate={handleDescriptionUpdate}
                        onClose={handleEditDescriptionClose}
                      />
                    )}
                    {!isEditDescriptionOpened &&
                      (epic.description ? (
                        /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                                  jsx-a11y/no-static-element-interactions */
                        <div className={styles.cursorPointer} onClick={handleEditDescriptionClick}>
                          <Button className={styles.editButton}>
                            <Icon fitted name="pencil" size="small" />
                          </Button>
                          <ExpandableMarkdown>{epic.description}</ExpandableMarkdown>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={styles.descriptionButton}
                          onClick={handleEditDescriptionClick}
                        >
                          <span className={styles.descriptionButtonText}>
                            {t('action.addMoreDetailedDescription', {
                              defaultValue: 'Add a more detailed description...',
                            })}
                          </span>
                        </button>
                      ))}
                  </>
                ) : (
                  epic.description && <ExpandableMarkdown>{epic.description}</ExpandableMarkdown>
                )}
              </div>
            </div>

            <div className={styles.contentModule}>
              <div className={styles.moduleWrapper}>
                <Icon name="check square outline" className={styles.moduleIcon} />
                <div className={styles.moduleHeader}>
                  {t('common.cards', { defaultValue: 'Cards' })}
                </div>
                {canEdit && (
                  <Dropdown
                    fluid
                    search
                    selection
                    allowAdditions
                    selectOnBlur={false}
                    selectOnNavigation={false}
                    value=""
                    options={availableCardOptions}
                    placeholder={t('common.addCardToEpic', { defaultValue: 'Add a card...' })}
                    noResultsMessage={t('common.noCards', { defaultValue: 'No cards' })}
                    additionLabel={`${t('action.createCard', { defaultValue: 'Create card' })}: `}
                    onAddItem={handleCardCreate}
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
              </div>
            </div>

            <div className={styles.contentModule}>
              <div className={styles.moduleWrapper}>
                <Icon name="comment outline" className={styles.moduleIcon} />
                <div className={styles.moduleHeader}>
                  {t('common.comments', { defaultValue: 'Comments' })}
                </div>
                <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
                  <textarea
                    className={styles.commentTextarea}
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
                <SuiComment.Group>
                  {commentIds.map((commentId) => (
                    <Comment key={commentId} id={commentId} canEdit={canEdit} />
                  ))}
                </SuiComment.Group>
              </div>
            </div>
          </Grid.Column>
          <Grid.Column width={4} className={styles.sidebarPadding}>
            {canEdit && (
              <div className={styles.sidebarSection}>
                <div className={styles.text}>{t('common.color', { defaultValue: 'Color' })}</div>
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
              </div>
            )}

            <div className={styles.sidebarSection}>
              <div className={styles.text}>
                {t('common.startDate', { defaultValue: 'Start date' })}
              </div>
              <DatePicker
                selected={epic.startDate || null}
                disabled={!canEdit}
                dateFormat="dd.MM.yyyy"
                maxDate={epic.endDate || undefined}
                placeholderText={t('common.startDate', { defaultValue: 'Start date' })}
                className={styles.dateInput}
                wrapperClassName={styles.datePicker}
                popperClassName={styles.datePickerPopper}
                onChange={handleStartDateChange}
              />
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.text}>{t('common.endDate', { defaultValue: 'End date' })}</div>
              <DatePicker
                selected={epic.endDate || null}
                disabled={!canEdit}
                dateFormat="dd.MM.yyyy"
                minDate={epic.startDate || undefined}
                openToDate={epic.endDate || epic.startDate || undefined}
                placeholderText={t('common.endDate', { defaultValue: 'End date' })}
                className={styles.dateInput}
                wrapperClassName={styles.datePicker}
                popperClassName={styles.datePickerPopper}
                onChange={handleEndDateChange}
              />
            </div>

            {canEdit && (
              <div className={styles.sidebarSection}>
                <Button
                  fluid
                  negative
                  content={t('action.deleteEpic', { defaultValue: 'Delete epic' })}
                  onClick={handleDelete}
                />
              </div>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
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
