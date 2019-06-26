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

import { EntityInfo, EntityViewer } from '../EntityViewer/EntityViewer';

import * as styles from './EntitiesViewer.scss';

const INSTANCE_KEY = '$instance';

interface EntitiesViewerProps {
  entities: any;
}

export class EntitiesViewer extends Component<EntitiesViewerProps, {}> {
  public render() {
    let entities: any[];
    const filteredEntityKeys = Object.keys(this.props.entities || {}).filter(entityKey => {
      return entityKey !== INSTANCE_KEY;
    });
    if (filteredEntityKeys.length > 0) {
      entities = filteredEntityKeys.map(entityKey => {
        const entity: EntityInfo = {
          name: entityKey,
          value: this.props.entities[entityKey],
        };
        return <EntityViewer key={entityKey} entity={entity} />;
      });
    } else {
      entities = [<span key="no-entities">No Entities</span>];
    }
    return (
      <div className={styles.entitiesViewer}>
        <div id="header">Entities</div>
        <div id="entities">{entities}</div>
      </div>
    );
  }
}
