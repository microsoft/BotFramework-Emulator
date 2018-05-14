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

import { merge } from 'glamor';
import * as React from 'react';
import { Component, SyntheticEvent } from 'react';
import { Colors, Fonts } from '../styles';
import { filterChildren } from '../utils';

export interface ModalProps {
  title?: string;
  cssOverrides?: {};
  closeButtonCssOverrides?: {};
  detailedDescription?: string;
  cancel: (event: SyntheticEvent<HTMLButtonElement>) => void
}

export class Modal extends Component<ModalProps, {}> {

  constructor(props, context) {
    super(props, context);
  }

  public render(): JSX.Element {
    const { cssOverrides = {}, children, detailedDescription = '' } = this.props;
    return (
      <section { ...merge(this.modalCss, cssOverrides) }>
        { this.sectionHeader }
        <div className="modalContentContainer">
          <p>{ detailedDescription }</p>
          { filterChildren(children, child => child.type === ModalContent) }
        </div>
        <div className="buttonGroup">
          { filterChildren(children, child => child.type === ModalActions) }
        </div>
      </section>
    );
  }

  protected get sectionHeader(): JSX.Element {
    const { closeButtonCssOverrides = {}, title = '', cancel } = this.props;
    return (
      <header>
        <button tabIndex={ 0 } { ...merge(this.closeButtonCss, closeButtonCssOverrides) } onClick={ cancel }>
          <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='1 1 16 16'>
            <g>
              <polygon points="14.1015625 2.6015625 8.7109375 8 14.1015625 13.3984375 13.3984375 14.1015625 8 8.7109375 2.6015625 14.1015625 1.8984375 13.3984375 7.2890625 8 1.8984375 2.6015625 2.6015625 1.8984375 8 7.2890625 13.3984375 1.8984375"/>
            </g>
          </svg>
        </button>
        <h3>{ title }</h3>
      </header>
    );
  }

  protected get modalCss(): {} {
    return {
      boxSizing: 'border-box',
      color: '#333',
      background: '#f4f4f4',
      position: 'relative',

      '> header': {
        '> h3': {
          fontFamily: Fonts.FONT_FAMILY_DEFAULT,
          fontSize: '19px',
          fontWeight: 200,
          margin: 0,
          padding: '28px 24px 24px'
        }
      },

      '& .modalContentContainer': {
        padding: '0 24px',

        '> p': {
          fontSize: '13px',
          margin: '0',
          paddingBottom: '20px'
        },

        ' > ul': {
          listStyle: 'none',
          margin: 0,
          padding: '5px 0 0 0',
          maxHeight: '96px',
          overflow: 'auto',

          '> li': {
            padding: '1px 11px',
            backgroundColor: '#efefef',
            display: 'flex',

            '& span': {
              color: '#777',
              width: '100%',

              '&:last-child': {
                textAlign: 'right',
                width: '75%',
                paddingRight: '9px'
              }
            },

            '&:nth-child(odd)': {
              backgroundColor: 'white'
            },
          }
        }
      },

      '& .buttonGroup': {
        position: 'absolute',
        right: '24px',
        bottom: '32px',

        '> button + button': {
          marginLeft: '8px'
        }
      },

      '& .selectAll': {
        padding: '5px 11px',
      },

      '& .checkboxOverride': {
        display: 'inline-block',
        width: '150px',

        '> label': {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '130px',
          display: 'inline-block'
        }
      }
    };
  }

  protected get closeButtonCss(): {} {
    return {
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      margin: 0,
      padding: 0,
      position: 'absolute',
      right: '12px',
      top: '12px',
      width: '16px',
      height: '16px',

      '&:focus': {
        outline: `1px dashed ${Colors.C2}`
      },

      '> svg': {
        fill: Colors.C3,

        '&:hover': {
          fill: Colors.C12
        }
      }
    };
  }
}

export const ModalContent = props => props.children;
export const ModalActions = props => props.children;
