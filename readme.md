# Clientside Module Manager

The client side module manager is capable of working with modules that utilize the require() function as a promise
- modules built specifically for the clientside (since frontend development supports only asynchronous loading, as it should)
- module without dependencies
- modules that have been transpiled with the cmm transpiler


### Usage
Just like you would utilize in nodejs + async support for better browser experiences.

example:
```html
<script src = '/node_modules/cmm.js'></script> <!-- one dependency to rule them all -->
<script>
    var promise_color_name = require("color-name");
    promise_color_name
        .then((color_name)=>{
            console.log(color_name.blue); // outputs  [0, 0, 255]
        })
</script>
```

CDN example: (not yet developed)
```html
<script src = '/node_modules/cmm.js'></script> <!-- one dependency to rule them all -->
<script> cmm.CDN = true; // loads resources from CDN instead of locally </script>
```


### Example Native Packages



### Transpiler

Comming soon in a seperate repo near you.

The transpiler effectivly takes all `require()` statements, puts them at the beginning of the file, wraps the main code in a promise that resolves after the all the required statements are resolved, and returns the result of that promise (the old module.exports);
