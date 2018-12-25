/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
import {createElement} from 'react'
import {renderToString} from 'react-dom/server'

import defaultExport from '../buildssr/bundle'

render(defaultExport).catch(errorHandler)

async function render(App) {
  //console.log('COMPONENT', typeof App, App)
  //debugger
  const markup = renderToString(createElement(App))
  process.send(markup)
}

function errorHandler(e) {
  console.error(e)
  process.exit(1)
}
