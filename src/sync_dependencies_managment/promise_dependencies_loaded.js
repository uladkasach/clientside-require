var clientside_require = require("./../index.js");

/*
    utility used to pre-load all resources (defined by requries) used by a js file with a synchronous injected require function
*/

module.exports = async function(dependencies, relative_path_root){ // load dependencies for synchronous injected require types
    /*
        normalize input
    */
    if(typeof dependencies == "undefined") dependencies = [];

    /*
        define dependency options to be used for caching the modules
    */
    var dependency_options = {
        relative_path_root:relative_path_root,
        injection_require_type : "sync", // sync modules can only use other sync modules
    };

    /*
        wait for each to be cached
    */
    for(var i = 0; i < dependencies.length; i++){ // promise to load each dependency
        let dependency = dependencies[i]; //
        await clientside_require.asynchronous_require(dependency, dependency_options) // call async require to cache the module
            .catch((err)=>{
                console.warn("could not load dependency " + dependency + " found in " + relative_path_root);
            })
    }
}
