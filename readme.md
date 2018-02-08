# Clientside Module Manager

[![npm](https://img.shields.io/npm/v/clientside-module-manager.svg?style=flat-square)](https://www.npmjs.com/package/clientside-module-manager)
[![npm](https://img.shields.io/npm/dm/clientside-module-manager.svg)](https://www.npmjs.com/package/clientside-module-manager)


## Overview
The main utility of this module is that it scopes the javascript it loads so that it does not pollute the global scope.

```js
// example of loading a javascript file into the window into a private namespace / scope
require("util.js")
    .then((util)=>{
        util.awesome_functionality(); // where util is an object defined in util.js by model.exports (the commonjs standard way of defining exports)
        window.my_util = util; // add util into global scope in predefined way
    })
```

An additional utility is that you can utilize the `npm` packaging system and `npm` packages!
```js
// example of loading node modules into window
require("color-name")
    .then((color_name)=>{
        console.log(color_name.blue); // outputs  [0, 0, 255]
    })

```

Note, not all npm modules can be loaded this way. They have to be compatable with async `require`. [See this for more info](#async)

## Installation
`npm install clientside-module-manager --save`

## Usage

### Initialization
#### loading the clientside-module-manager

We will assume for all of these examples that the `clientside-module-manager` has been loaded into the window already as follows:
```html
<script src = "node_modules/clientside-module-manager/src/index.js"></script>
```

#### defining path to the `node_modules` directory
*Skip this step if:*
-  *you do not use `node_modules` in your project you do not need to worry about this.*
- *your `node_modules` directory is in the same directory as the file that the `clientside-module-manager` script is loaded into, you do not need to do anything. (this is the default setup.)*

If your `node_modules` is *not* in the same directory as the file that the `clientside-module-manager` is loaded you will need to define the path to the `node_modules` directory by defining `window.node_modules_root`
- example:
    ```js
        window.node_modules_root = '/../node_modules' // if node_modules is in parent directory of this file's directory
    ```

### Examples

#### load an npm package

*<\script> inside of index.html*
```script
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

where the node_modules package is generated with `npm` and work with async `require()` as [described here](#async)

#### load an html file
```js
    require("path/to/html/file.html")
        .then((html)=>{
            console.log("wow! it works!")
        })
        .catch((err)=>{ // optional error handling
            console.error("hmm... something went wrong");
            if(err == 404) console.log("    `-> the html file was not found!")
        })
```



### Example Native Packages
npm packages written for the browser utilizing `clientside-module-manager`:
- [view-loader](https://github.com/uladkasach/view-loader)


### Transpiler

Comming soon in a seperate repo near you.

The transpiler effectivly takes all `require()` statements, puts them at the beginning of the file, wraps the main code in a promise that resolves after the all the required statements are resolved, and returns the result of that promise (the old module.exports);

### Restrictions
#### async
The `require()` functionality this module loads is asynchronous as browsers (rightfully) do not support synchronous loading of resources. What this means is that `npm` packages which have the `require` statement inside of them MUST treat the `require` function as an async function. In otherwords, `require()` is a promise.

Packages that do this include:
- modules built specifically for the clientside (since frontend development supports only asynchronous loading, as it should)
    - e.g., [view-loader](https://npmjs.com/package/view-loader)
- modules without dependencies
    - e.g., [color-name](https://npmjs.com/package/color-name)

#### scope
Note, scope goes two ways. Not only does the namespace that you load not enter the main window, the namespace of the main window does not enter the namespace that you load. E.g., the clientside-module-manager passes a reference to console so that it can output to the main window console and not an unreachable console.
