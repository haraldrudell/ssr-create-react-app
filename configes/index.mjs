/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
import Builder from './Builder'

run().catch(errorHandler)

async function run() {
  return new Builder().build()
}

function errorHandler(e) {
  console.error(e)
  process.exit(1)
}
