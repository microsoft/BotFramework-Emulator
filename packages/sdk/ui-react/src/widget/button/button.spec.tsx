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

import { DefaultButton } from './defaultButton';
import { LinkButton } from './linkButton';
import { PrimaryButton } from './primaryButton';

describe('The DefaultButton component', () => {
  let parent;
  let node;
  beforeEach(() => {
    parent = mount(<DefaultButton>Learn more</DefaultButton>);
    node = parent.find(DefaultButton);
  });

  it('should render without any errors', () => {
    expect(node.html()).not.toBeFalsy();
  });

  it('should have an role property', () => {
    expect(typeof (node.props() as any).role).not.toBeFalsy();
  });

  it('should have an buttonRef property', () => {
    expect(typeof (node.props() as any).buttonRef).not.toBeFalsy();
  });
});

describe('The PrimaryButton component', () => {
  let parent;
  let node;
  beforeEach(() => {
    parent = mount(<PrimaryButton>Learn more</PrimaryButton>);
    node = parent.find(PrimaryButton);
  });

  it('should render without any errors', () => {
    expect(node.html()).not.toBeFalsy();
  });

  it('should have an role property', () => {
    expect(typeof (node.props() as any).role).not.toBeFalsy();
  });

  it('should have an buttonRef property', () => {
    expect(typeof (node.props() as any).buttonRef).not.toBeFalsy();
  });
});

describe('The LinkButton component', () => {
  let parent;
  let node;
  beforeEach(() => {
    parent = mount(<LinkButton ariaLabel="Learn more">Learn more</LinkButton>);
    node = parent.find(LinkButton);
  });

  it('should render without any errors', () => {
    expect(node.html()).not.toBeFalsy();
  });

  it('should have an ariaLabel property', () => {
    expect(typeof (node.props() as any).ariaLabel).not.toBeFalsy();
  });

  it('should have an role property', () => {
    expect(typeof (node.props() as any).role).not.toBeFalsy();
  });

  it('should have an buttonRef property', () => {
    expect(typeof (node.props() as any).buttonRef).not.toBeFalsy();
  });
});

describe('The empty LinkButton component', () => {
  it('should not render due to errors', () => {
    expect(() => mount(<LinkButton></LinkButton>)).toThrowError('<LinkButton must have aria-label');
  });
});
