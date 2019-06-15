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
import { Component } from 'react';

import * as styles from './EntityViewer.scss';

const InstanceKey = '$instance';

export interface EntityInfo {
  name: string;
  value: any;
}

export interface EntityViewerProps {
  entity: any;
}

export class EntityViewer extends Component<EntityViewerProps, {}> {
  public static renderEntityValueObject(entityValue: object): string {
    if (InstanceKey in entityValue) {
      delete entityValue[InstanceKey];
    }
    return JSON.stringify(entityValue);
  }

  public static renderEntityValue(entityValue: any): string {
    if (Array.isArray(entityValue)) {
      entityValue = EntityViewer.flattenEntityValue(entityValue);
    }

    if (Array.isArray(entityValue)) {
      if (typeof entityValue[0] === 'object') {
        entityValue = entityValue.map(ev => EntityViewer.renderEntityValueObject(ev));
      }
      return entityValue.join(', ');
    }

    if (typeof entityValue === 'object') {
      return EntityViewer.renderEntityValueObject(entityValue);
    }

    // primitive
    return entityValue;
  }

  public static flattenEntityValue(entityValueArr: any[]) {
    return [].concat.apply([], entityValueArr);
  }

  constructor(props: any, context: any) {
    super(props, context);
    this.state = {};
  }

  public render() {
    return (
      <div className={styles.entityViewer}>
        <div id="entityName">{this.props.entity.name}</div>
        <div id="arrow">&nbsp;{'-->'}&nbsp;</div>
        <div id="entityValue">{EntityViewer.renderEntityValue(this.props.entity.value)}</div>
      </div>
    );
  }
}
