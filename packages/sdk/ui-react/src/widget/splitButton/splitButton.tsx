//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import * as React from 'react';

import * as styles from './splitButton.scss';
import { SplitButtonPanel } from './splitButtonPanel/splitButtonPanel';

export interface SplitButtonProps {
  buttonClass?: string;
  defaultLabel?: string;
  disabled?: boolean;
  id?: string;
  onChange?: (newValue: string) => any;
  onClick?: (value: string) => any;
  options?: string[];
  buttonRef?: (ref: HTMLButtonElement) => void;
  selected?: number;
  submenuLabel?: string;
  onDefaultButtonClick?: (value: string) => any;
}

export interface SplitButtonState {
  expanded: boolean;
  selected?: number;
}

const randomId = () => (Math.random() * Number.MAX_SAFE_INTEGER).toString(36);

export class SplitButton extends React.Component<SplitButtonProps, SplitButtonState> {
  private caretRef: HTMLButtonElement;

  constructor(props: SplitButtonProps) {
    super(props);

    this.state = {
      expanded: false,
    };
  }

  componentDidMount() {
    this.onClickOption(0, false);
  }

  public render(): JSX.Element {
    const {
      buttonClass = '',
      defaultLabel = '',
      disabled = false,
      id = randomId(),
      options = [],
      submenuLabel = '',
    } = this.props;
    const { expanded, selected } = this.state;
    const {
      caretRef,
      hidePanel,
      onClickOption,
      onClickDefault,
      onClickCaret,
      onKeyDown,
      setButtonRef,
      setCaretRef,
    } = this;
    const expandedClass = expanded ? ` ${styles.expanded}` : '';
    const paneId = `split-ane-${id}`;
    return (
      <>
        <div className={styles.container}>
          <button
            className={`${styles.defaultButton} ${buttonClass}`}
            disabled={disabled}
            id={id}
            onClick={onClickDefault}
            ref={setButtonRef}
            role={'menuitem'}
          >
            <span>{options[this.state.selected]}</span>
          </button>
          <div className={styles.separator} aria-hidden={'true'} />
          <button
            aria-label={submenuLabel || defaultLabel}
            className={styles.caretButton + expandedClass}
            ref={setCaretRef}
            onClick={onClickCaret}
            aria-expanded={expanded}
            aria-haspopup={true}
            aria-setsize={options.length}
            aria-owns={paneId}
            disabled={disabled}
            role={'menuitem'}
          />
        </div>
        <SplitButtonPanel
          id={paneId}
          expanded={expanded}
          caretRef={caretRef}
          selected={selected}
          hidePanel={hidePanel}
          onClick={onClickOption}
          onKeyDown={onKeyDown}
          options={options}
        />
      </>
    );
  }

  private setButtonRef = (ref: HTMLButtonElement): void => {
    const { buttonRef } = this.props;
    if (buttonRef && ref) {
      buttonRef(ref);
    }
  };

  private setCaretRef = (ref: HTMLButtonElement): void => {
    this.caretRef = ref;
  };

  private onClickCaret = (e: React.SyntheticEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  };

  private onClickDefault = (): void => {
    const { onDefaultButtonClick, options = [] } = this.props;
    if (onDefaultButtonClick && options.length) {
      if (!this.state.selected) {
        onDefaultButtonClick(options[0]);
      } else {
        onDefaultButtonClick(options[this.state.selected]);
      }
    }
  };

  private onClickOption = (index: number, focus = true): void => {
    const { onClick, options = [] } = this.props;
    if (onClick && options.length > 0) {
      const newValue = options[index] || null;
      this.setState({ selected: index });
      onClick(newValue);
    }
    this.hidePanel(focus);
  };

  private hidePanel = (focus = true): void => {
    if (focus) {
      this.caretRef.focus();
    }
    this.setState({ expanded: false });
  };

  private moveSelectionUp = (): void => {
    const { options = [] } = this.props;
    const { selected } = this.state;
    if (options.length && selected > 0) {
      this.setState({ selected: selected - 1 });
    }
  };

  private moveSelectionDown = (): void => {
    const { options = [] } = this.props;
    const { selected } = this.state;
    if (options.length && selected < options.length - 1) {
      this.setState({ selected: selected + 1 });
    }
  };

  private onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>): void => {
    let { key = '' } = e;
    key = key.toLowerCase();

    switch (key) {
      case 'arrowdown':
        this.moveSelectionDown();
        break;

      case 'arrowup':
        this.moveSelectionUp();
        break;

      case 'escape':
        this.hidePanel();
        break;

      case 'enter':
        e.preventDefault();
        this.onClickOption(this.state.selected);
        break;

      case 'tab':
        if (e.shiftKey) {
          // hidePanel() already re-focuses the caret button,
          // so we want to prevent the default behavior which
          // would shift focus to whatever is before the caret button
          e.preventDefault();
        }
        this.hidePanel();
        break;

      default:
        break;
    }
  };
}
