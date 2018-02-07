# Clientside Module Manager


[![npm](https://img.shields.io/npm/v/clientside-module-manager.svg?style=flat-square)](https://www.npmjs.com/package/clientside-module_manager)
[![npm](https://img.shields.io/npm/dm/clientside-module_manager.svg)](https://www.npmjs.com/package/clientside-module_manager)


The client side module manager is capable of working with modules that utilize the require() function as a promise. This includes:
- modules built specifically for the clientside (since frontend development supports only asynchronous loading, as it should)
- module without dependencies
- modules that have been transpiled with the cmm transpiler

### Installation
`npm install clientside-module-manager --save`

### Usage
This module needs to be imported manually and needs to have the path to the `node_modules` directory defined. By default, it will assume that the `node_modules` directory is in the same directory as the file it is initialized in.

The module loads the `require()` functionality into the global namespace. This can be similarly to how you would expect in nodejs with one key exception: the function is asynchronous (it is a promise). This is because browsers (rightfully) do not support synchronous loading of scripts due to poor user experiences.

#### simple example
```html
<script src = "node_modules/clientside-module-manager/index.js"></script>
<script>
    var promise_color_name = require("color-name");
    promise_color_name
        .then((color_name)=>{
            console.log(color_name.blue); // outputs  [0, 0, 255]
        })
</script>
```

### Example Native Packages
[view-loader](https://github.com/uladkasach/view-loader)


### Transpiler

Comming soon in a seperate repo near you.

The transpiler effectivly takes all `require()` statements, puts them at the beginning of the file, wraps the main code in a promise that resolves after the all the required statements are resolved, and returns the result of that promise (the old module.exports);
