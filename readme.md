# Clientside Module Manager

### Usage
Just like you would utilize in nodejs.

sync example:
```html
<script src = '/cmm.js'></script> <!-- one dependency to rule them all -->
<script>
    var request = require('request-promise');
    request({uri:"google.com"})
        .then((response)=>{
            console.log("response:")
            console.log(response)
        });
</script>
```

async example:
```html
<script src = '/cmm.js'></script> <!-- one dependency to rule them all -->
<script>
    promise_to_require('request-promise')
        .then((request)=>{
            return request({uri:"google.com"})
        })
        .then((response)=>{
            console.log("response:")
            console.log(response)
        });
</script>
```


### Idea
```js
var promise_to_require = function(module){ return new Promise((resolve, reject)=>{/* magic */}) } // async
var require = function(module){async promise_to_require(module)} // sync
```
