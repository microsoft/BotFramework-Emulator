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

export default {
  id: 'd227ea65-c795-27af-5514-8ae1e551ae08',
  name: 'Emulator Ngrok Postman',
  description:
    'The ngrok client exposes a REST API that grants programmatic access to:\r\n\r\n- Collect status and metrics information\r\n- Collect and replay captured requests\r\n- Start and stop tunnels dynamically\r\n\r\nhttps://ngrok.com/docs#client-api',
  order: [
    '050b4722-f778-9fe1-8209-9e88002d9460',
    '01478a34-cbe2-d638-7656-9c54687b9851',
    'bd63e72a-294b-2a91-3575-57ff5e517b97',
    'd7c8bafc-508c-509a-f60d-82f25194a57b',
    '7e38bf74-ff2f-851a-ef9b-c889067ebe9c',
  ],
  folders: [],
  timestamp: 1493210118891,
  owner: '30210',
  public: false,
  requests: [
    {
      id: '01478a34-cbe2-d638-7656-9c54687b9851',
      headers: '',
      url: 'http://127.0.0.1:4040/api/tunnels',
      pathVariables: [],
      preRequestScript: null,
      method: 'GET',
      collectionId: 'd227ea65-c795-27af-5514-8ae1e551ae08',
      data: null,
      dataMode: 'params',
      name: 'List tunnels',
      description: '',
      descriptionFormat: 'html',
      time: 1493210237936,
      version: 2,
      responses: [],
      tests: null,
      currentHelper: 'normal',
      helperAttributes: [],
    },
    {
      id: '050b4722-f778-9fe1-8209-9e88002d9460',
      headers: '',
      url: 'http://127.0.0.1:4040/api',
      pathVariables: [],
      preRequestScript: null,
      method: 'GET',
      collectionId: 'd227ea65-c795-27af-5514-8ae1e551ae08',
      data: null,
      dataMode: 'params',
      name: 'Root entry',
      description: '',
      descriptionFormat: 'html',
      time: 1493210161846,
      version: 2,
      responses: [],
      tests: null,
      currentHelper: 'normal',
      helperAttributes: [],
    },
    {
      id: '7e38bf74-ff2f-851a-ef9b-c889067ebe9c',
      headers: '',
      url: 'http://127.0.0.1:4040/api/tunnels/HTTPS_9090',
      pathVariables: [],
      preRequestScript: null,
      method: 'DELETE',
      collectionId: 'd227ea65-c795-27af-5514-8ae1e551ae08',
      data: null,
      dataMode: 'params',
      name: 'Delete tunnel',
      description: '',
      descriptionFormat: 'html',
      time: 1493211716943,
      version: 2,
      responses: [],
      tests: null,
      currentHelper: 'normal',
      helperAttributes: [],
    },
    {
      id: 'bd63e72a-294b-2a91-3575-57ff5e517b97',
      headers: 'Content-Type: application/json\n',
      url: 'http://127.0.0.1:4040/api/tunnels',
      preRequestScript: null,
      pathVariables: [],
      method: 'POST',
      data: [],
      dataMode: 'raw',
      tests: null,
      currentHelper: 'normal',
      helperAttributes: [],
      time: 1493211636420,
      name: 'Create new tunnel',
      description: '',
      collectionId: 'd227ea65-c795-27af-5514-8ae1e551ae08',
      responses: [],
      rawModeData:
        '{\r\n    "name": "HTTPS_9090",\r\n    "proto": "http",\r\n\t"addr": "9090",\r\n\t"bind_tls": true\t\r\n}',
    },
    {
      id: 'd7c8bafc-508c-509a-f60d-82f25194a57b',
      headers: '',
      url: 'http://127.0.0.1:4040/api/tunnels/HTTPS_9090',
      preRequestScript: null,
      pathVariables: [],
      method: 'GET',
      data: null,
      dataMode: 'params',
      version: 2,
      tests: null,
      currentHelper: 'normal',
      helperAttributes: [],
      time: 1493366745498,
      name: 'Get tunnel details',
      description: '',
      collectionId: 'd227ea65-c795-27af-5514-8ae1e551ae08',
      responses: [],
    },
  ],
};
