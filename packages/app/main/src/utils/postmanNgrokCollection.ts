/* eslint-disable typescript/camelcase */
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

export const PostmanNgrokCollection = {
  info: {
    _postman_id: '52c791ee-59ed-4c8b-8ffa-5872edeffe2b',
    name: 'Emulator Ngrok Postman',
    description:
      'The ngrok client exposes a REST API that grants programmatic access to:\r\n\r\n- Collect status and metrics information\r\n- Collect and replay captured requests\r\n- Start and stop tunnels dynamically\r\n\r\nhttps://ngrok.com/docs#client-api',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item: [
    {
      name: 'Root entry',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: 'http://127.0.0.1:4040/api',
          protocol: 'http',
          host: ['127', '0', '0', '1'],
          port: '4040',
          path: ['api'],
        },
      },
      response: [],
    },
    {
      name: 'List tunnels',
      event: [
        {
          listen: 'prerequest',
          script: {
            id: '8550ced6-0aa3-4515-a78e-0e5720955ed7',
            exec: [''],
            type: 'text/javascript',
          },
        },
        {
          listen: 'test',
          script: {
            id: 'fc71302b-f079-4dd4-aac7-043fff315c58',
            exec: [
              'var jsonData = JSON.parse(responseBody)',
              'pm.globals.set("tunnel_name", jsonData.tunnels[0].name);',
            ],
            type: 'text/javascript',
          },
        },
      ],
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: 'http://127.0.0.1:4040/api/tunnels',
          protocol: 'http',
          host: ['127', '0', '0', '1'],
          port: '4040',
          path: ['api', 'tunnels'],
        },
      },
      response: [],
    },
    {
      name: 'Create new tunnel',
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
        body: {
          mode: 'raw',
          raw:
            '{\r\n    "name": "HTTPS_9090",\r\n    "proto": "http",\r\n\t"addr": "9090",\r\n\t"bind_tls": true\t\r\n}',
        },
        url: {
          raw: 'http://127.0.0.1:4040/api/tunnels',
          protocol: 'http',
          host: ['127', '0', '0', '1'],
          port: '4040',
          path: ['api', 'tunnels'],
        },
      },
      response: [],
    },
    {
      name: 'Get tunnel details',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: 'http://127.0.0.1:4040/api/tunnels/{{tunnel_name}}',
          protocol: 'http',
          host: ['127', '0', '0', '1'],
          port: '4040',
          path: ['api', 'tunnels', '{{tunnel_name}}'],
        },
      },
      response: [],
    },
    {
      name: 'Delete tunnel',
      request: {
        method: 'DELETE',
        header: [],
        body: {
          mode: 'formdata',
          formdata: [],
        },
        url: {
          raw: 'http://127.0.0.1:4040/api/tunnels/{{tunnel_name}}',
          protocol: 'http',
          host: ['127', '0', '0', '1'],
          port: '4040',
          path: ['api', 'tunnels', '{{tunnel_name}}'],
        },
      },
      response: [],
    },
  ],
  protocolProfileBehavior: {},
};
