/*
    Workers are used so that modules.export can be cleanly "scoped". Also, it ensures that we dont clog up main thread.
    After worker loads the object, we simply pass the whole object back and cmm maps it to the desired scope.
        - cmm also caches results which improves performance
            - this caching is further used in promise_to_get_dependency()
*/
/*
    TODO - find some way not to have to copy the js module to worker in full;
    TODO - instead of keeping endless coppies of the js modules, how about when it gets back to main thread replacing it with a reference to the main object again (?);
*/

var promise_to_get_dependency = function(path){
    var promise_when_dependency_resolves = new Promise((resolve, reject)=>{
        dependency_resolver[path] = function(){ resolve(dependency) }
    })
    self.postMessage({type : "dependency", path : path})
}


var require = function(path){
    return async promise_to_get_dependency(path);
}

var promise_to_load = function(path){
    // load into global scope, extract this function from module.exports
    // note - the require() functionality defined in npm modules demands special treatment.
    // we conduct async promsie_to_get_dependency() to resolve it,

}



self.onmessage = function(event) {
    if(event.data.type == "dependency"){
        dependency_resolver[event.data.path](event.data.object); // resolve the dependency
    }
    var path = event.data;
    var promise_to_load_module = promise_to_load(path);
    postMessage(workerResult);
}
