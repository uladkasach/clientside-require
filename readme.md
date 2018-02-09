# Clientside Module Manager

[![npm](https://img.shields.io/npm/v/clientside-module-manager.svg?style=flat-square)](https://www.npmjs.com/package/clientside-module-manager)
[![npm](https://img.shields.io/npm/dm/clientside-module-manager.svg)](https://www.npmjs.com/package/clientside-module-manager)


## Overview

**TL;DR:**
this package provides an async `require()` function for the browser; it mirrors the `node.js` implementation as much as possible.

This package enables utilizing `npm` for clientside development. `node modules` that are [able to handle async `require()`](#async) can be installed with `npm` and utilized out of the box.

As an added bonus, it provides a clean way of loading resources without poluting global scope including `json`, `html`, `css`, `txt`, and most notably `js`.

## Quick Demo

 The main utility is that you can utilize the `npm` packaging system and `npm` packages! example:
```js
require("color-name")
    .then((color_name)=>{
        console.log(color_name.blue); // outputs  [0, 0, 255]
    })
```


An additional utility of this module is that it loads content in a way that does not pollute the global scope. For example:

```js
require("util.js")
    .then((util)=>{
        util.awesome_functionality(); // where util is an object defined in util.js by model.exports (the commonjs standard way of defining exports)
        window.my_util = util; // add util into global scope in predefined way
    })
```



## Installation

#### with npm

1. install the module
    - `npm install clientside-module-manager --save`
2. load the module into your page
    - ```<script src = "node_modules/clientside-module-manager/src/index.js"></script>```

#### from scratch
1. copy the `/src/index.js` file to your server
2. load it as any other script
    - ```<script src = "path/to/clientside-module-manager/script/index.js"></script>```


## Usage

### Initialization


Follow the [installation steps](#installation) defined above. If you intend to use node modules, please read this [configuration detail](#node_modules) to ensure the module works in all contexts.

### Examples


We will assume for all of these examples that the `clientside-module-manager` has been loaded into the window already as follows:
```html
<script src = "node_modules/clientside-module-manager/src/index.js"></script>
```


#### load an npm package

*``<script>`` inside of index.html*
```js
var promise_color_name = require("color-name");
promise_color_name
    .then((color_name)=>{
        console.log(color_name.blue); // outputs  [0, 0, 255]
    })
```

*directory structure*
```
node_modules/
    clientside-module-manager/
    color-name/
index.html
```

*Note, not all npm modules can be loaded this way. They have to be compatable with async `require`. [See this for more info.](#async)*


#### load an html file
```js
    require("/path/to/html/file.html")
        .then((html)=>{
            console.log("wow! it works!")
        })
        .catch((err)=>{ // optional error handling
            console.error("hmm... something went wrong");
            if(err == 404) console.log("    `-> the html file was not found!")
        })
```

## Fundamental Functionality : `require(request)`


### Paths

The `request` argument in `require(request)` expects an absolute path,  a relative path, or a node_module name.

For the following examples, lets assume the following directory structure:
```
awesome_directory/
    awesome_file.js
    awesome_helper.js
node_modules/
    clientside-view-loader/
root.html
```

#### absolute path
Absolute paths operate exactly as one would expect. A request to retrieve the file will be sent directly to that path.
```js
// inside `root.html`
require("/awesome_directory/awesome_file.js")
    .then((exports)=>{/* ...magic... */})
```

#### relative path
Relative paths operate exactly like you would expect, too! The `require()` function utilizes the `clientside-module-manager` to keep track of the `path` to each file its loaded in.

Not only can you do this:
```js
// inside `root.html`
require("awesome_directory/awesome_file.js")
    .then((exports)=>{/* ...magic... */})
```

But inside `awesome_directory/awesome_file.js`, which is eventually loaded by `root.html`, we can do this:

```js
// inside awesome_directory/awesome_file.js
require("awesome_helper.js")
    .then((helper_exports)=>{ /* ... use the other scripts for even more magic ... */ })
```

#### node_module name

The `require(request)` function will assume any `request` that does not start with "/" and has no file extension is a `node_module` name. It will:
1. find the root of the `node_module` by utilizing the [`node_module_root`](#node_modules)
2. parse the `package.json` file to find the `main` script
3. load the main script


### Supported Files
The `require()` loader is capable of loading `html`, `css`, `json`, `txt`, and `js`. Notably for `js` we load the contents of the script without polluting the global scope.

##### comments on requiring `js`
The content returned from a `js` file is what is included in the `module.exports` object. This is in line with what one would expect with if they worked with node modules.

The way that the `clientside-module-manager` loads `js` enables the user to protect the global scope. By loading the script into an iframe and extracting the `module.exports` object from the iframe we protect the global scope from any global variable definitions that may exist in the target `js` script.

##### comments on requireing `css`
As there is no way to provide scoping for `css`, `css` is loaded directly into the main window with global scope.

## Advanced Functionality: `require(__, options)`

The require function takes options, `{}`. These options enable various functionality that simplifies using clientside modules.

### options.functions

`options.functions` enables the appending of various functions to the promise element returned by the `require()` command. This enables clean functionality such as `require().load()`, `require.build()`, etc.

This example will use the [clientside-view-loader](https://github.com/uladkasach/clientside-view-loader) module in the demonstration.

without `options.functions`:

```js
var view_loader = require("clientside-view-loader");
view_loader.then((view)=>{
        return view.load("clientside-view-login_signup").generate(options);
    })
    .then((modal)=>{
        document.querySelector("body").appendChild(element);
        element.show("login");
    })
```

with `options.functions`:
```js
var view_loader = require("clientside-view-loader", {functions : {
    load : function(path){ return this.then((view_loader)=>{ return view_loader.load(path)})}, // define `view_loader.load()` to the view_loader promise
}});

view_loader.load("clientside-view-login_signup").generate(options)
    .then((element)=>{
        document.querySelector("body").appendChild(element);
        element.show("login")
    })
```


## Example Native Packages
npm packages written for the browser utilizing `clientside-module-manager`:
- [clientside-view-loader](https://github.com/uladkasach/clientside-view-loader)


## Transpiler

Comming soon in a seperate repo near you.

The transpiler effectivly takes all `require()` statements, puts them at the beginning of the file, wraps the main code in a promise that resolves after the all the required statements are resolved, and returns the result of that promise (the old module.exports);


## Configuration

#### node_modules


By default, the `clientside-module-manager` expects the `node_modules` directory to be in the same directory as the file it is loaded in e.g.:
```
node_modules/
this_file.html
```
in this case (above) it will work by default.


If your `node_modules` is ***not*** in the same directory as the file that the `clientside-module-manager` is loaded you, e.g.:
```
node_modules/
a_directory/
    this_file.html
```

 you will need to define the path to the `node_modules` directory by defining `window.node_modules_root`, e.g.:
```js
    window.node_modules_root = '/../node_modules' // if node_modules is in parent directory of this file's directory
```

**This must be defined before you load the `clientside-module-manager` script.**



## Restrictions
#### async
The `require()` functionality this module loads is asynchronous as browsers (rightfully) do not support synchronous loading of resources. What this means is that `npm` packages which have the `require` statement inside of them MUST treat the `require` function as an async function. In otherwords, `require()` is a promise.

Packages that do this include:
- modules built specifically for the clientside (since frontend development supports only asynchronous loading, as it should)
    - e.g., [clientside-view-loader](https://npmjs.com/package/clientside-view-loader)
- modules without dependencies
    - e.g., [color-name](https://npmjs.com/package/color-name)

#### scope
Note, scope goes two ways. Not only does the namespace that you load not enter the main window, the namespace of the main window does not enter the namespace that you load. E.g., the clientside-module-manager passes a reference to console so that it can output to the main window console and not an unreachable console.
