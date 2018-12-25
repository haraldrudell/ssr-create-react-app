/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
All rights reserved.
*/
import fs from 'fs-extra'
import {spawnAsync} from 'allspawn'

import ArrayStream from './ArrayStream'

import path from 'path'

const args = ['node', /*'--inspect-brk',*/ path.join(__dirname, 'render')]

export default class Renderer {
  constructor({htmlFile, htmlMarker}) {
    this.m = 'Renderer'
    let e
    if ((e = this.neString(htmlFile, 'htmlFile'))) throw e
    if ((e = this.neString(htmlMarker, 'htmlMarker'))) throw e
    this.promise = new Promise(resolve => this._resolve = resolve)
    Object.assign(this, {htmlFile, htmlMarker})
  }

  reload = async () => {
    const [html, markup] = await Promise.all([
      this.getHtml(),
      this.getMarkup(),
    ]).catch(e => [e])
    if (html instanceof Error) console.error(`${this.m} rendering failed:`, html)
    else {
      html.splice(1, 0, markup)
      this.array = html
      this._resolve()
    }
  }

  async getMarkup() {
    let markup
    const cpReceiver = {}
    const s = spawnAsync({args, echo: true, cpReceiver, options: {stdio: [ 'ignore', 'inherit', 'inherit', 'ipc']}})
    cpReceiver.cp.once('message', msg => markup = msg)
    await s
    if (typeof markup !== 'string') throw new Error(`${this.m} no message from child process: render`)
    console.log(`${this.m} markup: ${markup.substring(0, 50)}${markup.length > 50 ? '…': ''}`)
    return markup
  }

  async getHtml() {
    const {htmlFile, htmlMarker} = this
    const html = await fs.readFile(String(htmlFile), 'utf8')
    const i = html.indexOf(htmlMarker)
    if (i < 0) throw new Error(`${this.m} htmlMarker not found in html`)
    const j = i + htmlMarker.length
    return [html.substring(0, j), html.substring(j)]
  }

  getStream = async () => {
    if (!this.array) await this.promise
    const {array} = this
    return new ArrayStream({array, string: true})
  }

  neString = (s, m) => (!s || typeof s !== 'string') && new Error(`${this.m} ${m} not non-empty string`)
}
