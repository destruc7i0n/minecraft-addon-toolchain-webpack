const { series, dest } = require('gulp')

const glob = require('glob')
const tap = require('gulp-tap')
const log = require('gulplog')
const pump = require('pump')
const path = require('path')
const webpack = require('webpack-stream')

class WebpackSupport {
  constructor () {
    this.options = {
      debug: false,
      multiEntry: true,
    }
    this.webpackOptions = {
      mode: 'development' // for minification, set to `production`
      // you can also add your own plugins, config etc here...
    }
    this.webpackRules = [ // modify/append this to add a file loader, etc.
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]

    this.intermediateDir = './out/before-webpack'
    this.entryPoints = ['./scripts/client/*.js', './scripts/server/*.js']
    this.bundleSources = ['./scripts/**/*.js']

    const _this = this
    this.sourceTasks = [
      {
        condition: this.bundleSources,
        preventDefault: true,
        task: (pack) => tap((file, t) => {
          _this.options && _this.options.debug && log.info(`\twebpack: redirecting ${file.path}`)
          return t.through(dest, [path.join(this.intermediateDir, pack.relativePath)])
        })
      }
    ]
  }

  set builder (builder) {
    if (builder._version < 1) {
      throw new Error('webpack support requires using a minecraft-addon-toolchain with at least version 1 or higher')
    }
    this._builder = builder
  }

  addDefaultTasks (gulpTasks) {
    const webpackTask = this._webpack.bind(this)
    webpackTask.displayName = 'webpack'

    gulpTasks.buildSource = series(
      gulpTasks.buildSource,
      webpackTask
    )
  }

  _webpack (done) {
    const entryGlob = (globPath, cwd) => {
      const files = glob.sync(globPath, { cwd })
      let entries = {}

      for (let entry of files) {
        entries[entry] = entry
      }

      return entries
    }

    return this._builder.foreachPack(
      'webpack',
      'behavior',
      (pack, packDone) => {
        const packDir = path.join(this.intermediateDir, pack.relativePath)
        const destination = path.join(this._builder.bundleDir, pack.relativePath)

        if (this.options.multiEntry) {
          const filePaths = [].concat(
            // glob the files
            this.entryPoints.map((entry) => entryGlob(entry, packDir))
          ).reduce((acc, val) => {
            for (let key in val) {
              // resolve the path and store by file name
              acc[key] = path.resolve(packDir, val[key])
            }
            return acc
          }, {})

          return pump(
            [
              webpack(Object.assign({
                // every input has one output
                entry: filePaths,
                output: {
                  filename: '[name]' // the path is specified in the name
                },
                module: {
                  rules: this.webpackRules
                }
              }, this.webpackOptions)),
              dest(destination)
            ],
            packDone
          )
        } else {
          return pump(
            [
              webpack(Object.assign({
                entry: {
                  client: path.resolve(packDir, './scripts/client/client.js'),
                  server: path.resolve(packDir, './scripts/server/server.js')
                },
                output: {
                  filename: 'scripts/[name]/[name].js'
                },
                module: {
                  rules: this.webpackRules
                }
              }, this.webpackOptions)),
              dest(destination)
            ],
            packDone
          )
        }
      },
      done
    )
  }
}

module.exports = WebpackSupport
