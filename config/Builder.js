"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Builder {
  constructor() {
    _defineProperty(this, "copy", rel => _fsExtra.default.copy(_path.default.resolve(rel), _path.default.join(this.bin, _path.default.basename(rel))));
  }

  async build() {
    this.bin = _path.default.resolve('bin');
    return Promise.all([this.copy('src/render'), this.copy('src/server'), this.copy('src/ssradder/srcindex.js'), this.copy('src/ssradder/ssr.js'), this.copy('src/ssradder/ssr'), this.copy('pki')]);
  }

}

exports.default = Builder;