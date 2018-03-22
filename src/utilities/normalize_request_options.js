module.exports = function(options){
    if(typeof options == "undefined") options = {}; // ensure options are defined
    if(typeof options.relative_path_root == "undefined"){ // if relative path root not defined, default to dir based on location path
        var current_path = window.location.href;
        options.relative_path_root = current_path.substring(0, current_path.lastIndexOf("/")) + "/";
    };
    if(typeof options.require !== "undefined") options.injection_require_type = options.require; // convinience casting
    if(typeof options.injection_require_type == "undefined"){ // if injection require type is not defined, default to async
        options.injection_require_type = "async";
    }
    return options;
}
