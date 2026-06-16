/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Button, Input } from 'semantic-ui-react';
import { closePopup } from '../../../../lib/popup';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import parseDndId from '../../../../utils/parse-dnd-id';
import DroppableTypes from '../../../../constants/DroppableTypes';
import { BoardMembershipRoles } from '../../../../constants/Enums';
import LabelColors from '../../../../constants/LabelColors';
import EpicItem from './EpicItem';
import EpicModal from '../../../epics/EpicModal';

import styles from './BacklogContent.module.scss';
import globalStyles from '../../../../styles.module.scss';

const BacklogContent = React.memo(() => {
  const epics = useSelector(selectors.selectEpicsForCurrentBoard);

  const canEdit = useSelector((state) => {
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [name, setName] = useState('');
  const [openedEpicId, setOpenedEpicId] = useState(null);

  const handleNameChange = useCallback((_, { value }) => {
    setName(value);
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const cleanName = name.trim();
      if (!cleanName) {
        return;
      }

      dispatch(
        entryActions.createEpicInCurrentBoard({
          name: cleanName,
          color: LabelColors[epics.length % LabelColors.length],
        }),
      );

      setName('');
    },
    [name, epics.length, dispatch],
  );

  const handleEpicOpen = useCallback((id) => {
    setOpenedEpicId(id);
  }, []);

  const handleEpicModalClose = useCallback(() => {
    setOpenedEpicId(null);
  }, []);

  const handleDragStart = useCallback(() => {
    document.body.classList.add(globalStyles.dragging);
    closePopup();
  }, []);

  const handleDragEnd = useCallback(
    ({ draggableId, type, source, destination }) => {
      document.body.classList.remove(globalStyles.dragging);

      if (!destination) {
        return;
      }

      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
      }

      const id = parseDndId(draggableId);

      switch (type) {
        case DroppableTypes.EPIC:
          dispatch(entryActions.moveEpic(id, destination.index));

          break;
        case DroppableTypes.EPIC_CARD:
          // Only support reordering within the same epic
          if (source.droppableId === destination.droppableId) {
            dispatch(entryActions.moveCardInEpic(id, destination.index));
          }

          break;
        default:
      }
    },
    [dispatch],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>{t('common.backlog', { defaultValue: 'Backlog' })}</h2>
        </div>
        {canEdit && (
          <form className={styles.addForm} onSubmit={handleSubmit}>
            <Input
              fluid
              className={styles.addInput}
              value={name}
              placeholder={t('common.enterEpicName', { defaultValue: 'Enter epic name' })}
              onChange={handleNameChange}
            />
            <Button
              positive
              type="submit"
              content={t('action.addEpic', { defaultValue: 'Add epic' })}
            />
          </form>
        )}
        {epics.length === 0 ? (
          <div className={styles.empty}>
            {t('common.noEpics', { defaultValue: 'No epics yet' })}
          </div>
        ) : (
          <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Droppable droppableId="epics" type={DroppableTypes.EPIC}>
              {({ innerRef, droppableProps, placeholder }) => (
                <div
                  {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                  ref={innerRef}
                >
                  {epics.map((epic, index) => (
                    <EpicItem
                      key={epic.id}
                      id={epic.id}
                      index={index}
                      canEdit={canEdit}
                      onOpen={handleEpicOpen}
                    />
                  ))}
                  {placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
      {openedEpicId && (
        <EpicModal id={openedEpicId} canEdit={canEdit} onClose={handleEpicModalClose} />
      )}
    </div>
  );
});

export default BacklogContent;
