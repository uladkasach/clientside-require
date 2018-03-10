/*
    Clientside Require Module
        - supports CommonJS require functionality in the browser
            by providing an asynchronoused require and scoping loaded data
        - note: the require functions in this module are expected to
            be parsed through either 1. webpack or 2. node require - as it cant use itself to build itself
------------------------------------------------------------------------------------------------------------------------------
*/

/*
    define object - a singleton
        - singleton specifically to preserve cache across instantiations
*/
var clientside_require = {
    /*
        define modules root
    */
    modules_root : (typeof window.node_modules_root == "undefined")?
        window.location.origin + "/node_modules/" : // default assumes that the node_modules root is at location origin
        window.node_modules_root, // else if defined use defined root

    /*
        define the cache - a singleton
    */
    cache : require("./cache.js"),

    /*
        define retreival manager - a singleton
    */
    retreiver : require("./retreive.js"),

    /*
        asynchronous_require - the main method used
            - returns a promise which resolves with the requested content
            - places the request into cache so that content is only loaded once
            - injects require functions into requested js files to support requires in required files
                - supports sync and async require injections
    */
    asynchronous_require : async function(module_or_path, options){
        // normalize and analyze request
        var options = this.util.normalize_request_options(options);
        var cache_path = this.cache.generate_cache_path_for_request(module_or_path, options);

        // ensure request is cached
        if(this.cache.get(cache_path) == null){ // if not in cache, build into cache
            var promise_content = this.retreiver.promise_to_retreive_content(request, options);
            this.cache.set(cache_path, promise_content)
        }

        // resolve with content
        return this.cache.get(cache_path, "promise");
    },

    /*
        synchronous require -
            - only usable by js contexts which were created by a clientside
                require load that provisioned the environment with all of its dependencies
            - the function is automatically injected into said environment
            - synchronous require expects all dependencies to already be loaded into cache
    */
    synchronous_require : function(request, options){
        var options = this.util.normalize_request_options(options);
        var cache_path = this.cache.generate_cache_path_for_request(module_or_path, options);
        return this.cache.get(cache_path, "content");
    },

    /*
        helper utilities
    */
    util : {
        normalize_request_options : function(options){
            if(typeof options == "undefined") options = {}; // ensure options are defined
            if(typeof options.relative_path_root == "undefined"){ // if relative path root not defined, default to dir based on location path
                var current_path = window.location.href;
                options.relative_path_root = current_path.substring(0, current_path.lastIndexOf("/")) + "/";
            };
            if(typeof options.injection_require_type == "undefined"){ // if injection require type is not defined, default to async
                options.injection_require_type = "async";
            }
        },
    }

}

/*
    inject "require" and "require_global" into browser context globally
*/
if(typeof window.require_global == "undefined") window.require_global = {}; // initialize require_global by default if not already initialized
var require = clientside_require.require; // create global `require` function
if(typeof module !== "undefined" && typeof module.exports != "undefined") module.exports = clientside_require; // export module if module.exports is defined
