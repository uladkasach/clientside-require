/*
    note: the require functions in this module are expected to be parsed through either 1. webpack or 2. node require
*/
var Clientside_Require = function(module_root){
    var environment = this.detect_environment(); // detect whether we are running in 1. browser or 2. node

    // define module root
    if(typeof module_root == "undefined" && environment == "browser"){ // if not explicitly defined and browser, attempt default definition
        module_root = location.origin + "/node_modules/"; // default assumes that the node_modules root is at location origin
    }
    if(typeof module_root == "undefined") throw new Error("modules root needs to be defined"); // modules root should be defined by now. if not by now, we are in node env and it was not defined.

    // define loading utilities
    if(environment == "browser") this.loader_functions = require("./loading_utilities/browser_environment.js"); // browser env loader utilities
    if(environment == "node") this.loader_functions = require("./loading_utilities/node_environment.js"); // node env loading utilities
    if(typeof this.loader_functions == "undefined") throw new Error("loader functions are still not defined"); // loader functions should be defined by now

}


Clientside_Require.prototype.path_analysis = function(request, relative_path_root){

}
var clientside_require = { // a singleton object


    /*
        analyze and normalize path
            - used for cache_path
            - used for generate requst details
    */
    normalize_and_analyze_request_path : function(request, relative_path_root){
        var extension_whitelist = ["js", "json", "css", "html"];

        /*
            analyze request
        */
        var orig_request = request;
        var is_relative_path_type_1 = request.indexOf("./") == 0; // then it is a path of form "./somepath", a relative path as defined by node
        var is_relative_path_type_2 = request.indexOf("../") == 0; // then it is a path of form "../somepath", a relative path as defined by node
        var is_relative_path = is_relative_path_type_1 || is_relative_path_type_2;
        var is_a_path = request.indexOf("/") > -1; // make sure not node_relative_path
        var extension = request.slice(1).split('.').pop(); // slice(1) to skip the first letter - avoids error of assuming extension exists if is_relative_path
        var exists_file_extension = extension != request.slice(1); // if the "extension" is the full evaluated string, then there is no extension
        var exists_valid_extension = exists_file_extension && extension_whitelist.indexOf(extension) > -1; // extension is valid if it is fron the extension whitelist
        var is_a_module = !is_a_path;


        /*
            modify request based on analysis (make assumptions)
        */
        if(is_a_path && !exists_valid_extension){  // if not a node module (i.e., is a path) and there is no valid extension,
            extension = "js"; // then it implies a js file
            exists_file_extension = true;
            exists_valid_extension = true;
            request += ".js";
            // TODO (#11) - sometimes this referes to a directory, how to detect whether directory or file?
                // if directory we need to go to request/index.js
                // may want to just attempt to load it and if we find an error assume its a directory and try that too
        }
        if(is_relative_path){ // if its a relative path,
            if(is_relative_path_type_1) request = request.slice(2); //  remove the "./" at the begining
            request = relative_path_root + request; // if relative path, use the relative_path_root to generate an absolute path
        }
        if(is_a_module){
            request = this.modules_root + request + "/package.json"; // convert request to packagejson path
        }
        if(request.indexOf("://") == -1){ // if :// does not exist in string, assume that no origin is defined (origin = protocol + host)
            request = location.origin + request; // and simply append the locations origin. that is how the browser would treat the request in the first place
        }

        /*
            build analysis object after all modifications and respond
        */
        var analysis = {
            orig_request : orig_request,
            is_relative_path:is_relative_path,
            is_a_path:is_a_path,
            extension:extension,
            exists_file_extension:exists_file_extension,
            exists_valid_extension:exists_valid_extension,
            is_a_module:is_a_module,
            relative_path_root : relative_path_root,
        }
        return [request, analysis];
    },

    /*
        extract request details
            - is it an npm module reference? if so then we need to generate the path to the main file
            - what filetype should we load?
    */
    promise_request_details : function(request, relative_path_root, injection_require_type){
        var [request, analysis] = this.normalize_and_analyze_request_path(request, relative_path_root);
        var is_a_path = analysis.is_a_path;
        var extension = analysis.extension;
        var exists_valid_extension = analysis.exists_valid_extension;
        var is_a_module = analysis.is_a_module;

        /*
            generate details with special care for node modules
        */
        if(is_a_module){ // if not a path and no file extension, assume its a node_module.
            var promise_details = this.loader_functions.basic.promise_to_retreive_json(request)
                .then((package_json)=>{
                    /*
                        core functionality
                    */
                    var base_path = request.substring(0, request.lastIndexOf("/")) + "/"; // get dir from filepath
                    var main = (package_json.main)? package_json.main : "index.js"; // if main not defined, its index.js
                    var path = base_path + main; // generate path based on the "main" data in the package json
                    var package_options = package_json["clientside-require"];

                    /*
                        injection require type functionality
                    */
                    var injection_type_async_not_in_package_options = (typeof package_options == "undefined" || typeof package_options.require_mode == "undefined" || package_options.require_mode !== "async");
                    var injection_type_async_not_in_package_json =  (typeof package_json == "undefined" || package_json.require_mode !== "async");
                    var injection_require_type = // define require mode for module; overwrites user selected and percolated injection_require_type passed as an argument to this function
                        (injection_type_async_not_in_package_json && injection_type_async_not_in_package_options)? "sync" : "async"; // either user injection_require_type="async", or we assume its "sync";
                    if(injection_require_type == "sync"){ // extract dependencies from pacakge list and parsed file
                        var module_dependencies = (typeof package_json.dependencies == "undefined")? [] : Object.keys(package_json.dependencies); // get modules this module is dependent on
                        var promise_path_dependencies = this.extract_dependencies_from_js_at_path(path); // get paths this main file is dependent on (note, paths those paths are dependent on will be recursivly loaded)
                        var promise_dependencies = promise_path_dependencies
                            .then((path_dependencies)=>{ // then combine and deduplicate entries
                                var dependencies_with_duplicates = module_dependencies.concat(path_dependencies);
                                return dependencies_with_duplicates.filter(function (item, pos) {return dependencies_with_duplicates.indexOf(item) == pos}); // https://stackoverflow.com/a/23080662/3068233
                            })
                    }

                    /*
                        return the data
                    */
                    return Promise.all(["js", path, injection_require_type, promise_dependencies]); // promise all data to be generated
                })
        } else if(is_a_path && exists_valid_extension){ // if its an acceptable extension and not defining a module
            var path = request; // since its not defining a module, the request has path information

            if(injection_require_type == "sync" && extension == "js"){
                var promise_path_dependencies = this.extract_dependencies_from_js_at_path(path); // retreive dependencies from js file if sync injection required, else no dependencies
                var promise_dependencies = promise_path_dependencies
                    .then((dependencies_with_duplicates)=>{ // then deduplicate entries
                        return dependencies_with_duplicates.filter(function (item, pos) {return dependencies_with_duplicates.indexOf(item) == pos}); // https://stackoverflow.com/a/23080662/3068233
                    })
            } else {
                var promise_dependencies = Promise.resolve([]);
            }
            var promise_details = Promise.all([extension, path, injection_require_type, promise_dependencies])
        }


        /*
            return details in standard format
        */
        if(typeof promise_details == "undefined"){
            console.warn("invalid request : " + request + " from root " + relative_path_root)
            console.log(analysis);
            return Promise.reject("invalid request");
        } else {
            return promise_details
                .then(([extension, path, injection_require_type, dependencies])=>{
                    return {type : extension, path : path, injection_require_type : injection_require_type, dependencies : dependencies}
                })
        }
    },


    /*
        dependencies functionality
    */
    extract_dependencies_from_js_at_path : function(path){
        return this.loader_functions.basic.promise_to_get_content_from_file(path)
            .then((content)=>{
                /*
                    extract all require requests from js file manually
                        - use a regex to match between require(["'] ... ["'])
                */
                //console.log("conducting regex to extract requires from content...");
                var regex = /(?:require\(\s*["'])(.*?)(?:["']\s*\))/g // plug into https://regex101.com/ for description; most important is (.*?) and g flag
                var matches = [];
                while (m = regex.exec(content)){ matches.push(m[1]) };
                return matches
            })
    },
    promise_dependencies_loaded : function(dependencies, relative_path_root){ // load dependencies for synchronous injected require types
        if(typeof dependencies == "undefined") dependencies = [];
        var promise_all_dependencies_cached = [];
        for(var i = 0; i < dependencies.length; i++){ // promise to load each dependency
            let dependency = dependencies[i]; //
            var promise_this_dependency_cached = this.require(dependency, {relative_path_root:relative_path_root, injection_require_type : "sync"}) // always pass a sync require when caching dependencies for a sync module
                .catch((err)=>{
                    console.warn("could not load dependency " + dependency + " found in " + relative_path_root);
                })
            promise_all_dependencies_cached.push(promise_this_dependency_cached);
        }
        return Promise.all(promise_all_dependencies_cached);
    },


    /*
        options functionality
    */
    options_functionality : {
        extract_relative_path_root : function(options){
            if(typeof options != "undefined" && typeof options.relative_path_root != "undefined"){ // if rel_path is defined,  use it; occurs when we are in modules
                var relative_path_root = options.relative_path_root;
            } else { // if rel_path not defined, we are not loading from another module; retreive the directory (strip filename + query) from the main window.location.href
                if(typeof window != "undefined"){
                    var relative_path_root = window.location.href.substring(0, window.location.href.lastIndexOf("/")) + "/";
                } else {

                }
            }
            return relative_path_root;
        },
        extract_injection_require_type : function(options){ // NOTE - this is ignored for node modules; node modules can define their own modes.
            if(typeof options != "undefined" && typeof options.injection_require_type != "undefined"){ // if injection_require_type is defined, use it; occurs automatically when we are in modules and by user request
                var injection_require_type = options.injection_require_type;
            } else { // if injection_require_type not defined, we are not loading from another module; async by default.
                var injection_require_type = "async";
            }
            return injection_require_type;
        },
        cleanse_resolve_requests : function(options){
            if(typeof options == "undefined") options = {};
            if(typeof options.resolve == "undefined") options.resolve = [];
            if(typeof options.resolve == "string") options.resolve = [options.resolve]; // cast string to array
            if(!Array.isArray(options.resolve)){ options.resolve = []; console.warn("options.resolve not defined as an array or string. skipping.");} // make sure datatype is valid
            if(options.resolve.length == 0) options.resolve.push("content"); // if its empty, then add the default mode: content
            return options.resolve;
        },
    },


    /*
        define cache_path
    */
    generate_cache_path : function(request, options){
        var relative_path_root = this.options_functionality.extract_relative_path_root(options);
        var [request, analysis] = this.normalize_and_analyze_request_path(request, relative_path_root);
        var cache_path = request; // defines absolute path to file being loaded. For modules, defines path to package.json
        if(analysis.is_a_module) cache_path = "module:" + cache_path; // since modules return package.json request, distinguish between module requests and actual requests to package.json
        return cache_path;
    },

    /*
        builds the resolved content
            - considers options.functions
            - considers options.resolve
    */
    generate_resolution_based_on_options : function(cache, options){ // TODO - simplify this functionality
        var resolve_requests = this.options_functionality.cleanse_resolve_requests(options); // parse the request options (e.g., does user want only the content? only the path? both? etc)

        if(resolve_requests.indexOf("content") > -1){ // append content if user requested it
            var promise_content = cache.promise_content;
        } else {
            var promise_content = Promise.resolve(false);
        }

        if(resolve_requests.indexOf("path") > -1){ // append the path if user requested it
            var promise_path = cache.promise_path;
        } else {
            var promise_path = Promise.resolve(false);
        }

        var promise_resolution = Promise.all([promise_content, promise_path]) // build the final resolution object the user will receive after resolving the `request` function
            .then(([content, path])=>{
                var resolution = {};
                if(content !== false) resolution["content"] = content;
                if(path !== false) resolution["path"] = path;

                if(Object.keys(resolution).length == 1) resolution = resolution[Object.keys(resolution)[0]]; // for convinience, if only one element is requested to be resolved, resolve it without the object wrapper.
                return resolution;
            })

        return promise_resolution;
    },

    /*
        self analysis
    */
    _unique_cache_requests : [],

    /*
        the bread and butter
            - parse the request, load the file, resolve the content
            - ensures that promise is only queued once with caching
    */
    _cache : {promise : {}, content : {}}, // promise for async, content for sync
    promise_to_require : function(module_or_path, options){
        var cache_path = this.generate_cache_path(module_or_path, options);
        if(typeof this._cache.promise[cache_path] == "undefined"){ // if not in cache, build into cache
            //console.log("(!) `" + cache_path + "` is not already in cache. defining promise to cache");
            this._unique_cache_requests.push(cache_path);

            var relative_path_root = this.options_functionality.extract_relative_path_root(options);
            var injection_require_type = this.options_functionality.extract_injection_require_type(options); // this is overwritten when loading node modules and sync require can not reqeust an async injection_require_type (since that sync require would then become async).

            var promise_request_details = this.promise_request_details(module_or_path, relative_path_root, injection_require_type); // returns {type, path, injection_require_type, dependencies}; type from [npm, js, json, css, html]; path is an absolute path to file; require mode from ["sync", "async"]
            var promise_path = promise_request_details.then((request)=>{return request.path});
            var promise_content = promise_request_details
                .then((request)=>{
                    /*
                        this is the main (and most obvious) downfall of synchronous_require; waiting until all dependencies load.
                            - with async reqeusts dependencies are [] and no waiting occurs.
                    */
                    var dependency_relative_path_root = request.path.substring(0, request.path.lastIndexOf("/")) + "/";
                    return this.promise_dependencies_loaded(request.dependencies, dependency_relative_path_root)
                        .then(()=>{
                            return request;
                        })
                })
                .then((request)=>{
                    return this.loader_functions[request.type](request.path, request.injection_require_type); // loader_function[type](path, injection_require_type)
                })
                .then((content)=>{
                    this._cache.content[cache_path] = content; // assign content to cache to enable synchronous retreival
                    return this._cache.content[cache_path]; // pull content from cache to reduce data duplication
                })
            this._cache.promise[cache_path] = {promise_content: promise_content, promise_path : promise_path}; // cache the promise (and consequently the result)
        }

        var cached_promise = this._cache.promise[cache_path];
        var promise_resolution = this.generate_resolution_based_on_options(cached_promise, options);

        return promise_resolution;
    },
    synchronous_require : function(request, options){
        // NOTE - synchronous_require is ONLY usable from required scripts and is automatically injected.
        // synchronous require expects all dependencies to already be loaded into cache.
        var cache_path = this.generate_cache_path(request, options);
        return this._cache.content[cache_path];
    },
    require : function(request, options){
        //console.log("requesting a promsie require : " + request);
        return clientside_require.promise_to_require(request, options);
    }, // convinience handler
}


/*
    helper functions
*/
var clientside_require_helpers = {

    /*
        utility to define modules_root in browsers based on browser environment
    */
    environment_is_browser : function(){
        return typeof window != "undefined" && window.location != "undefined";
    },
    extract_modules_root_from_browser_environment : function(){
        if(typeof window.node_modules_root == "undefined"){
            return  // if not explicitly defined by user, assume node_modules are defined in origin location
        } else {
            return window.node_modules_root; // if defined, then use what was defined
        }
    },
    define_modules_root : function(injected_modules_root){
        if(typeof injected_modules_root == "string") var modules_root = injected_modules_root;
        if(typeof modules_root == "undefined" && this.environment_is_browser()) var modules_root = this.extract_modules_root_from_browser_environment();

    }
}





Clientside_Require.prototype.loader_functions =






/*
    for when the module is loaded as a script file directly into the document
        - detected by checking if require is defined; native browser documents do not have this property defined (unlike node and unlike documents loaded by require module)
*/
if(typeof require == "undefined"){ // if require is not defined, we are being loaded in a browser as a script
    if(!clientside_require_helpers.environment_is_browser()) throw new Error("require is not defined and we are not in a browser. environment unknown.")
    if(typeof window.require_global == "undefined") window.require_global = {}; // initialize require_global by default if not already initialized
    clientside_require_helpers.define_modules_root(); // define the modules root based on environment
    var require = clientside_require.require; // create global `require` function
}

/*
    define exports function to be used in CommonJS require environments (e.g., node and clientside require)
        - returns a function which passes "module_root" as a parameter
*/
module.exports = function(module_root){ // if being utilized as module, expect that user will define module root
    clientside_require_helpers.define_modules_root(module_root); // define the modules root

}

    module.exports = clientside_require.require;
    (function(){
        var location_exists = typeof window != "undefined" && typeof ;
        var browser_definition_exists = typeof window != "undefined" && typeof window.node_modules_root != "undefined";
        var node_definition_exists = typeof process != "undefined" && typeof process.env.node_modules_root != "undefined";
        if(browser_definition_exists)return window.node_modules_root; // if a browser execution defined it, use it
        if(node_definition_exists) return process.env.node_modules_root; //if a node execution defined it, use it
        if(location_exists) return location.origin + "/node_modules/"; // if we're in a browser and it wasn't explicitly defined, use /node_modules/ as default
        throw new Error("node_modules_root was not defined by node process.");
    })()
}
