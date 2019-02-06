# minecraft-addon-toolchain-webpack

## Webpack
Adds support for modern JavaScript features not supported by the Minecraft Scripting Engine, such as modules and multi-file projects.

This was heavily based on [minecraft-addon-toolchain-browserify](https://github.com/minecraft-addon-tools/minecraft-addon-toolchain/tree/master/packages/minecraft-addon-toolchain-browserify), but was adapted to use webpack.

### Installing
```powershell
npm install --save-dev minecraft-addon-toolchain-webpack
```

### Adding to the toolchain
```javascript
const MinecraftAddonBuilder = require('minecraft-addon-toolchain/v1')
const WebpackSupport = require('minecraft-addon-toolchain-webpack')

const builder = new MinecraftAddonBuilder(<youraddonname>)
builder.addPlugin(new WebpackSupport())

module.exports = builder.configureEverythingForMe();
```

### Usage
You can view an example of how this can be used on the original package's [README](https://github.com/minecraft-addon-tools/minecraft-addon-toolchain/tree/master/packages/minecraft-addon-toolchain-browserify#usage).

### Configuration
You can override the settings passed to Babelify any of the following settings the BrowserifySupport object.

```javascript
const MinecraftAddonBuilder = require('minecraft-addon-toolchain/v1')
const WebpackSupport = require('minecraft-addon-toolchain-webpack')

const builder = new MinecraftAddonBuilder(<youraddonname>);
const webpackSupport = new WebpackSupport();

/// Modify options that webpack will use
//webpackSupport.webpackOptions

/// Enable minification and other enhancements
//webpackSupport.webpackOptions.mode = 'production'

/// Modify the rules that webpack will use
// IMPORTANT: Before doing so, check note below.
//webpackSupport.webpackRules

///Enable single file entry (more details below)
//webpackSupport.options.multiEntry = false

/// Change the intermediate output directory
//webpackSupport.intermediateDir = './out/before-webpack'

/// Change the entry point scripts that will be bundled.
//webpackSupport.entryPoints = ['./scripts/client/*.js', './scripts/server/*.js']

builder.addPlugin(webpackSupport)

module.exports = builder.configureEverythingForMe();
```

#### *Multiple Entry Files
If this is enabled (see info above) the compiler will only look for the files of `./scripts/client/client.js` and `./scripts/server/server.js`. This is useful if you want to only have one file as the output. By default this is disabled and will work exactly like [minecraft-addon-toolchain-browserify](https://github.com/minecraft-addon-tools/minecraft-addon-toolchain/tree/master/packages/minecraft-addon-toolchain-browserify).


For further information about the various configuration options provided by the various tools, consult the following links:

| field name          | documentation link                                             |
| ------------------- | -------------------------------------------------------------- |
| `webpackOptions`    | https://webpack.js.org/configuration/                          |