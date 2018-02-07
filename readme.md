# Clientside Module Manager

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


### Idea
```js
var promise_to_require = function(module){ return new Promise((resolve, reject)=>{/* magic */}) } // async
var require = function(module){async promise_to_require(module)} // sync
```
