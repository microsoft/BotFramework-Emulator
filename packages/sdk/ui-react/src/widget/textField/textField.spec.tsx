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
import { mount } from 'enzyme';

import { TextField } from './textField';

describe('<TextField /> Component', () => {
  it('should render without any errors', () => {
    const wrapper = mount(<TextField />);
    const node = wrapper.find(TextField);
    expect(node.html()).not.toBeFalsy();
  });

  it('should call the inputRef prop to set the ref', () => {
    const mockInputRef = jest.fn(() => null);
    const wrapper = mount(<TextField inputRef={mockInputRef} />);
    const instance: any = wrapper.instance();
    const mockRef = {};
    instance.setInputRef({});

    expect(mockInputRef).toHaveBeenCalledWith(mockRef);
  });

  it('should return a label node if there is a label', () => {
    const wrapper = mount(<TextField label={'I am a label'} />);
    const instance: any = wrapper.instance();
    const labelNode = instance.labelNode;

    expect(labelNode).toBeTruthy();
  });

  it('should not return a label node if there is no label', () => {
    const wrapper = mount(<TextField label={undefined} />);
    const instance: any = wrapper.instance();
    const labelNode = instance.labelNode;

    expect(labelNode).toBeNull();
  });

  it('should return an error node if there is an error', () => {
    const wrapper = mount(<TextField errorMessage={'I am an error'} />);
    const instance: any = wrapper.instance();
    const errorNode = instance.errorNode;

    expect(errorNode).toBeTruthy();
  });

  it('should not return an error node if there is no error node', () => {
    const wrapper = mount(<TextField errorMessage={undefined} />);
    const instance: any = wrapper.instance();
    const errorNode = instance.errorNode;

    expect(errorNode).toBeNull();
  });
});
