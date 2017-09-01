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

import * as chai from 'chai';
import * as utils from '../../src/shared/utils';


chai.should();

describe("Utils", function() {
    describe("isLocalhostUrl", function() {
        it("returns true for localhost url", function() {
            utils.isLocalhostUrl("http://localhost:2728/api/messages").should.equal(true);
            utils.isLocalhostUrl("https://localhost:2728/api/messages").should.equal(true);
        });

        it("returns true for local ip url", function() {
            utils.isLocalhostUrl("http://127.0.0.1/some/sort/of/url.html").should.equal(true);
            utils.isLocalhostUrl("https://127.0.0.1/some/sort/of/url.html").should.equal(true);
        });

        it("returns false for other urls", function() {
            utils.isLocalhostUrl("https://example.com").should.equal(false);
            utils.isLocalhostUrl("http://example.com/localhost").should.equal(false);
            utils.isLocalhostUrl("http://example.com").should.equal(false);
            utils.isLocalhostUrl("http://981.89.1.1").should.equal(false);
        });

        it("returns false for non url strings", function() {
            utils.isLocalhostUrl("stringstringstring").should.equal(false);
            utils.isLocalhostUrl("http is hypertext transfer protocal").should.equal(false);
            utils.isLocalhostUrl("localhost").should.equal(false);
        });
    });

    describe("isSecureUrl", function() {
        it("returns true for https urls", function() {
            utils.isSecuretUrl("https://example.com").should.equal(true);
            utils.isSecuretUrl("https://localhost:2728/api/messages").should.equal(true);
        });

        it("returns false for http urls", function() {
            utils.isSecuretUrl("http://example.com").should.equal(false);
            utils.isSecuretUrl("http://localhost:2728/api/messages").should.equal(false);
        });

        it("returns false for non url strings", function() {
            utils.isSecuretUrl("stringstringstring").should.equal(false);
            utils.isSecuretUrl("http is hypertext transfer protocol").should.equal(false);
            utils.isSecuretUrl("localhost").should.equal(false);
        });
    });

    describe("approximateObjectSize", function() {
        it("returns estimate for object with various types in it", function() {
            let o = {
                bool: true, //4
                num: -1234, //8
                str: "some string", //11*2= 22
                obj: {
                    bool2: false, //4
                    num2: 9876532, //8
                    str2: "another string.", //15*2= 30
                    obj2: {
                        obj3: {
                            num3: 0 //8
                        }
                    }
                }
            }
            let total = 84;
            utils.approximateObjectSize(o).should.equal(total);
        });

        it("handles objects that contain copies of themselves", function() {
            let a = {
                boola: true,
                obja: null,
            }
            let b = {
                boolb: true,
                objb: a,
            }
            a.obja = b;
            let total = 8;
            utils.approximateObjectSize(a).should.equal(total);
        });
    });
});
