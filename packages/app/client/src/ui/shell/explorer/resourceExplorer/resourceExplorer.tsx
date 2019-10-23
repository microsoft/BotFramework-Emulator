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
import { IFileService } from 'botframework-config/lib/schema';
import * as React from 'react';
import { ChangeEvent, ComponentClass, KeyboardEvent, MouseEvent } from 'react';
import { LinkButton } from '@bfemulator/ui-react';

import { ResourcesSettingsContainer } from '../../../dialogs';
import { ServicePane, ServicePaneProps, ServicePaneState } from '../servicePane/servicePane';

import * as styles from './resourceExplorer.scss';

function simpleNameSort(a: IFileService, b: IFileService): 0 | 1 | -1 {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

export interface ResourceExplorerState extends ServicePaneState {
  modifiedFileName: string;
}

export interface ResourceExplorerProps extends ServicePaneProps, ResourceExplorerState {
  files?: IFileService[];
  fileToRename?: IFileService;
  renameResource: (resource: IFileService) => void;
  openResource: (resource: IFileService) => void;
  resourcesPath?: string;
  openResourcesSettings?: (dialog: ComponentClass<any>) => void;
}

export class ResourceExplorer extends ServicePane<ResourceExplorerProps, ResourceExplorerState> {
  constructor(props: ResourceExplorerProps, context: ResourceExplorerState) {
    super(props, context);
    this.state = {
      modifiedFileName: '',
    };
  }

  protected get controls(): JSX.Element {
    return null;
  }

  protected get links() {
    const { files = [] } = this.props;
    const fileToRename = this.fileToRename || { id: '', name: '' };

    return files.sort(simpleNameSort).map((file, index) => {
      const mutable = fileToRename.id === file.id;
      if (!mutable) {
        return (
          <li
            className={styles.link}
            data-index={index}
            key={`file_${index}`}
            onClick={this.onLinkClick}
            onKeyPress={this.onLinkKeyPress}
            tabIndex={0}
            title={file.path}
          >
            {file.name}
          </li>
        );
      }

      return (
        <li key={`file_${index}`} className={styles.link}>
          <input
            defaultValue={fileToRename.name}
            onChange={this.onInputChange}
            onBlur={this.onInputBlur}
            onKeyUp={this.onInputKeyUp}
            type="text"
            ref={this.editableInputRef}
          />
        </li>
      );
    });
  }

  protected onLinkKeyPress = (e): void => {
    if (e.key === 'Enter') {
      this.onLinkClick(e);
    }
  };

  protected onLinkClick = (event: MouseEvent<HTMLLIElement>) => {
    const { currentTarget } = event;
    const { index } = currentTarget.dataset;
    const { [index]: fileService } = this.props.files;
    this.props.openResource(fileService);
  };

  protected onSortClick = () => {
    // unimplemented as of now
  };

  protected onContextMenuOverLiElement(li: HTMLLIElement): void {
    super.onContextMenuOverLiElement(li);
    const { index } = li.dataset;
    const { [index]: fileService } = this.props.files;
    this.props.openContextMenuForService(fileService);
  }

  protected get emptyContent(): JSX.Element {
    return (
      <>
        <p className={styles.emptyContent}>
          You do not have any {this.props.title} in <strong>{this.props.resourcesPath}.</strong>
        </p>
        {this.additionalContent}
      </>
    );
  }

  protected get additionalContent(): JSX.Element {
    return (
      <p className={styles.emptyContent}>
        <LinkButton
          ariaLabel="Choose a different location."
          className={styles.explorerLink}
          onClick={this.onChooseLocationClick}
        >
          <strong>Choose a different location.</strong>
        </LinkButton>
      </p>
    );
  }

  private onChooseLocationClick = () => {
    this.props.openResourcesSettings(ResourcesSettingsContainer);
  };

  private onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ modifiedFileName: event.target.value });
  };

  private onInputBlur = (): void => {
    this.props.renameResource(this.fileToRename);
  };

  private onInputKeyUp = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') {
      return;
    }
    this.props.renameResource(this.fileToRename);
  };

  private editableInputRef = (ref: HTMLInputElement): void => {
    if (ref) {
      requestAnimationFrame(() => {
        const { value } = ref;
        const lastDotIndex = (value || '').lastIndexOf('.');
        ref.focus();
        ref.setSelectionRange(0, lastDotIndex);
      });
    }
  };

  private get fileToRename(): IFileService {
    const { fileToRename } = this.props;
    if (this.state.modifiedFileName) {
      return { ...fileToRename, name: this.state.modifiedFileName };
    }
    return fileToRename;
  }
}
