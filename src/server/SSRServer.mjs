/*
© 2018-present Harald Rudell <harald.rudell@gmail.com> (http://www.haraldrudell.com)
All rights reserved.
*/
import Koa from 'koa'
import koaCors from 'koa2-cors'
import logger from 'koa-logger'
import Router from 'koa-router'
import koaStatic from 'koa-static'
import koaMount from 'koa-mount'

import http2 from 'http2'

export default class SSRServer {
  static scheme = 'https'

  constructor(o) {
    const {origin = '*', http2Options, handler, staticFs, staticUri} = Object(o)
    const router = this._getRouter({handler})
    const app = this._addStatic({app: this._addMiddleware({app: new Koa(), origin})
      .use(router.routes()), staticFs, staticUri})
    .use(router.allowedMethods())
    const http2server = http2.createSecureServer(http2Options, app.callback())
    Object.assign(this, {app, http2server})
  }

  _addMiddleware({app, origin}) {
    return app
    .use(koaCors({origin})) // must be before handler
    .use(logger())
  }

  _getRouter({handler}) {
    return new Router()
      .get('/', async (ctx, next) => {
        const stream = await handler()
        if (!stream) throw new Error('koa: handler response falsy')
        ctx.set('Content-Type', 'text/html')
        ctx.body = stream
      })
  }

  _addStatic({app, staticFs, staticUri}) {
    if (staticFs) {
      let ware = koaStatic(staticFs)
      if (staticUri && staticUri !== '/') ware = koaMount(staticUri, ware)
      app = app.use(ware)
    }
    return app
  }

  async listen(arg) {
    const {http2server} = this
    const {scheme} = SSRServer
    /*const httpServer =*/ await new Promise(resolve => {
      const cb = () => resolve(server)
      arg = Array.isArray(arg) ? arg.concat(cb) : [arg, cb]
      const server = http2server.listen(...arg)
    })
    const {address, port: p} = http2server.address()
    const address1 = address !== '::' ? address : 'localhost'
    const url = `${scheme}://${address1}:${p}`
    return {url, port: p}
  }
}
