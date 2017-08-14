import * as chai from 'chai';

import * as utils from '../../src/utils';

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