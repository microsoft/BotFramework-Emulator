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
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTIONb
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import * as React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { navBar } from '../../../data/reducer/navBar';
import { ClientCertSelectDialog } from './clientCertSelectDialog';
import { ClientCertSelectDialogContainer } from './clientCertSelectDialogContainer';
import { mount } from 'enzyme';
import { DialogService } from '../service';

jest.mock('./clientCertSelectDialog.scss', () => ({}));
jest.mock('../dialogStyles.scss', () => ({}));

jest.mock('../../dialogs/', () => ({
    intializeIcons: () => undefined
  }));

describe('ClientCertSelectDialogContainer component should', () => {
    let wrapper;

    // let child;
    beforeEach(() => {
        const mockCerts = [
            'cert1',
            'cert2',
            'cert3'
        ] as any;

        wrapper = mount(
            <Provider store={ createStore(navBar) } >
                <ClientCertSelectDialogContainer certs={ mockCerts }/>
            </Provider>
        );
    });

    it('render without error', () => {
        expect(wrapper.find(ClientCertSelectDialog)).not.toBe(null);
    });

    it('contain a dismiss function in the props', () => {
        const prompt = wrapper.find(ClientCertSelectDialog);
        expect( typeof(prompt.props() as any).dismiss).toBe('function');
    });

    it('update state when a certificate is clicked', () => {
        const dialogComponent = wrapper.find(ClientCertSelectDialog);
        expect('selectedIndex' in dialogComponent.state);
        const selectedIndex = dialogComponent.state('selectedIndex');
        expect(selectedIndex).toBe(-1);
        const node = dialogComponent.instance();

        const mockEvent: any = {
            currentTarget: {
                dataset: {
                    index: 0 // clicked on first cert
                }
            }
        };
        node.onCertListItemClick(mockEvent);
        expect(node.state.selectedIndex).toBe(0);
    });

    it('select a certificate on dismiss', () => {
        const dialogComponent = wrapper.find(ClientCertSelectDialog);
        const node = dialogComponent.instance();

        const mockEvent: any = {
            currentTarget: {
                dataset: {
                    index: 2 // clicked on cert
                }
            }
        };
        node.onCertListItemClick(mockEvent);
        const spy = jest.spyOn(DialogService, 'hideDialog');
        node.onDismissClick();
        expect(spy).toHaveBeenCalledWith('cert3');
    });
});