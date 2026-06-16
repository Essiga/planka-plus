/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Button, Dropdown, Icon, Input } from 'semantic-ui-react';
import { closePopup } from '../../../../lib/popup';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import parseDndId from '../../../../utils/parse-dnd-id';
import DroppableTypes from '../../../../constants/DroppableTypes';
import { BoardMembershipRoles } from '../../../../constants/Enums';
import EpicColors from '../../../../constants/EpicColors';
import EpicItem from './EpicItem';
import EpicModal from '../../../epics/EpicModal';

import styles from './BacklogContent.module.scss';
import globalStyles from '../../../../styles.module.scss';

const BacklogContent = React.memo(() => {
  const board = useSelector(selectors.selectCurrentBoard);
  const epics = useSelector(selectors.selectEpicsWithCompletionForCurrentBoard);

  const canEdit = useSelector((state) => {
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const activeEpics = useMemo(() => epics.filter((epic) => !epic.isCompleted), [epics]);
  const doneEpics = useMemo(() => epics.filter((epic) => epic.isCompleted), [epics]);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [name, setName] = useState('');
  const [openedEpicId, setOpenedEpicId] = useState(null);
  const [isDoneExpanded, setIsDoneExpanded] = useState(false);
  const [sortBy, setSortBy] = useState('manual');

  // Reuse the board's existing search bar (card search) to also filter epics by name
  const search = board.search || '';

  const handleToggleDone = useCallback(() => {
    setIsDoneExpanded((value) => !value);
  }, []);

  const handleSortChange = useCallback((_, { value }) => {
    setSortBy(value);
  }, []);

  const applySearchAndSort = useCallback(
    (list) => {
      const query = search.trim().toLowerCase();
      let result = query
        ? list.filter((epic) => (epic.name || '').toLowerCase().includes(query))
        : list;

      const byDate = (key) => (a, b) => {
        if (!a[key] && !b[key]) {
          return 0;
        }
        if (!a[key]) {
          return 1;
        }
        if (!b[key]) {
          return -1;
        }
        return a[key] - b[key];
      };

      if (sortBy === 'name') {
        result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      } else if (sortBy === 'startDate') {
        result = [...result].sort(byDate('startDate'));
      } else if (sortBy === 'endDate') {
        result = [...result].sort(byDate('endDate'));
      }

      return result;
    },
    [search, sortBy],
  );

  const filteredActiveEpics = useMemo(
    () => applySearchAndSort(activeEpics),
    [applySearchAndSort, activeEpics],
  );

  const filteredDoneEpics = useMemo(
    () => applySearchAndSort(doneEpics),
    [applySearchAndSort, doneEpics],
  );

  const canReorder = sortBy === 'manual' && !search.trim();

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
          color: EpicColors[epics.length % EpicColors.length],
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
          // Only the active list is reorderable
          if (source.droppableId === 'epics' && destination.droppableId === 'epics') {
            dispatch(entryActions.moveEpic(id, destination.index));
          }

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
          {epics.length > 0 && (
            <Dropdown
              selection
              compact
              className={styles.sortDropdown}
              value={sortBy}
              options={[
                {
                  key: 'manual',
                  value: 'manual',
                  text: t('common.manualOrder', { defaultValue: 'Manual order' }),
                },
                { key: 'name', value: 'name', text: t('common.name', { defaultValue: 'Name' }) },
                {
                  key: 'startDate',
                  value: 'startDate',
                  text: t('common.startDate', { defaultValue: 'Start date' }),
                },
                {
                  key: 'endDate',
                  value: 'endDate',
                  text: t('common.endDate', { defaultValue: 'End date' }),
                },
              ]}
              onChange={handleSortChange}
            />
          )}
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
                  {filteredActiveEpics.length === 0 && (
                    <div className={styles.empty}>
                      {search.trim()
                        ? t('common.noEpicsMatchSearch', { defaultValue: 'No epics match' })
                        : t('common.noActiveEpics', { defaultValue: 'No active epics' })}
                    </div>
                  )}
                  {filteredActiveEpics.map((epic, index) => (
                    <EpicItem
                      key={epic.id}
                      id={epic.id}
                      index={index}
                      canEdit={canEdit}
                      draggable={canReorder}
                      onOpen={handleEpicOpen}
                    />
                  ))}
                  {placeholder}
                </div>
              )}
            </Droppable>

            {filteredDoneEpics.length > 0 && (
              <>
                <button type="button" className={styles.sectionTitle} onClick={handleToggleDone}>
                  <Icon fitted name={isDoneExpanded ? 'caret down' : 'caret right'} />
                  {t('common.done', { defaultValue: 'Done' })} ({filteredDoneEpics.length})
                </button>
                {isDoneExpanded && (
                  <Droppable droppableId="done-epics" type={DroppableTypes.EPIC_DONE}>
                    {({ innerRef, droppableProps, placeholder }) => (
                      <div
                        {...droppableProps} // eslint-disable-line react/jsx-props-no-spreading
                        ref={innerRef}
                        className={styles.doneSection}
                      >
                        {filteredDoneEpics.map((epic, index) => (
                          <EpicItem
                            key={epic.id}
                            id={epic.id}
                            index={index}
                            canEdit={canEdit}
                            draggable={false}
                            onOpen={handleEpicOpen}
                          />
                        ))}
                        {placeholder}
                      </div>
                    )}
                  </Droppable>
                )}
              </>
            )}
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
