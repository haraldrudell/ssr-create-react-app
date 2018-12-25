/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
import fs from 'fs-extra'

import path from 'path'

export default class JSONer {
  filename = path.resolve('package.json')
  t0 = Date.now()
  pwd = path.resolve()

  getScriptsObject({json, filename}) { // json may be modified
    let isChange = false
    if (!this.isObject(json)) throw new Error(`package.json content not object reading file: ${filename}`)
    let {scripts} = json
    if (!this.isObject(scripts)) {
      isChange = true
      scripts = json.scripts = {}
    } else if (!Object.values(scripts).every(v => v && typeof v === 'string')) throw new Error(`scripts values not string in file: ${filename}`)
    return {scripts, isChange}
  }

  /*
    scripts: optional object with npm scripts to merge in
    files: optional array of files property to replace with
    filename: optional filenname to read, default the project's package.json
  */
  async updateJson({scripts: newScripts, files: newFiles, main: newMain, rollup: newRollup, filename}) { // optional filenname to read, default the project's package.json
    if (!filename) filename = this.filename
    const updates = []

    // read the React project's package.json
    console.log(`Reading: ${this.getRelative(filename)}`)
    const pjson = require(filename)
    const {scripts, isChange} = this.getScriptsObject({json: pjson, filename})
    if (isChange) updates.push('scripts') // json.scripts was updated

    // merge in newScripts
    for (let [script, command] of Object.entries(Object(newScripts))) {
      if (scripts[script] === undefined) {
        updates.push(`scripts.${script}`)
        scripts[script] = command
      }
    }

    // merge in files
    if (newFiles && pjson.files === undefined) {
      updates.push(`files`)
      pjson.files = newFiles
    }

    if (newMain && pjson.main === undefined) {
      updates.push(`main`)
      pjson.main = newMain
    }

    if (newRollup && pjson.rollup === undefined) {
      updates.push(`rollup`)
      pjson.rollup = newRollup
    }

    if (updates.length) {
      console.log(`Writing package.json: ${updates.join('\x20')}`)
      await this.writeJSON(filename, pjson)
    }

    return {updates, pjson} // array string updates, resulting json
  }

  async writeJSON(filename, json) {
    return fs.writeFile(filename, JSON.stringify(json, null, '\x20\x20'))
  }

  isObject(o) {
    return typeof o === 'object' && !Array.isArray(o)
  }

  getRelative(filename) { // to pwd
    const {pwd} = this
    filename = path.relative(pwd, filename)
    if (path.dirname(filename) === '.') filename = `.${path.sep}${filename}`
    return filename
  }

  printElapsed() {
    const {t0} = this
    const seconds = (Date.now() - t0) / 1e3
    console.log(`Completed in ${seconds.toFixed(1)} s`)
    return seconds
  }
}
