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
export function json2HTML(obj: { [key: string]: any }, isDiff: boolean = false): string {
  if (!obj) {
    return null;
  }
  let json = JSON.stringify(obj, null, 2);
  // Hide ampersands we don't want replaced
  json = json.replace(/&(amp|apos|copy|gt|lt|nbsp|quot|#x?\d+|[\w\d]+);/g, '\x01');
  // Escape remaining ampersands and other HTML special characters
  json = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // Restore hidden ampersands
  // eslint-disable-next-line no-control-regex
  json = json.replace(/\x01/g, '&');
  // Match all the JSON parts and add theming markup
  let parentClassName = '';
  json = json.replace(
    // eslint-disable-next-line no-useless-escape
    /"(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
    match => {
      // Default to "number"
      let className = isDiff ? 'default' : 'number';
      // Detect the type of the JSON part
      // string value or field name
      if (match.startsWith('"')) {
        if (match.endsWith(':')) {
          className = isDiff ? 'default' : 'key';
          if (isDiff) {
            if (match.substr(1, 1) === '+') {
              parentClassName = className = 'added';
            }
            if (match.substr(1, 1) === '-') {
              parentClassName = className = 'removed';
            }
          }
        } else {
          className = isDiff ? 'default' : 'string';
        }
      } else if (!isDiff && /true|false/.test(match)) {
        className = 'boolean';
      } else if (!isDiff && /null/.test(match)) {
        className = 'null';
      }
      const isKey = className === 'key';
      if (parentClassName && parentClassName !== className) {
        className = parentClassName;
        parentClassName = '';
      }
      if (isKey) {
        // Don't color the : character after the key
        const exec = /"(.*)":\s*/.exec(match);
        return `<span class="json-${className}">"${exec[1]}"</span>:`;
      } else {
        return `<span class="json-${className}">${match}</span>`;
      }
    }
  );

  return json;
}
