/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';

import globalStyles from '../styles.module.scss';

// Epic colors can be either a named palette color (mapped to a global background
// class) or a custom hex value (rendered via an inline background style).
export const isHexColor = (color) => typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color);

export const getEpicColorClassName = (color) =>
  isHexColor(color) ? null : globalStyles[`background${upperFirst(camelCase(color))}`];

export const getEpicColorStyle = (color) => (isHexColor(color) ? { background: color } : undefined);
