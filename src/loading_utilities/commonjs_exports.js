var basic_loaders = require("./basic.js");
/*
    meat and potatoes of clientside-require:
        1. loads modules in an iframe to preserve scope and returns the "exports" from the module
            - passes environmental variables expected to be present for browsers
                - console
                - alert
                - confirm
                - prompt
            - passes environmental variables expected to be present for CommonJS modules
                - module
                - exports
                - require
        2. determines whether to inject a synchronous or asynchronous require function
            - if synchronous then we have already recursivly parsed all dependencies that the loaded file has and all dependencies are already cached and ready to use synchronously
            - if asynchronous then we pass the regular clientside_require function which loads as usual
*/

/*
    NOTE (important) : the contentWindow properties defined will be availible in the loaded modules BUT NOT availible to the clientside-module-manager;
                        clientside module manager is only accessible by the contentWindow.require  function that is passed;
                        the clientside-module-manager (this object) will have the same global window as the main file at ALL times.
*/

module.exports = {
    promise_to_retreive_exports : async function(path, injection_require_type){

        /*
            create frame and define environmental variables
        */
        var frame = await this.helpers.promise_to_create_frame();

        // browser environment variables (those not present in iframes)
        frame.contentWindow.console = console; // pass the console functionality
        frame.contentWindow.alert = alert; // pass the alert functionality
        frame.contentWindow.confirm = confirm; // pass the confirm functionality
        frame.contentWindow.prompt = prompt; // pass the prompt functionality
        frame.contentWindow.HTMLElement = HTMLElement; // pass HTMLElement object
        frame.contentWindow.XMLHttpRequest = XMLHttpRequest; // pass the XMLHttpRequest functionality; using iframe's will result in an error as we delete the iframe that it is from

        // clientside_require specific variables
        frame.contentWindow.require_global = (typeof window.require_global == "undefined")? {} : window.require_global; // pass by reference require global; set {} if it was not already defined by user

        // CommonJS environment variables
        frame.contentWindow.module = {exports : {}};
        frame.contentWindow.exports = frame.contentWindow.module.exports; // create a reference from "exports" to modules.exports
        frame.contentWindow.require = this.helpers.generate_require_function_to_inject(path, injection_require_type); // inject a require function based on the injection type requested (sync / async)

        /*
            load the javascript into this newly provisioned (and scoped) environment and return the CommonJS style specified exports
        */
        // load the js and wait untill completed
        var frame_document = frame.contentWindow.document;
        await basic_loaders.promise_to_load_script_into_document(path, frame_document); // load the js into the document and wait untill completed

        // extract exports from the iframe document - now that the js file has populated that scope
        var frame_window = frame_document.defaultView;
        var exports = await frame_window.module.exports

        // remove the frame from the document to clean up now that we have the required module
        frame.parentNode.removeChild(frame);

        /*
            return the exports
        */
        return exports;
    },

    /*
        helper utilities
    */
    helpers : {
        generate_require_function_to_inject : function(path_to_file, injection_type){
            // extract relative path root
            var relative_path_root = path_to_file.substring(0, path_to_file.lastIndexOf("/")) + "/"; //  path to this file without the filename

            // get require function based on injection type
            if(injection_type == "async") var require_function = clientside_require.asynchronous_require;
            if(injection_type == "sync") var require_function = clientside_require.synchronous_require;
            if(typeof require_function == "undefined") throw new Error("require function definition invalid");

            // build the require function to inject
            var require_function_to_inject = function(request, options){
                if(typeof options == "undefined") options = {}; // define options if not yet defined
                options.relative_path_root = relative_path_root; // overwrite user defined rel path root - TODO - make this a private property
                return require_function(request, options);
            }
        },
        promise_to_create_frame : function(){
            return new Promise((resolve, reject)=>{
                //console.log("building promise");
                var frame = document.createElement('iframe');
                frame.onload = function(){resolve(frame)};
                frame.style.display = "none"; // dont display the iframe
                document.querySelector("html").appendChild(frame);
            })
        }
    }

}
