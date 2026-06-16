/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import { format } from 'date-fns';
import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Icon } from 'semantic-ui-react';
import { push } from '../../../../lib/redux-router';

import selectors from '../../../../selectors';
import Paths from '../../../../constants/Paths';
import DroppableTypes from '../../../../constants/DroppableTypes';
import { getEpicColorClassName, getEpicColorStyle } from '../../../../utils/epic-color';

import styles from './BacklogContent.module.scss';

const EpicItem = React.memo(({ id, index, canEdit, draggable, onOpen }) => {
  const selectEpicById = useMemo(() => selectors.makeSelectEpicById(), []);
  const selectEpicProgressById = useMemo(() => selectors.makeSelectEpicProgressById(), []);
  const selectCardIdsByEpicId = useMemo(() => selectors.makeSelectCardIdsByEpicId(), []);
  const selectCardById = useMemo(() => selectors.makeSelectCardById(), []);

  const epic = useSelector((state) => selectEpicById(state, id));
  const progress = useSelector((state) => selectEpicProgressById(state, id));
  const cardIds = useSelector((state) => selectCardIdsByEpicId(state, id));

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setIsExpanded((value) => !value);
  }, []);

  const handleEditClick = useCallback(
    (event) => {
      event.stopPropagation();
      onOpen(id);
    },
    [id, onOpen],
  );

  const handleCardClick = useCallback(
    (cardId) => {
      dispatch(push(Paths.CARDS.replace(':id', cardId)));
    },
    [dispatch],
  );

  if (!epic) {
    return null;
  }

  const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  let dateText = null;
  if (epic.startDate || epic.endDate) {
    const start = epic.startDate ? format(epic.startDate, 'MMM d') : '…';
    const end = epic.endDate ? format(epic.endDate, 'MMM d') : '…';
    dateText = `${start} – ${end}`;
  }

  return (
    <Draggable
      draggableId={`epic:${id}`}
      index={index}
      isDragDisabled={!canEdit || !draggable || !epic.isPersisted}
    >
      {({ innerRef, draggableProps, dragHandleProps }) => (
        <div
          {...draggableProps} // eslint-disable-line react/jsx-props-no-spreading
          ref={innerRef}
          className={styles.epic}
        >
          <div className={styles.epicHeader}>
            {canEdit && draggable && (
              <span
                {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
                className={styles.dragHandle}
              >
                <Icon fitted name="bars" />
              </span>
            )}
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                         jsx-a11y/no-static-element-interactions */}
            <div className={styles.epicHeaderMain} onClick={handleToggle}>
              <Icon fitted name={isExpanded ? 'caret down' : 'caret right'} />
              <span
                style={getEpicColorStyle(epic.color)}
                className={classNames(styles.epicColor, getEpicColorClassName(epic.color))}
              />
              <span className={classNames(styles.epicName, !epic.name && styles.epicNameless)}>
                {epic.name || t('common.noName', { defaultValue: 'No name' })}
              </span>
              {dateText && (
                <span className={styles.epicMeta}>
                  <Icon name="calendar outline" />
                  {dateText}
                </span>
              )}
              <span className={styles.progress}>
                {progress.isCompleted && (
                  <Icon fitted name="check circle" className={styles.doneBadge} />
                )}
                <span className={styles.progressBar}>
                  <span className={styles.progressBarFill} style={{ width: `${percent}%` }} />
                </span>
                <span>
                  {progress.completed}/{progress.total}
                </span>
              </span>
            </div>
            {canEdit && (
              <Button
                size="mini"
                icon="pencil"
                className={styles.editButton}
                onClick={handleEditClick}
              />
            )}
          </div>
          {isExpanded && (
            <Droppable droppableId={`epic-cards:${id}`} type={DroppableTypes.EPIC_CARD}>
              {({ innerRef: cardsRef, droppableProps, placeholder }) => (
                <div
                  {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                  ref={cardsRef}
                  className={styles.cards}
                >
                  {cardIds.length === 0 ? (
                    <div className={styles.cardEmpty}>
                      {t('common.noCardsInEpic', { defaultValue: 'No cards yet' })}
                    </div>
                  ) : (
                    cardIds.map((cardId, cardIndex) => (
                      <CardRow
                        key={cardId}
                        id={cardId}
                        index={cardIndex}
                        canDrag={canEdit}
                        selectCardById={selectCardById}
                        onClick={handleCardClick}
                      />
                    ))
                  )}
                  {placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
});

const CardRow = React.memo(({ id, index, canDrag, selectCardById, onClick }) => {
  const card = useSelector((state) => selectCardById(state, id));

  const handleClick = useCallback(() => {
    onClick(id);
  }, [id, onClick]);

  if (!card) {
    return null;
  }

  return (
    <Draggable draggableId={`epic-card:${id}`} index={index} isDragDisabled={!canDrag}>
      {({ innerRef, draggableProps, dragHandleProps }) => (
        <div
          {...draggableProps} // eslint-disable-line react/jsx-props-no-spreading
          {...dragHandleProps} // eslint-disable-line react/jsx-props-no-spreading
          ref={innerRef}
          className={classNames(styles.cardRow, card.isClosed && styles.cardRowClosed)}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={undefined}
        >
          <Icon name={card.isClosed ? 'check circle' : 'circle outline'} />
          <span>{card.name}</span>
        </div>
      )}
    </Draggable>
  );
});

CardRow.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  canDrag: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  selectCardById: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

EpicItem.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  canEdit: PropTypes.bool.isRequired,
  draggable: PropTypes.bool,
  onOpen: PropTypes.func.isRequired,
};

EpicItem.defaultProps = {
  draggable: true,
};

export default EpicItem;
