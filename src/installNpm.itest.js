/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
import fs from 'fs-extra'
import { spawnAsync } from 'allspawn'

import path from 'path'

const projectDir = path.resolve()
const tmpDir = path.join(projectDir, 'tmp')

it('Successful create to publish', async () => {
  //const ThreeSeconds = 3e3
  const oneMinute = 6e4
  const twoMinutes = 1.2e5
  //const threeMinutes = 18e4
  const fourMinutes = 2.4e5
  const sixMinutes = 3.6e5
  let t0, timeout

  const testTime = sixMinutes
  const appName = 'lib-create-react-app-test'
  const author = 'Harald Rudell <harald.rudell@gmail.com> (http://haraldrudell.com)'

  console.log(`\n>>> This test takes up to ${getMinutes(testTime)} minutes <<<\n` +
  `  and requires an Internet connection`)
  jest.setTimeout(testTime)

  // clear and create temporary directory
  console.log(`Clearing: ${path.relative(projectDir, tmpDir)}`)
  await fs.emptyDir(tmpDir)

  // run create react app
  t0 = getT0("Run Create React App", timeout = oneMinute)
  await spawnAsync({args: ['npx', 'create-react-app', appName], echo: true, options: {silent: true, cwd: tmpDir, timeout}})
  console.log(getElapsed(t0)) // 181122: 27 s
  const appDir = path.join(tmpDir, appName)

  // install this package via file system
  t0 = getT0("Install lib-create-react-app", timeout = oneMinute)
  await spawnAsync({args: ['yarn', 'add', '../..'], echo: true, options: {silent: true, cwd: appDir, timeout}})
  console.log(getElapsed(t0)) // 181122: 31 s

  // patch project
  t0 = getT0("Configure project using preplib", timeout = fourMinutes)
  await spawnAsync({args: ['yarn', 'preplib'], echo: true, options: {cwd: appDir, timeout: twoMinutes}})
  console.log(getElapsed(t0)) // 181122: 69 s

  // insert author
  const tmpJsonFile = path.join(appDir, 'package.json')
  const tmpJson = require(tmpJsonFile)
  tmpJson.author = author
  await fs.writeFile(tmpJsonFile, JSON.stringify(tmpJson, null, '\x20\x20'))

  // publish!
  t0 = getT0("Publish to npm", timeout = fourMinutes)
  await spawnAsync({args: ['yarn', 'pub'], echo: true, options: {cwd: appDir, timeout: twoMinutes}})
  console.log(getElapsed(t0))

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
