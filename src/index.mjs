/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
import SsrAdder from './ssrAdder'

run({args: process.argv.slice(2)}).catch(errorHandler)

async function run({args}) {
  if (args[0] === '-') return
  if (args.length) throw new Error(`addssr: no arguments allowed, received: '${args.join('\x20')}'`)
  return new SsrAdder().add()
}

function errorHandler(e) {
  console.error(e)
  process.exit(1)
}
