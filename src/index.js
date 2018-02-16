
var clientside_require = { // a singleton object
    modules_root : (typeof window.node_modules_root == "undefined")? location.origin + "/node_modules/" : window.node_modules_root, // define root; default is /node_modules/

    /*
        loading functionality
            - top level functions preserve content scope (e.g., when loading the javascript we dont pollute the global scope and instead all of the module.exports content is resolved)
            - basic[] functions do not nessesarily preserve content scope
            - helper functions support top level functions
    */
    loader_functions : {
        js : function(path, injection_require_type){ // this is the only special function since we need to scope the contents properly
            var promise_frame_loaded = this.helpers.promise_to_create_frame();
            var promise_exports = promise_frame_loaded
                .then((frame)=>{
                    //console.log("frame loaded. document : ")
                    /*
                        NOTE (important) : the contentWindow properties defined will be availible in the loaded modules BUT NOT availible to the clientside-module-manager;
                                            clientside module manager is only accessible by the contentWindow.require  function that is passed;
                                            the clientside-module-manager (this object) will have the same global window as the main file at ALL times.
                    */
                    frame.contentWindow.module = {exports : {}};
                    frame.contentWindow.exports = frame.contentWindow.module.exports; // create a reference from "exports" to modules.exports

                    frame.contentWindow.console = console; // pass the console functionality
                    frame.contentWindow.alert = alert; // pass the alert functionality
                    frame.contentWindow.confirm = confirm; // pass the confirm functionality
                    frame.contentWindow.prompt = prompt; // pass the prompt functionality

                    frame.contentWindow.XMLHttpRequest = XMLHttpRequest; // pass the XMLHttpRequest functionality; using iframe's will result in an error as we delete the iframe that it is from
                    frame.contentWindow.require_global = (typeof window.require_global == "undefined")? {} : window.require_global; // pass by reference require global; set {} if it was not already defined by user

                    //console.log("injecting " + injection_require_type + " promise into frame at path " + path);
                    frame.contentWindow.require = function(request, options){ // wrap  ensure relative path root and injection_require_type is defined for all requests made from js files
                        if(typeof options == "undefined") options = {}; // define options if not yet defined
                        options.relative_path_root = path.substring(0, path.lastIndexOf("/")) + "/"; // overwrite relative_path_root to path to this file without the filename
                        if(typeof options.injection_require_type == "undefined") options.injection_require_type  = injection_require_type; // if not defined by user, use parental

                        //console.log("a " + injection_require_type + " require was called from " + path + " to " + request);
                        if(injection_require_type == "async"){
                            return clientside_require.require(request, options)
                        } else if(injection_require_type == "sync"){
                            options.injection_require_type = "sync"; // requires from sync_requre must always be sync_require
                            return clientside_require.synchronous_require(request, options);
                        } else {
                            console.error("require mode invalid; dev error with clientside-module-manager.");
                            return false;
                        }
                    };

                    var frame_document = frame.contentWindow.document;
                    return this.basic.promise_to_load_script_into_document(path, frame_document)
                })
                .then((frame_document)=>{
                    var frame_window = frame_document.defaultView;
                    //console.log(frame_window);
                    //console.log(frame_window.module)
                    return(frame_window.module.exports);
                })

            var promise_to_remove_frame = Promise.all([promise_frame_loaded, promise_exports])
                .then(([frame, __])=>{
                    frame.parentNode.removeChild(frame);
                })

            var promise_exports_and_removal = Promise.all([promise_exports, promise_frame_loaded])
                .then(([exports, __])=>{
                    //console.log("exports:");
                    //console.log(exports);
                    return exports;
                })

           var resolution_promise = promise_exports_and_removal; // rename the promise to be explicit that this promise we will resolve

            return resolution_promise;
        },
        json : function(path){ return this.basic.promise_to_retreive_json(path) },
        html : function(path){ return this.basic.promise_to_get_content_from_file(path) },
        css : function(path){ return this.basic.promise_to_load_css_into_window(path) },
        basic : {
            promise_to_load_script_into_document : function(script_src, target_document){
                if(typeof target_document == "undefined") target_document = window.document; // if no document is specified, assume its the window's document
                return new Promise((resolve, reject)=>{
                    var script = document.createElement('script');
                    script.setAttribute("src", script_src);
                    script.onload = function(){
                        resolve(target_document);
                    };
                    target_document.getElementsByTagName('head')[0].appendChild(script);
                })
            },
            promise_to_retreive_json : function(json_source){
                return new Promise((resolve, reject)=>{
                    var xhr = new XMLHttpRequest();
                    xhr.overrideMimeType("application/json");
                    xhr.open("GET", json_source, true);
                    xhr.onload = function(){
                        if(this.status == "404") throw {type : "404"};
                        try {
                            resolve(JSON.parse(this.responseText));
                        } catch (err){
                            throw (err);
                        }
                    };
                    xhr.onerror = function(error){
                        throw (error);
                    };
                    xhr.send();
                })
            },
            promise_to_load_css_into_window : function(styles_href, target_document){
                if(typeof target_document == "undefined") target_document = window.document; // if no document is specified, assume its the window's document
                // <link rel="stylesheet" type="text/css" href="/_global/CSS/spinners.css">
                return new Promise((resolve, reject)=>{
                    var styles = document.createElement('link');
                    styles.type = "text/css";
                    styles.rel = 'stylesheet';
                    styles.href = styles_href;
                    styles.onload = function(){
                        resolve(target_document);
                    };
                    target_document.getElementsByTagName('head')[0].appendChild(styles);
                })
            },
            promise_to_get_content_from_file : function(destination_path){
                return new Promise((resolve, reject)=>{
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", destination_path, true);
                    xhr.onload = function(){
                        resolve(this.responseText)
                    };
                    xhr.send();
                })
            },
        },
        helpers : {
            promise_to_create_frame : function(){
                return new Promise((resolve, reject)=>{
                    //console.log("building promise");
                    var frame = document.createElement('iframe');
                    frame.onload = function(){resolve(frame)};
                    frame.style.display = "none"; // dont display the iframe
                    document.querySelector("html").appendChild(frame);
                })
            }
        },
    },

    /*
        extract request details
            - is it an npm module reference? if so then we need to generate the path to the main file
            - what filetype should we load?
    */
    promise_request_details : function(request, relative_path_root, injection_require_type){
        /*
            analyze request
        */
        var is_relative_path = request.indexOf("./") == 0; // then it is a path of form "./somepath", a relative path as defined by node
        var is_a_path = request.indexOf("/") > -1; // make sure not node_relative_path
        var extension = request.slice(1).split('.').pop(); // slice(1) to skip the first letter - avoids error of assuming extension exists if is_relative_path
        var exists_file_extension = extension != request.slice(1); // if the "extension" is the full evaluated string, then there is no extension

        /*
        console.log("request : " + request);
        var details = {
            is_relative_path:is_relative_path,
            is_a_path:is_a_path,
            exists_file_extension:exists_file_extension,
        }
        console.log(JSON.stringify(details));
        */

        /*
            modify request based on analysis (make assumptions)
        */
        if(is_a_path && !exists_file_extension){  // if not a node module (i.e., is a path) and there is no extension,
            extension = "js"; // then it implies a js file
            request += ".js";
            // TODO (#11) - sometimes this referes to a directory, how to detect whether directory or file?
                // if directory we need to go to request/index.js
                // may want to just attempt to load it and if we find an error assume its a directory and try that too
        }
        if(is_relative_path){ // if its a relative path,
            request = request.slice(2); //  remove the "./" at the begining
        }

        /*
            generate details with special care for node modules
        */
        if(!is_a_path && !exists_file_extension){ // if not a path and no file extension, assume its a node_module.
            var package_json_path = this.modules_root + request + "/package.json";
            var promise_details = this.loader_functions.basic.promise_to_retreive_json(package_json_path)
                .then((package_json)=>{
                    /*
                        core functionality
                    */
                    var base_path = this.modules_root + request + "/";
                    var main = package_json.main;
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
        } else if(is_a_path && ["js", "json", "css", "html"].indexOf(extension) > -1){ // if its an acceptable extension and not defining a module
            var path = request; // since its not defining a module, the request has path information
            if(is_relative_path) path = relative_path_root + path; // if relative path, use the relative_path_root to generate an absolute path

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
                var relative_path_root = window.location.href.substring(0, window.location.href.lastIndexOf("/")) + "/";
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
        generate_cache_path : function(request, options){
            // TODO - make smarter cachepath derivation. this does not map absolutely to all file
            var relative_path_root = this.extract_relative_path_root(options);
            var cache_path = relative_path_root + request;
            return cache_path;
        }
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
        the bread and butter
            - parse the request, load the file, resolve the content
            - ensures that promise is only queued once with caching
    */
    _cache : {promise : {}, content : {}}, // promise for async, content for sync
    promise_to_require : function(module_or_path, options){
        var cache_path = this.options_functionality.generate_cache_path(module_or_path, options);
        if(typeof this._cache.promise[cache_path] == "undefined"){ // if not in cache, build into cache
            // console.log("(!) " + module_or_path + " is not already in cache. defining promise to cache");
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
        var cache_path = this.options_functionality.generate_cache_path(request, options);
        return this._cache.content[cache_path];
    },
    require : function(request, options){
        //console.log("requesting a promsie require : " + request);
        return clientside_require.promise_to_require(request, options);
    }, // convinience handler
}

if(typeof window.require_global == "undefined") window.require_global = {}; // initialize require_global by default if not already initialized
var require = clientside_require.require; // create global `require` function
