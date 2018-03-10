var basic_loaders = require("./basic.js");
/*
    loading functionality which preserves scope
        - notably preserves scope when loading js content with CommonJS style exports

    TODO: find way to preserve scope with css styles
*/
module.exports = {
    js : function(path, injection_require_type){ return commonjs_loader.promise_to_retreive_exports(path, injection_require_type)},
    json : function(path){ return basic_loaders.promise_to_retreive_json(path) },
    html : function(path){ return basic_loaders.promise_to_get_content_from_file(path) },
    css : function(path){ return basic_loaders.promise_to_load_css_into_window(path) },
}
