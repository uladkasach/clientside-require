var test_paths = {
    json : "file:///"+ process.env.test_env_root + "/basic_content/test_json.json",
    html : "file:///"+ process.env.test_env_root + "/basic_content/test_html.html",
    css : "file:///"+ process.env.test_env_root + "/basic_content/test_css.css",
    js : "file:///"+ process.env.test_env_root + "/basic_content/test_js.js",
    js_commonjs : "file:///"+ process.env.test_env_root + "/basic_content/test_js_commonjs.js",
}
var assert = require("assert");

describe('commonjs', function(){
    it("should initialize", function(){
        require(process.env.src_root + "/utilities/content_loading/commonjs.js");
    })
    it('should be able to create an iframe', async function(){
        var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
        await commonjs_loader.helpers.promise_to_create_frame();
    })
    it('should be able to generate require function to inject - async', async function(){
        var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
        window.clientside_require = { // define a placeholder clientside_require function that we can test which require funciton was injected based on
            asynchronous_require : function(){return "async"},
            synchronous_require : function(){return "sync"}
        };
        var require_function = commonjs_loader.helpers.generate_require_function_to_inject("relative/path/root/test.ext", "async");
        assert.equal(require_function(), "async", "require function should be async")
    })
    it('should be able to generate require function to inject - sync', async function(){
        var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
        window.clientside_require = { // define a placeholder clientside_require function that we can test which require funciton was injected based on
            asynchronous_require : function(){return "async"},
            synchronous_require : function(){return "sync"}
        };
        var require_function = commonjs_loader.helpers.generate_require_function_to_inject("relative/path/root/test.ext", "sync");
        assert.equal(require_function(), "sync", "require function should be sync")
    })
    it('should be able to provision iframe environment', async function(){
        var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
        var frame = await commonjs_loader.helpers.promise_to_create_frame();
        commonjs_loader.provision.clientside_require_variables(frame);
        commonjs_loader.provision.browser_variables(frame);
        commonjs_loader.provision.commonjs_variables(frame, null);
    })
    it('should be able to load js into iframe', async function(){
        var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
        var frame = await commonjs_loader.helpers.promise_to_create_frame();
        commonjs_loader.provision.commonjs_variables(frame, null);
        commonjs_loader.helpers.load_module_into_frame(test_paths.js_commonjs, frame);
    })
    it('should be able to retreive CommonJS exports while preserving scope', async function(){
        var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
        var frame = await commonjs_loader.helpers.promise_to_create_frame();
        commonjs_loader.provision.commonjs_variables(frame, null);
        await commonjs_loader.helpers.load_module_into_frame(test_paths.js_commonjs, frame);
        var exports = await commonjs_loader.helpers.extract_exports_from_frame(frame);
        assert.equal(exports.foo, "bar", "value extracted correctly");
        assert(typeof window.module == "undefined"); // global scope not polluted
    })
    it('should be able to remove frame from dom', async function(){
        var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
        var frame = await commonjs_loader.helpers.promise_to_create_frame();
        commonjs_loader.helpers.remove_frame(frame);
    })
})
