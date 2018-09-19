"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extensions = require("./extensions");

Object.keys(_extensions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _extensions[key];
    }
  });
});