/*
    retreival_manager handles placing requests to load content. handles sync and async requires.
*/
module.exports = {
    /*
        define utils
    */
    utils : {
        loader_functions : require("./loading_utilities/scoped.js"),
        normalize_path : require("./request_analysis/normalize_path.js"),
        promise_to_decompose_request : require("./request_analysis/decompose_request.js"),
        promise_dependencies_are_loaded : require("./sync_dependencies_managment/promise_dependencies_loaded.js"),
    }

    /*
        the bread and butter
            - parse the request, load the file, resolve the content
    */
    promise_to_retreive_content : async function(cache_path, request, options){
        /*
            extract request details for this request
        */
        var request_details = await this.utils.promise_to_decompose_request(request, options.relative_path_root, options.injection_require_type)

        /*
            load dependencies into cache before loading the main file
                - recursive operation
        */
        if(request_details.injection_require_type == "sync"){
            // this is the main (and most obvious) downfall of synchronous_require; waiting until all dependencies load.
            var dependency_relative_path_root = request_details.path.substring(0, request_details.path.lastIndexOf("/")) + "/";
            await this.utils.promise_dependencies_are_loaded(request.dependencies, dependency_relative_path_root); // wait untill dependencies are loaded
        }

        /*
            retreive content with loader functions
                - handles scoping and env setup of js files (retreives content based on CommonJS exports)
                - supports js, css, html, json, txt, etc
        */
        var content = await this.utils.loader_functions[request_details.type](request_details.path, request_details.injection_require_type);

        /*
            resolve with content
        */
        return content;
    },

}
