#!/usr/bin/env node
'use strict'

const fs= require('fs')
const path = require('path')
const importJsx = require('import-jsx')
const { h, render } = require('ink')
const meow = require('meow')
const open = require('react-dev-utils/openBrowser')

const dev = require('@compositor/kit-dev')

const config = require('pkg-conf').sync('kit')

const App = importJsx('./src/App')
const pkg = require('./package.json')
const parseArgs = require('./lib/parse-args')

const cli = meow(
  `
  Usage

    $ kit <command> [options]

  Examples
    $ kit examples
    $ kit dev examples
    $ kit init

  Options

    Dev Server

      -o --open     Opens development server in default browser
      -p --port     Port for development server (default: 8080)
      -m --mode     Enable different modes for server UI
      --webpack     Path to custom webpack.config.js

`,
  {
    version: pkg.version,
    flags: {
      version: {
        type: 'boolean',
        alias: 'v'
      },
      help: {
        type: 'boolean',
        alias: 'h'
      },
      open: {
        type: 'boolean',
        alias: 'o'
      },
      port: {
        type: 'string',
        alias: 'p',
        default: 8080
      },
      webpack: {
        type: 'string'
      },
      config: {
        type: 'string',
        alias: 'c'
      },
      mode: {
        type: 'string',
        alias: 'm'
      }
    }
  }
)

const { cmd, input } = parseArgs(cli.input)

// normalize options
const stats = fs.statSync(input)
const dirname = stats.isDirectory() ? input : path.dirname(input)
const filename = stats.isDirectory() ? null : input

const opts = Object.assign({
  cmd,
  input,
  dirname,
  filename
}, config, cli.flags)

switch (cmd) {
  case 'init':
  case null:
    render(h(App, opts))
    break
  case 'dev':
  default:
    dev(opts)
      .then(({ server }) => {
        const { port } = server.options
        const url = `http://localhost:${port}`

        if (opts.open) {
          open(url)
        }
      })
      .catch(err => {
        console.error(err)
        process.exit(1)
      })
    break
}

require('update-notifier')({
  pkg: cli.pkg
}).notify()

