/*
    loading functionality
        - top level functions preserve content scope (e.g., when loading the javascript we dont pollute the global scope and instead all of the module.exports content is resolved)
        - basic[] functions do not nessesarily preserve content scope
        - helper functions support top level functions
*/
module.exports = {
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

                frame.contentWindow.HTMLElement = HTMLElement; // pass HTMLElement object

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
}
