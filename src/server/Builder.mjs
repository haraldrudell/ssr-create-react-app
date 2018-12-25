/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
All rights reserved.
*/
import chokidar from 'chokidar'
import {spawnAsync} from 'allspawn'

import fs from 'fs-extra'

export default class Builder {
  constructor({dir, argsBuildSsr, argsBuild, action}) {
    this.m = 'Builder'
    let e
    if ((e = this.arrayOfString(argsBuildSsr, 'buildssr'))) throw e
    if ((e = this.arrayOfString(argsBuild, 'build'))) throw e
    if (!fs.pathExistsSync(dir = String(dir || ''))) new Error(`${this.m} dir does not exist: '${dir}'`)
    if (typeof action !== 'function') new Error(`${this.m} action not function`)
    const watcher = chokidar.watch(dir, {persistent: true})
      .on('add', this.trig)
      .on('change', this.trig)
    Object.assign(this, {watcher, argsBuild, argsBuildSsr, action})
  }

  trig = () => !this.isBuilding ? this.build().catch(this.failure) : this.pending === false && (this.pending = true)

  async build() {
    const {argsBuild, argsBuildSsr} = this
    for (;;) {
      this.isBuilding = true
      let result = await Promise.all([
        this.invoke(argsBuild),
        this.invoke(argsBuildSsr),
      ]).then(this.doAction).catch(e => e)
      if (result instanceof Error) this.failure(result)
      this.isBuilding = false
      const {pending} = this
      this.pending = false //  false: at least one build completed
      if (!pending) break
    }
  }

  async invoke(args) {
    return spawnAsync({args, echo: true})
  }

  doAction = async () => {
    console.log(`${this.m}: build successful.`)
    return this.action()
  }

  close() {
    const {watcher} = this
    if (watcher) {
      this.watcher = null
      return watcher.close()
    }
  }

  failure = e => console.error(`${this.m}`, e)

  arrayOfString = (cmd, m) => (Array.isArray(cmd) ? cmd : [cmd]).some(s => (!s || typeof s !== 'string') && new Error(`${this.m} ${m} argument not non-empty string or array of`))
}
