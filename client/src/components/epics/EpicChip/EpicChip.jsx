/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import { getEpicColorClassName, getEpicColorStyle } from '../../../utils/epic-color';

import styles from './EpicChip.module.scss';

const Sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
};

const EpicChip = React.memo(({ id, size, onClick }) => {
  const selectEpicById = useMemo(() => selectors.makeSelectEpicById(), []);

  const epic = useSelector((state) => selectEpicById(state, id));

  if (!epic) {
    return null;
  }

  const contentNode = (
    <span
      title={epic.name || undefined}
      style={getEpicColorStyle(epic.color)}
      className={classNames(
        styles.wrapper,
        styles[`wrapper${upperFirst(size)}`],
        onClick && styles.wrapperHoverable,
        getEpicColorClassName(epic.color),
      )}
    >
      <Icon name="bookmark" className={styles.icon} />
      {epic.name || ' '}
    </span>
  );

  return onClick ? (
    <button data-id={id} type="button" className={styles.button} onClick={onClick}>
      {contentNode}
    </button>
  ) : (
    contentNode
  );
});

EpicChip.propTypes = {
  id: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.values(Sizes)),
  onClick: PropTypes.func,
};

EpicChip.defaultProps = {
  size: Sizes.MEDIUM,
  onClick: undefined,
};

export default EpicChip;
