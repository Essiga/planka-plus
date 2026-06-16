/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon } from 'semantic-ui-react';
import { Popup } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import EpicChip from '../EpicChip';

import styles from './EpicsFilterStep.module.scss';

const EpicsFilterStep = React.memo(({ currentIds, title, onSelect, onDeselect }) => {
  const epics = useSelector(selectors.selectEpicsForCurrentBoard);

  const [t] = useTranslation();

  const handleToggle = useCallback(
    (id) => {
      if (currentIds.includes(id)) {
        onDeselect(id);
      } else {
        onSelect(id);
      }
    },
    [currentIds, onSelect, onDeselect],
  );

  return (
    <>
      <Popup.Header>{t(title, { defaultValue: 'Filter by epic' })}</Popup.Header>
      <Popup.Content>
        {epics.length === 0 ? (
          <div className={styles.empty}>
            {t('common.noEpics', { defaultValue: 'No epics yet' })}
          </div>
        ) : (
          <div className={styles.items}>
            {epics.map((epic) => {
              const isSelected = currentIds.includes(epic.id);

              return (
                <button
                  key={epic.id}
                  type="button"
                  className={classNames(styles.item, isSelected && styles.itemSelected)}
                  onClick={() => handleToggle(epic.id)}
                >
                  <EpicChip id={epic.id} size="small" />
                  {isSelected && <Icon fitted name="check" className={styles.checkIcon} />}
                </button>
              );
            })}
          </div>
        )}
      </Popup.Content>
    </>
  );
});

EpicsFilterStep.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  currentIds: PropTypes.array.isRequired,
  title: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
};

EpicsFilterStep.defaultProps = {
  title: 'common.filterByEpics',
};

export default EpicsFilterStep;
