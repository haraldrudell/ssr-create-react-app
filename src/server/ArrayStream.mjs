/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
All rights reserved.
*/
import * as streamImport from 'stream'
const {Readable} = streamImport

export default class ArrayStream extends Readable {
  constructor({array: a0, string}) {
    super(string && {encoding: 'utf8'})
    const array = Array.isArray(a0) ? a0.slice() : [String(a0 || '')]
    Object.assign(this, {array})
  }

  _read() {
    const {array} = this
    while (array.length) if (!this.push(array.shift())) return
    this.push(null)
  }
}
