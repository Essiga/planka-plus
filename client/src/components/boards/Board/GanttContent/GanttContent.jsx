/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import {
  differenceInCalendarDays,
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from 'date-fns';
import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import selectors from '../../../../selectors';
import { BoardMembershipRoles } from '../../../../constants/Enums';
import EpicModal from '../../../epics/EpicModal';

import styles from './GanttContent.module.scss';
import globalStyles from '../../../../styles.module.scss';

const GanttContent = React.memo(() => {
  const epics = useSelector(selectors.selectEpicsForCurrentBoard);

  const canEdit = useSelector((state) => {
    const boardMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    return !!boardMembership && boardMembership.role === BoardMembershipRoles.EDITOR;
  });

  const [t] = useTranslation();
  const [openedEpicId, setOpenedEpicId] = useState(null);

  const handleEpicOpen = useCallback((id) => {
    setOpenedEpicId(id);
  }, []);

  const handleEpicModalClose = useCallback(() => {
    setOpenedEpicId(null);
  }, []);

  const scheduledEpics = useMemo(
    () => epics.filter((epic) => epic.startDate && epic.endDate),
    [epics],
  );

  const unscheduledEpics = useMemo(
    () => epics.filter((epic) => !(epic.startDate && epic.endDate)),
    [epics],
  );

  const range = useMemo(() => {
    if (scheduledEpics.length === 0) {
      return null;
    }

    let min = scheduledEpics[0].startDate;
    let max = scheduledEpics[0].endDate;

    scheduledEpics.forEach((epic) => {
      if (epic.startDate < min) {
        min = epic.startDate;
      }
      if (epic.endDate > max) {
        max = epic.endDate;
      }
    });

    const start = startOfMonth(min);
    const end = endOfMonth(max);
    const totalDays = differenceInCalendarDays(end, start) + 1;
    const months = eachMonthOfInterval({ start, end });

    return { start, end, totalDays, months };
  }, [scheduledEpics]);

  return (
    <div className={styles.wrapper}>
      {range ? (
        <div className={styles.inner}>
          <div className={styles.axis}>
            <div className={styles.labelColumn} />
            <div className={classNames(styles.track, styles.axisTrack)}>
              {range.months.map((month) => {
                const left = (differenceInCalendarDays(month, range.start) / range.totalDays) * 100;

                return (
                  <div
                    key={month.getTime()}
                    className={styles.axisMonth}
                    style={{ left: `${left}%` }}
                  >
                    {format(month, 'MMM yyyy')}
                  </div>
                );
              })}
            </div>
          </div>
          {scheduledEpics.map((epic) => (
            <GanttRow key={epic.id} epic={epic} range={range} onOpen={handleEpicOpen} />
          ))}
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
                className={classNames(
                  styles.rowColor,
                  globalStyles[`background${upperFirst(camelCase(epic.color))}`],
                )}
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

const GanttRow = React.memo(({ epic, range, onOpen }) => {
  const selectEpicProgressById = useMemo(() => selectors.makeSelectEpicProgressById(), []);
  const progress = useSelector((state) => selectEpicProgressById(state, epic.id));

  const handleClick = useCallback(() => {
    onOpen(epic.id);
  }, [epic.id, onOpen]);

  const left = (differenceInCalendarDays(epic.startDate, range.start) / range.totalDays) * 100;
  const width =
    ((differenceInCalendarDays(epic.endDate, epic.startDate) + 1) / range.totalDays) * 100;

  const percent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  return (
    <div className={styles.row}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                   jsx-a11y/no-static-element-interactions */}
      <div className={styles.rowLabel} onClick={handleClick}>
        <span
          className={classNames(
            styles.rowColor,
            globalStyles[`background${upperFirst(camelCase(epic.color))}`],
          )}
        />
        <span className={styles.rowLabelName}>{epic.name || ' '}</span>
      </div>
      <div className={styles.barTrack}>
        {range.months.map((month) => {
          const gridLeft = (differenceInCalendarDays(month, range.start) / range.totalDays) * 100;
          return (
            <div
              key={month.getTime()}
              className={styles.gridLine}
              style={{ left: `${gridLeft}%` }}
            />
          );
        })}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
                                     jsx-a11y/no-static-element-interactions */}
        <div
          className={classNames(
            styles.bar,
            globalStyles[`background${upperFirst(camelCase(epic.color))}`],
          )}
          style={{ left: `${left}%`, width: `${width}%` }}
          title={epic.name || undefined}
          onClick={handleClick}
        >
          {progress.total > 0 && (
            <div className={styles.barFill} style={{ width: `${percent}%` }} />
          )}
        </div>
      </div>
    </div>
  );
});

GanttRow.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  epic: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  range: PropTypes.object.isRequired,
  onOpen: PropTypes.func.isRequired,
};

export default GanttContent;
