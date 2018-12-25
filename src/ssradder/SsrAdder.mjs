/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
import {spawnAsync} from 'allspawn'
import fs from 'fs-extra'

import path from 'path'

import {JSONer} from '../jsonutil'
import js from './ssradder.json'

export default class SsrAdder {
  async add() {
    const {install, installDev, gitignore} = Object(js)
    return Promise.all([
      this.copy('src/server'),
      this.copy('src/render'),
      this.copy('src/index.js', 'srcindex.js', true),
      this.copy('src/ssr.js'),
      this.copy('public/ssr'),
      this.copy('pki'),
      this.install({install, installDev}),
      this.patchGitignore(gitignore),
    ])
  }

  async copy(rel, from, overwrite) {
    const dst = path.resolve(rel)
    if (!(overwrite = !!overwrite) && await fs.pathExists(dst)) return
    return fs.copy(path.join(__dirname, from || path.basename(rel)), dst, {overwrite})
  }

  async install({install, installDev}) {
    installDev && await spawnAsync({args: ['yarn', 'add', '--dev'].concat(installDev), echo: true})
    install && await spawnAsync({args: ['yarn', 'add'].concat(install), echo: true})
    return this.patchPackageJson()
  }

  patchPackageJson() {
    const {scripts, main, rollup} = Object(js)
    return new JSONer().updateJson({scripts, main, rollup})
  }

  async patchGitignore(s) {
    const lines = String(s || '').split('\n').filter(Boolean)
    if (lines.length === 1 && !lines[0]) return
    const file = path.resolve('.gitignore')
    let data = ''
    if (await fs.pathExists(file)) {
      data = await fs.readFile(file, 'utf8')
      for (let dLine of data.split('\n')) {
        for (let i = 0; i < lines.length;) {
          const line = lines[i]
          if (dLine.startsWith(line)) {
            lines.splice(i, 1)
            continue
          }
          i++
        }
        if (!lines.length) break
      }
    }
    if (lines.length) {
      data += lines.join('\n') + '\n'
      await fs.writeFile(file, data)
    }
  }
}
