/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
import fs from 'fs-extra'

import path from 'path'

export default class Builder {
  async build() {
    this.bin = path.resolve('bin')
    return Promise.all([
      this.copy('src/render'),
      this.copy('src/server'),
      this.copy('src/ssradder/srcindex.js'),
      this.copy('src/ssradder/ssr.js'),
      this.copy('src/ssradder/ssr'),
      this.copy('pki'),
    ])
  }

  copy = rel => fs.copy(path.resolve(rel), path.join(this.bin, path.basename(rel)))
}
