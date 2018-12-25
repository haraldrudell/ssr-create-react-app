/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
This source code is licensed under the ISC-style license found in the LICENSE file in the root directory of this source tree.
*/
import pj from '../../package.json'

import SSRServer from './SSRServer'
import Renderer from './Renderer'
import Builder from './Builder'

import path from 'path'
import fs from 'fs-extra'

const {homepage} = pj
const theUrl = homepage && typeof homepage === 'string' ? homepage : ''
const staticUri = theUrl ? new URL(theUrl).pathname : '/' // '/uri'

const options = {
  loadKeyCert: true,
  listen: {
    port: Number(process.SPORT || 3500),
    host: '127.0.0.1',
  },
  server: {
    http2Options: {
      key: path.join(__dirname, '127.0.0.1.key'),
      cert: path.join(__dirname, '127.0.0.1.crt'),
    },
    staticUri,
    staticFs: path.resolve('build'),
  },
  builder: {
    dir:  path.resolve('src'),
    argsBuildSsr: ['yarn', 'react-scripts-harussr', 'build'],
    argsBuild: ['yarn', 'react-scripts', 'build'],
  },
  renderer: {
    htmlFile: path.resolve('build/index.html'),
    htmlMarker: '<div id="root">',
  },
}

startServer(options).catch(errorHandler)

async function startServer(o) {
  const {loadKeyCert, listen = [0], server: s0 = {}, renderer: rOptions, builder: bOptions} = Object(o)
  const server = {...s0}

  if (loadKeyCert) {
    const http2Options = server.http2Options = {...server.http2Options}
    const {key, cert} = http2Options
    http2Options.key = await fs.readFile(key)
    http2Options.cert = await fs.readFile(cert)
  }

  const renderer = new Renderer(rOptions)
  new Builder({...bOptions, action: renderer.reload})
  const {url} = await new SSRServer({...server, handler: renderer.getStream})
    .listen(listen)
  console.log(`listening: ${url}`)
}

function errorHandler(e) {
  console.error(e)
  process.exit(1)
}
