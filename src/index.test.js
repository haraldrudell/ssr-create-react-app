/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
import {spawnAsync} from 'allspawn'
import fs from 'fs-extra'

import path from 'path'

it('Can execute ssradder', async () => {
  const file = path.resolve('bin/addssr')
  if (!await fs.pathExists(file)) throw new Error(`Executable not present, was yarn bvuild run? ${file}`)
  await spawnAsync({args: [file, '-'], echo: true})
})
