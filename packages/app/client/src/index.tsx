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

import { Provider } from 'react-redux';
import * as ReactDOM from 'react-dom';
import * as React from 'react';

import './commands';
import interceptError from './interceptError';
import interceptHyperlink from './interceptHyperlink';
import Main from './ui/shell/mainContainer';
import { store } from './state/store';
import './ui/styles/globals.scss';

import 'core-js/features/array/find-index';
import 'core-js/features/array/find';
import 'core-js/features/array/from';
import 'core-js/features/array/includes';
import 'core-js/features/array/iterator';
import 'core-js/features/dom-collections';
import 'core-js/features/math/sign';
import 'core-js/features/number/is-finite';
import 'core-js/features/object/assign';
import 'core-js/features/object/entries';
import 'core-js/features/object/from-entries';
import 'core-js/features/object/is';
import 'core-js/features/object/values';
import 'core-js/features/promise';
import 'core-js/features/promise/finally';
import 'core-js/features/set';
import 'core-js/features/string/ends-with';
import 'core-js/features/string/starts-with';
import 'core-js/features/symbol';

interceptError();
interceptHyperlink();

// Start rendering the UI
ReactDOM.render(
  React.createElement(Provider, { store }, React.createElement(Main as any)),
  document.getElementById('root')
);

if (module.hasOwnProperty('hot')) {
  (module as any).hot.accept();
}
