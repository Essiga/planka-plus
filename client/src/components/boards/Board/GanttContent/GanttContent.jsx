/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isWeekend,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { BoardMembershipRoles } from '../../../../constants/Enums';
import { getEpicColorClassName, getEpicColorStyle } from '../../../../utils/epic-color';
import EpicModal from '../../../epics/EpicModal';

import styles from './GanttContent.module.scss';
import globalStyles from '../../../../styles.module.scss';

const NAME_WIDTH = 200;
const ROW_HEIGHT = 40;
const ZOOM_LEVELS = [10, 16, 24, 36, 56];
const DEFAULT_ZOOM_INDEX = 2;

const reorderArray = (array, fromIndex, toIndex) => {
  const next = array.slice();
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const GanttContent = React.memo(() => {
  const epics = useSelector(selectors.selectEpicsForCurrentBoardByGantt);

  const canEdit = useSelector((state) => {
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [openedEpicId, setOpenedEpicId] = useState(null);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);

  const dayWidth = ZOOM_LEVELS[zoomIndex];
  const scrollRef = useRef(null);

  const handleEpicOpen = useCallback((id) => {
    setOpenedEpicId(id);
  }, []);

  const handleEpicModalClose = useCallback(() => {
    setOpenedEpicId(null);
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomIndex((index) => Math.max(0, index - 1));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomIndex((index) => Math.min(ZOOM_LEVELS.length - 1, index + 1));
  }, []);

  const scheduledEpics = useMemo(
    () => epics.filter((epic) => epic.startDate && epic.endDate),
    [epics],
  );

  const unscheduledEpics = useMemo(
    () => epics.filter((epic) => !(epic.startDate && epic.endDate)),
    [epics],
  );

  // Row reordering (vertical drag on the epic name)
  const reorderRef = useRef(null);
  const [reorder, setReorder] = useState(null);

  const handleReorderMove = useCallback((event) => {
    const drag = reorderRef.current;
    if (!drag) {
      return;
    }

    if (Math.abs(event.clientY - drag.startClientY) > 4) {
      drag.moved = true;
    }

    const delta = Math.round((event.clientY - drag.startClientY) / ROW_HEIGHT);
    const toIndex = clamp(drag.fromIndex + delta, 0, drag.count - 1);

    if (toIndex !== drag.toIndex) {
      drag.toIndex = toIndex;
      setReorder({ id: drag.id, fromIndex: drag.fromIndex, toIndex });
    }
  }, []);

  const handleReorderEnd = useCallback(() => {
    document.removeEventListener('mousemove', handleReorderMove);
    document.removeEventListener('mouseup', handleReorderEnd);
    document.body.classList.remove(globalStyles.dragging);

    const drag = reorderRef.current;
    reorderRef.current = null;
    setReorder(null);

    if (!drag) {
      return;
    }

    if (!drag.moved) {
      handleEpicOpen(drag.id);
    } else if (drag.toIndex !== drag.fromIndex) {
      dispatch(entryActions.moveEpicInGantt(drag.id, drag.toIndex));
    }
  }, [handleReorderMove, handleEpicOpen, dispatch]);

  const handleReorderStart = useCallback(
    (id, index, count, event) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();

      reorderRef.current = {
        id,
        fromIndex: index,
        toIndex: index,
        count,
        startClientY: event.clientY,
        moved: false,
      };

      document.body.classList.add(globalStyles.dragging);
      document.addEventListener('mousemove', handleReorderMove);
      document.addEventListener('mouseup', handleReorderEnd);
    },
    [handleReorderMove, handleReorderEnd],
  );

  const displayEpics = useMemo(() => {
    if (!reorder) {
      return scheduledEpics;
    }

    return reorderArray(scheduledEpics, reorder.fromIndex, reorder.toIndex);
  }, [scheduledEpics, reorder]);

  const chart = useMemo(() => {
    if (scheduledEpics.length === 0) {
      return null;
    }

    const today = startOfDay(new Date());
    let min = today;
    let max = today;

    scheduledEpics.forEach((epic) => {
      if (epic.startDate < min) {
        min = epic.startDate;
      }
      if (epic.endDate > max) {
        max = epic.endDate;
      }
    });

    const rangeStart = startOfWeek(addDays(min, -3), { weekStartsOn: 1 });
    let rangeEnd = endOfWeek(addDays(max, 3), { weekStartsOn: 1 });

    // Ensure a minimum visible span
    if (differenceInCalendarDays(rangeEnd, rangeStart) < 41) {
      rangeEnd = addDays(rangeStart, 41);
    }

    const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

    const months = [];
    days.forEach((day, index) => {
      const key = format(day, 'yyyy-MM');
      const last = months[months.length - 1];

      if (last && last.key === key) {
        last.count += 1;
      } else {
        months.push({ key, label: format(day, 'MMM yyyy'), startIndex: index, count: 1 });
      }
    });

    return { rangeStart, days, months, today };
  }, [scheduledEpics]);

  const totalWidth = chart ? chart.days.length * dayWidth : 0;

  const handleTodayClick = useCallback(() => {
    if (!chart || !scrollRef.current) {
      return;
    }

    const offset = differenceInCalendarDays(chart.today, chart.rangeStart) * dayWidth;
    scrollRef.current.scrollLeft = Math.max(0, offset - 120);
  }, [chart, dayWidth]);

  const dayLineGradient = `repeating-linear-gradient(to right, transparent 0, transparent ${
    dayWidth - 1
  }px, #eef0f2 ${dayWidth - 1}px, #eef0f2 ${dayWidth}px)`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <Button.Group size="mini">
          <Button icon="minus" disabled={zoomIndex === 0} onClick={handleZoomOut} />
          <Button
            icon="plus"
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            onClick={handleZoomIn}
          />
        </Button.Group>
        <Button
          size="mini"
          onClick={handleTodayClick}
          content={t('common.today', { defaultValue: 'Today' })}
        />
        <div className={styles.toolbarSpacer} />
      </div>

      {chart ? (
        <div ref={scrollRef} className={styles.scroll}>
          <div className={styles.inner} style={{ width: NAME_WIDTH + totalWidth }}>
            <div className={styles.headerRow}>
              <div
                className={classNames(styles.nameColumn, styles.headerNameColumn)}
                style={{ width: NAME_WIDTH }}
              />
              <div className={styles.timeline} style={{ width: totalWidth }}>
                <div className={styles.monthsRow}>
                  {chart.months.map((month) => (
                    <div
                      key={month.key}
                      className={styles.monthCell}
                      style={{ left: month.startIndex * dayWidth, width: month.count * dayWidth }}
                    >
                      {month.label}
                    </div>
                  ))}
                </div>
                <div className={styles.daysRow}>
                  {chart.days.map((day) => (
                    <div
                      key={day.getTime()}
                      className={classNames(
                        styles.dayCell,
                        isWeekend(day) && styles.dayCellWeekend,
                        isSameDay(day, chart.today) && styles.dayCellToday,
                      )}
                      style={{ width: dayWidth }}
                    >
                      {dayWidth >= 16 ? format(day, 'd') : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {displayEpics.map((epic, index) => (
              <GanttRow
                key={epic.id}
                epic={epic}
                index={index}
                count={displayEpics.length}
                isDragging={!!reorder && reorder.id === epic.id}
                rangeStart={chart.rangeStart}
                today={chart.today}
                dayWidth={dayWidth}
                totalWidth={totalWidth}
                dayLineGradient={dayLineGradient}
                nameWidth={NAME_WIDTH}
                rowHeight={ROW_HEIGHT}
                canEdit={canEdit}
                onOpen={handleEpicOpen}
                onReorderStart={handleReorderStart}
                dispatch={dispatch}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          {t('common.noScheduledEpics', {
            defaultValue: 'No epics with start and end dates yet',
          })}
        </div>
      )}

      {unscheduledEpics.length > 0 && (
        <div className={styles.unscheduled}>
          <div className={styles.unscheduledTitle}>
            {t('common.unscheduledEpics', { defaultValue: 'Unscheduled' })}
          </div>
          {unscheduledEpics.map((epic) => (
            <button
              key={epic.id}
              type="button"
              className={styles.unscheduledItem}
              onClick={() => handleEpicOpen(epic.id)}
            >
              <span
                style={getEpicColorStyle(epic.color)}
                className={classNames(styles.rowColor, getEpicColorClassName(epic.color))}
              />
              <span>{epic.name || t('common.noName', { defaultValue: 'No name' })}</span>
            </button>
          ))}
        </div>
      )}

      {openedEpicId && (
        <EpicModal id={openedEpicId} canEdit={canEdit} onClose={handleEpicModalClose} />
      )}
    </div>
  );
});

const GanttRow = React.memo(
  ({
    epic,
    index,
    count,
    isDragging,
    rangeStart,
    today,
    dayWidth,
    totalWidth,
    dayLineGradient,
    nameWidth,
    rowHeight,
    canEdit,
    onOpen,
    onReorderStart,
    dispatch,
  }) => {
    const selectEpicProgressById = useMemo(() => selectors.makeSelectEpicProgressById(), []);
    const progress = useSelector((state) => selectEpicProgressById(state, epic.id));

    const handleNameMouseDown = useCallback(
      (event) => {
        onReorderStart(epic.id, index, count, event);
      },
      [onReorderStart, epic.id, index, count],
    );

    const dragRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const handleMouseMove = useCallback(
      (event) => {
        const drag = dragRef.current;
        if (!drag) {
          return;
        }

        const deltaDays = Math.round((event.clientX - drag.startClientX) / dayWidth);
        if (deltaDays !== 0) {
          drag.moved = true;
        }

        let nextStart = drag.originStart;
        let nextEnd = drag.originEnd;

        if (drag.mode === 'move') {
          nextStart = addDays(drag.originStart, deltaDays);
          nextEnd = addDays(drag.originEnd, deltaDays);
        } else if (drag.mode === 'resize-start') {
          nextStart = addDays(drag.originStart, deltaDays);
          if (differenceInCalendarDays(nextEnd, nextStart) < 0) {
            nextStart = nextEnd;
          }
        } else if (drag.mode === 'resize-end') {
          nextEnd = addDays(drag.originEnd, deltaDays);
          if (differenceInCalendarDays(nextEnd, nextStart) < 0) {
            nextEnd = nextStart;
          }
        }

        drag.latestStart = nextStart;
        drag.latestEnd = nextEnd;
        setPreview({ startDate: nextStart, endDate: nextEnd });
      },
      [dayWidth],
    );

    const handleMouseUp = useCallback(() => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove(globalStyles.dragging);

      const drag = dragRef.current;
      dragRef.current = null;

      if (!drag) {
        return;
      }

      if (!drag.moved) {
        setPreview(null);
        if (drag.mode === 'move') {
          onOpen(epic.id);
        }
        return;
      }

      dispatch(
        entryActions.updateEpic(epic.id, {
          startDate: drag.latestStart,
          endDate: drag.latestEnd,
        }),
      );

      setPreview(null);
    }, [handleMouseMove, dispatch, onOpen, epic.id]);

    const handleMouseDown = useCallback(
      (mode) => (event) => {
        if (!canEdit || event.button !== 0) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        dragRef.current = {
          mode,
          startClientX: event.clientX,
          originStart: epic.startDate,
          originEnd: epic.endDate,
          latestStart: epic.startDate,
          latestEnd: epic.endDate,
          moved: false,
        };

        document.body.classList.add(globalStyles.dragging);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      },
      [canEdit, epic.startDate, epic.endDate, handleMouseMove, handleMouseUp],
    );

    const handleBarClick = useCallback(() => {
      onOpen(epic.id);
    }, [onOpen, epic.id]);

    const startDate = preview ? preview.startDate : epic.startDate;
    const endDate = preview ? preview.endDate : epic.endDate;

    const left = differenceInCalendarDays(startDate, rangeStart) * dayWidth;
    const width = (differenceInCalendarDays(endDate, startDate) + 1) * dayWidth;
    const percent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
    const todayLeft = differenceInCalendarDays(today, rangeStart) * dayWidth;

    const colorClass = getEpicColorClassName(epic.color);
    const colorStyle = getEpicColorStyle(epic.color);

    return (
      <div
        className={classNames(styles.row, isDragging && styles.rowDragging)}
        style={{ height: rowHeight }}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                     jsx-a11y/no-static-element-interactions */}
        <div
          className={classNames(styles.rowName, canEdit && styles.rowNameDraggable)}
          style={{ width: nameWidth, height: rowHeight }}
          onMouseDown={canEdit ? handleNameMouseDown : undefined}
          onClick={canEdit ? undefined : handleBarClick}
        >
          {canEdit && count > 1 && <Icon fitted name="bars" className={styles.dragHandleIcon} />}
          <span style={colorStyle} className={classNames(styles.rowColor, colorClass)} />
          <span className={styles.rowNameText}>{epic.name || ' '}</span>
        </div>
        <div
          className={styles.track}
          style={{ width: totalWidth, height: rowHeight, backgroundImage: dayLineGradient }}
        >
          <div className={styles.todayLine} style={{ left: todayLeft }} />
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                       jsx-a11y/no-static-element-interactions */}
          <div
            className={classNames(styles.bar, colorClass, preview && styles.barDragging)}
            style={{ ...colorStyle, left, width, top: 6, height: rowHeight - 14 }}
            title={epic.name || undefined}
            onMouseDown={canEdit ? handleMouseDown('move') : undefined}
            onClick={canEdit ? undefined : handleBarClick}
          >
            {progress.total > 0 && (
              <div className={styles.barFill} style={{ width: `${percent}%` }} />
            )}
            <span className={styles.barLabel}>{epic.name}</span>
            {canEdit && (
              <>
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <span
                  className={classNames(styles.barHandle, styles.barHandleLeft)}
                  onMouseDown={handleMouseDown('resize-start')}
                />
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <span
                  className={classNames(styles.barHandle, styles.barHandleRight)}
                  onMouseDown={handleMouseDown('resize-end')}
                />
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);

GanttRow.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  epic: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  rangeStart: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  today: PropTypes.object.isRequired,
  dayWidth: PropTypes.number.isRequired,
  totalWidth: PropTypes.number.isRequired,
  dayLineGradient: PropTypes.string.isRequired,
  nameWidth: PropTypes.number.isRequired,
  rowHeight: PropTypes.number.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onReorderStart: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default GanttContent;
