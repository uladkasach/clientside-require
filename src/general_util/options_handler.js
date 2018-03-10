/*
    options functionality - handles options defined in requests
*/
var options_functionality = {
    extract_injection_require_type : function(options){ // NOTE - this is ignored for node modules; node modules can define their own modes.
        if(typeof options != "undefined" && typeof options.injection_require_type != "undefined"){ // if injection_require_type is defined, use it; occurs automatically when we are in modules and by user request
            var injection_require_type = options.injection_require_type;
        } else { // if injection_require_type not defined, we are not loading from another module; async by default.
            var injection_require_type = "async";
        }
        return injection_require_type;
    },
}

module.exports = options_functionality;
