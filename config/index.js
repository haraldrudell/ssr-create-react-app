"use strict";

var _Builder = _interopRequireDefault(require("./Builder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
run().catch(errorHandler);

async function run() {
  return new _Builder.default().build();
}

function errorHandler(e) {
  console.error(e);
  process.exit(1);
}