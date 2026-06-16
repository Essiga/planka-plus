/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  useMarkdownEditor,
  wysiwygToolbarConfigs,
  MarkdownEditorView,
} from '@gravity-ui/markdown-editor';
/* eslint-disable import/no-unresolved */
import { full as toolbarsPreset } from '@gravity-ui/markdown-editor/_/modules/toolbars/presets';
import { ActionName } from '@gravity-ui/markdown-editor/_/bundle/config/action-names';
/* eslint-enable import/no-unresolved */
import { useTranslation } from 'react-i18next';

import { EditorModes } from '../../../constants/Enums';
import Paths from '../../../constants/Paths';
import CardLinkPicker from './CardLinkPicker';

import styles from './MarkdownEditor.module.scss';

// Icon shown for the "/link-card" command-menu entry (gravity-ui Icon accepts an SVG component)
function LinkCardIcon(props) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" {...props}>
      <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v4a.75.75 0 0 1-1.5 0v-4a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h4a.75.75 0 0 1 0 1.5h-4A2.5 2.5 0 0 1 2 11.5v-7Z" />
      <path d="M8.5 11.5a2 2 0 0 1 2-2h1a2 2 0 1 1 0 4h-1a.6.6 0 0 1 0-1.2h1a.8.8 0 0 0 0-1.6h-1a.8.8 0 0 0-.8.8.6.6 0 0 1-1.2 0Zm3.8-.6h1a.8.8 0 0 0 0-1.6h-1a.6.6 0 0 1 0-1.2Z" />
      <path d="M10.25 11.5a.6.6 0 0 1 .6-.6h2.3a.6.6 0 0 1 0 1.2h-2.3a.6.6 0 0 1-.6-.6Z" />
    </svg>
  );
}

const removedActionNamesSet = new Set([
  ActionName.checkbox,
  ActionName.file,
  ActionName.filePopup,
  ActionName.tabs,
]);

removedActionNamesSet.forEach((actionName) => {
  delete toolbarsPreset.items[actionName];

  Object.entries(toolbarsPreset.orders).forEach(([orderName, order]) => {
    order.forEach((actions, actionsIndex) => {
      toolbarsPreset.orders[orderName][actionsIndex] = actions.filter(
        (action) => action.id || action !== actionName,
      );
    });
  });
});

const commandMenuActions = wysiwygToolbarConfigs.wCommandMenuConfig.filter(
  (action) => !removedActionNamesSet.has(action.id),
);

export const fileToBase64Data = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const fileUploadHandler = async (file) => {
  const base64Data = await fileToBase64Data(file);
  return { url: base64Data };
};

const MarkdownEditor = React.forwardRef(
  (
    { defaultValue, defaultMode, isError, onChange, onSubmit, onCancel, onModeChange, ...props },
    ref,
  ) => {
    const [t] = useTranslation();

    const wrapperRef = useRef(null);
    const actionStorageRef = useRef(null);

    const [isCardPickerOpened, setIsCardPickerOpened] = useState(false);

    const commandMenuActionsWithCardLink = useMemo(
      () => [
        ...commandMenuActions,
        {
          id: 'link-card',
          title: () => t('action.linkCard', { defaultValue: 'Link card' }),
          aliases: ['link-card', 'card', 'link card'],
          hint: () =>
            t('common.linkCardHint', { defaultValue: 'Insert a link to a card on this board' }),
          icon: { data: LinkCardIcon },
          isEnable: () => true,
          isActive: () => false,
          exec: (actionStorage) => {
            actionStorageRef.current = actionStorage;
            setIsCardPickerOpened(true);
          },
        },
      ],
      [t],
    );

    const handleWrapperRef = useCallback(
      (element) => {
        wrapperRef.current = element;

        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element; // eslint-disable-line no-param-reassign
        }
      },
      [ref],
    );

    const editor = useMarkdownEditor({
      md: {
        breaks: true,
        linkify: true,
        linkifyTlds: null,
      },
      handlers: {
        uploadFile: fileUploadHandler,
      },
      wysiwygConfig: {
        extensionOptions: {
          commandMenu: {
            actions: commandMenuActionsWithCardLink,
          },
        },
        searchPanel: false, // TODO: cancel event does not fire when enabled
      },
      // TODO: remove once both search panels are enabled and locales are synced
      markupConfig: {
        searchPanel: false,
      },
      initial: {
        markup: defaultValue,
        mode: defaultMode,
      },
    });

    useEffect(() => {
      const handleChange = () => {
        onChange(editor.getValue());
      };

      const handleSubmit = () => {
        onSubmit();
      };

      const handleCancel = () => {
        onCancel();
      };

      const handleModeChange = ({ mode: nextMode }) => {
        if (onModeChange) {
          onModeChange(nextMode);
        }
      };

      editor.on('change', handleChange);
      editor.on('submit', handleSubmit);
      editor.on('cancel', handleCancel);
      editor.on('change-editor-mode', handleModeChange);

      return () => {
        editor.off('change', handleChange);
        editor.off('submit', handleSubmit);
        editor.off('cancel', handleCancel);
        editor.off('change-editor-mode', handleModeChange);
      };
    }, [onChange, onSubmit, onCancel, onModeChange, editor]);

    useEffect(() => {
      const { current: wrapperElement } = wrapperRef;

      const handlePaste = (event) => {
        event.stopPropagation();
      };

      wrapperElement.addEventListener('paste', handlePaste);

      return () => {
        wrapperElement.removeEventListener('paste', handlePaste);
      };
    }, []);

    const handleCardLinkSelect = useCallback(
      (card) => {
        setIsCardPickerOpened(false);

        // Guard against future editor versions changing/removing this internal action,
        // so a broken upgrade degrades to a no-op instead of throwing.
        const linkAction = actionStorageRef.current?.actions?.link;
        if (linkAction) {
          const href = Paths.CARDS.replace(':id', card.id);
          const text = card.name || t('common.noName', { defaultValue: 'No name' });

          linkAction.run({ href, text });
        }

        editor.focus();
      },
      [editor, t],
    );

    const handleCardLinkClose = useCallback(() => {
      setIsCardPickerOpened(false);
      editor.focus();
    }, [editor]);

    return (
      <div
        {...props} // eslint-disable-line react/jsx-props-no-spreading
        ref={handleWrapperRef}
        className={classNames(styles.wrapper, isError && styles.wrapperError)}
      >
        <MarkdownEditorView
          autofocus
          stickyToolbar
          editor={editor}
          toolbarsPreset={toolbarsPreset}
          className={styles.editor}
        />
        {isCardPickerOpened && (
          <CardLinkPicker onSelect={handleCardLinkSelect} onClose={handleCardLinkClose} />
        )}
      </div>
    );
  },
);

MarkdownEditor.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  defaultMode: PropTypes.oneOf(Object.values(EditorModes)),
  isError: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onModeChange: PropTypes.func,
};

MarkdownEditor.defaultProps = {
  defaultMode: EditorModes.WYSIWYG,
  isError: false,
  onModeChange: undefined,
};

export default React.memo(MarkdownEditor);
