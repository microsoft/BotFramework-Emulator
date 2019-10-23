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
import { ChangeEvent, Component, KeyboardEvent, MouseEvent, ReactNode } from 'react';

import * as styles from './autoComplete.scss';

export interface AutoCompleteProps {
  autoFocus?: boolean;
  className?: string;
  disabled?: boolean;
  errorMessage?: string;
  items?: string[];
  label?: string;
  onChange?: (updatedValue: string) => void;
  placeholder?: string;
  value?: string; // use only for a "controlled input" experience
}

export interface AutoCompleteState {
  currentInput: string;
  id: string;
  selectedIndex: number;
  showResults: boolean;
}

export class AutoComplete extends Component<AutoCompleteProps, AutoCompleteState> {
  private static idCount = 0;

  constructor(props: AutoCompleteProps) {
    super(props);

    this.state = {
      currentInput: '',
      id: AutoComplete.getId(),
      selectedIndex: undefined,
      showResults: false,
    };
  }

  private static getId(): string {
    return `${this.idCount++}`;
  }

  public render(): ReactNode {
    const { errorMessageId, onBlur, onChange, onFocus, onKeyDown, value } = this;
    const { autoFocus, className = '', errorMessage, disabled, placeholder } = this.props;
    const invalidClassName = errorMessage ? styles.invalid : '';

    return (
      <div
        className={`${styles.autoCompleteContainer} ${invalidClassName} ${className}`}
        id={this.textboxId}
        role="combobox"
        aria-expanded={this.state.showResults}
        aria-haspopup="listbox"
        aria-owns={this.listboxId}
      >
        {this.label}
        <input
          autoFocus={autoFocus}
          disabled={disabled}
          id={this.textboxId}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          type="text"
          value={value}
          aria-activedescendant={this.getOptionId(this.state.selectedIndex)}
          aria-autocomplete="list"
          aria-controls={this.listboxId}
          aria-labelledby={errorMessageId}
        />
        {this.errorMessage}
        {this.results}
      </div>
    );
  }

  private get results(): ReactNode {
    if (this.state.showResults) {
      const results = this.filteredItems.map((result, index) => (
        <li
          className={`${index === this.state.selectedIndex ? styles.selected : ''}`}
          id={this.getOptionId(index)}
          key={result}
          onMouseDown={ev => this.onSelectResult(ev, result)}
          role="option"
          aria-selected={index === this.state.selectedIndex}
        >
          {result}
        </li>
      ));

      return (
        <ul role="listbox" aria-labelledby={this.labelId}>
          {results}
        </ul>
      );
    }
    return undefined;
  }

  private get label(): ReactNode {
    const { label } = this.props;
    if (label) {
      return (
        <label id={this.labelId} htmlFor={this.textboxId}>
          {label}
        </label>
      );
    }
    return undefined;
  }

  private get errorMessage(): ReactNode {
    const { errorMessage } = this.props;
    if (errorMessage) {
      return (
        <sub id={this.errorMessageId} className={styles.errorMessage}>
          {errorMessage}
        </sub>
      );
    }
    return undefined;
  }

  private get errorMessageId(): string {
    return this.props.errorMessage ? `auto-complete-err-msg-${this.state.id}` : undefined;
  }

  private get labelId(): string {
    // label id is only necessary if we have a label
    return this.props.label ? `auto-complete-label-${this.state.id}` : undefined;
  }

  private get listboxId(): string {
    return `auto-complete-listbox-${this.state.id}`;
  }

  private get textboxId(): string {
    // textbox id is only necessary if we have a label
    return this.props.label ? `auto-complete-textbox-${this.state.id}` : undefined;
  }

  private get filteredItems(): string[] {
    const unfilteredItems = this.props.items || [];
    const filteredItems = unfilteredItems.filter(item => this.fuzzysearch(this.value, item));

    return filteredItems;
  }

  private get value(): string {
    // if in 'controlled mode,' an empty string should be a valid input
    if (this.props.value === '') {
      return this.props.value;
    }
    return this.props.value || this.state.currentInput;
  }

  private getOptionId(index: number): string {
    return `auto-complete-option-${this.state.id}-${index}`;
  }

  private onSelectResult = (ev: MouseEvent<HTMLLIElement>, result: string) => {
    // stop the mousedown from firing a focus event on the <li> because
    // we are going to dismiss the results list and want focus to remain on the input
    ev.preventDefault();
    if (this.props.onChange) {
      this.props.onChange(result);
    }
    this.setState({ currentInput: result, showResults: false });
  };

  private onFocus = () => {
    if (!this.state.showResults) {
      this.setState({ showResults: true });
    }
  };

  private onBlur = () => {
    if (this.state.showResults) {
      this.setState({ showResults: false });
    }
  };

  private onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const currentInput = value;
    if (this.props.onChange && typeof this.props.onChange === 'function') {
      this.props.onChange(currentInput);
    }
    this.setState({ currentInput, showResults: true });
  };

  // keyboard support from https://www.w3.org/TR/wai-aria-practices-1.1/examples/combobox/aria1.1pattern/listbox-combo.html
  private onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!this.state.showResults) {
      return;
    }
    switch (event.key) {
      // moves focus to previous item, or to last item if on first item
      case 'ArrowUp': {
        const { selectedIndex } = this.state;
        const items = this.filteredItems;
        let newIndex;
        if (selectedIndex === undefined || selectedIndex === 0) {
          newIndex = items.length - 1;
        } else {
          newIndex = this.state.selectedIndex - 1;
        }
        this.setState({ selectedIndex: newIndex });
        break;
      }

      // moves focus to next item, or to first item if on last item
      case 'ArrowDown': {
        const { selectedIndex } = this.state;
        const items = this.filteredItems;
        let newIndex;
        if (selectedIndex === undefined || selectedIndex === items.length - 1) {
          newIndex = 0;
        } else {
          newIndex = this.state.selectedIndex + 1;
        }
        this.setState({ selectedIndex: newIndex });
        break;
      }

      // sets the value to currently focused item and closes the listbox
      case 'Enter': {
        if (!this.filteredItems.length) {
          this.setState({ showResults: false });
          return;
        }
        event.preventDefault();
        const currentInput = this.filteredItems[this.state.selectedIndex] || this.value;
        if (this.props.onChange && typeof this.props.onChange === 'function') {
          this.props.onChange(currentInput);
        }
        this.setState({ currentInput, selectedIndex: undefined, showResults: false });
        break;
      }

      // clears the textbox, selection, and closes the listbox
      case 'Escape': {
        event.preventDefault();
        event.stopPropagation();
        const currentInput = '';
        if (this.props.onChange && typeof this.props.onChange === 'function') {
          this.props.onChange(currentInput);
        }
        this.setState({ currentInput, selectedIndex: undefined, showResults: false });
        break;
      }

      default:
        break;
    }
  };

  // The MIT License (MIT)

  // Copyright © 2015 Nicolas Bevacqua

  // Permission is hereby granted, free of charge, to any person obtaining a copy of
  // this software and associated documentation files (the "Software"), to deal in
  // the Software without restriction, including without limitation the rights to
  // use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
  // the Software, and to permit persons to whom the Software is furnished to do so,
  // subject to the following conditions:

  // The above copyright notice and this permission notice shall be included in all
  // copies or substantial portions of the Software.

  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
  // FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  // COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
  // IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  // CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

  // from https://github.com/bevacqua/fuzzysearch
  private fuzzysearch(needle: string, haystack: string) {
    needle = needle.trim().toLowerCase();
    haystack = haystack.trim().toLowerCase();
    var hlen = haystack.length;
    var nlen = needle.length;
    if (nlen > hlen) {
      return false;
    }
    if (nlen === hlen) {
      return needle === haystack;
    }
    outer: for (var i = 0, j = 0; i < nlen; i++) {
      var nch = needle.charCodeAt(i);
      while (j < hlen) {
        if (haystack.charCodeAt(j++) === nch) {
          continue outer;
        }
      }
      return false;
    }
    return true;
  }
}
