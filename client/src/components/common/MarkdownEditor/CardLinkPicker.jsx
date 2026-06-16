/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Icon, Input } from 'semantic-ui-react';

import selectors from '../../../selectors';

import styles from './CardLinkPicker.module.scss';

const MAX_RESULTS = 50;

const CardLinkPicker = React.memo(({ onSelect, onClose }) => {
  const cards = useSelector(selectors.selectCardsForCurrentBoard);

  const [t] = useTranslation();
  const [search, setSearch] = useState('');

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const filteredCards = useMemo(() => {
    const query = search.trim().toLowerCase();

    const matched = query
      ? cards.filter((card) => (card.name || '').toLowerCase().includes(query))
      : cards;

    return matched.slice(0, MAX_RESULTS);
  }, [cards, search]);

  const handleSearchChange = useCallback((_, { value }) => {
    setSearch(value);
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    },
    [onClose],
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className={styles.wrapper} onKeyDown={handleKeyDown}>
      <div className={styles.header}>
        <span className={styles.title}>{t('common.linkCard', { defaultValue: 'Link card' })}</span>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          <Icon fitted name="close" />
        </button>
      </div>
      <Input
        ref={inputRef}
        fluid
        icon="search"
        iconPosition="left"
        value={search}
        placeholder={t('common.searchCards', { defaultValue: 'Search cards' })}
        className={styles.search}
        onChange={handleSearchChange}
      />
      <div className={styles.list}>
        {filteredCards.length === 0 ? (
          <div className={styles.empty}>{t('common.noCards', { defaultValue: 'No cards' })}</div>
        ) : (
          filteredCards.map((card) => (
            <button
              key={card.id}
              type="button"
              className={styles.item}
              onClick={() => onSelect(card)}
            >
              <Icon name="file outline" className={styles.itemIcon} />
              <span className={styles.itemName}>
                {card.name || t('common.noName', { defaultValue: 'No name' })}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
});

CardLinkPicker.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CardLinkPicker;
