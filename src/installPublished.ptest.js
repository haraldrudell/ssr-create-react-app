/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
import fs from 'fs-extra'
import { spawnAsync } from 'allspawn'

import path from 'path'

const projectDir = path.resolve()
const npmDir = path.join(projectDir, 'tmp', 'from-npm')

it('Install published test package', async () => {
  const appName = 'lib-create-react-app-test'
  const twentySeconds = 2e4
  let t0, timeout

  const testTime = twentySeconds
  jest.setTimeout(testTime)

  // create an empty project
  console.log(`Emptying: ${npmDir}`)
  await fs.emptyDir(npmDir)

  await spawnAsync({args: ['yarn', 'init', '--yes'], echo: true, options: {silent: true, cwd: npmDir}})

  // install the package from npm
  t0 = getT0("Install from npm", timeout = twentySeconds)
  await spawnAsync({args: ['yarn', 'add', appName], echo: true, options: {silent: true, cwd: npmDir, timeout}})
  console.log(getElapsed(t0)) // 181122: 6 s

  function getMinutes(ms) {
    const minutes = Math.ceil(ms / 6e4)
    return minutes.toFixed(0)
  }
  function getT0(task, timeout) {
    console.log(`${task} (up to ${getMinutes(timeout)} min)…`)
    return {t0: Date.now(), task}
  }
  function getElapsed({t0, task}) {
    const elapsed = (Date.now() - t0) / 1e3
    return `${task}: ${elapsed.toFixed(1)} s`
  }
})
