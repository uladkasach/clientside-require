var test_paths = {
    json : "file:///"+ process.env.test_env_root + "/basic_content/test_json.json",
    html : "file:///"+ process.env.test_env_root + "/basic_content/test_html.html",
    css : "file:///"+ process.env.test_env_root + "/basic_content/test_css.css",
    js : "file:///"+ process.env.test_env_root + "/basic_content/test_js.js",
    js_commonjs : "file:///"+ process.env.test_env_root + "/basic_content/test_js_commonjs.js",
    reference_clientside_require : "file:///"+ process.env.test_env_root + "/test_js/reference_clientside_require_in_module.js",
    reference_window : "file:///"+ process.env.test_env_root + "/test_js/reference_window_in_module.js",
    reference_load : "file:///"+ process.env.test_env_root + "/test_js/reference_load_in_module.js",
    reference_require : "file:///"+ process.env.test_env_root + "/test_js/reference_require_in_module.js",
    reference_root_window : "file:///"+ process.env.test_env_root + "/test_js/reference_root_window_in_module.js",
    reference_location : "file:///"+ process.env.test_env_root + "/test_js/reference_location_in_module.js",

}
var assert = require("assert");

describe('commonjs', function(){
    describe('loading', function(){
        it("should initialize", function(){
            require(process.env.src_root + "/utilities/content_loading/commonjs.js");
        })
        it('should be able to create an iframe', async function(){
            var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
            return commonjs_loader.helpers.promise_to_create_frame()
        })
        it('should be able to generate require function to inject - async', async function(){
            var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
            var require_function = commonjs_loader.helpers.generate_require_function_to_inject("relative/path/root/test.ext", "async");
            assert.equal(typeof require_function(), "object", "sync require function should return a promise")
        })
        it('should be able to generate require function to inject - sync', async function(){
            var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
            var require_function = commonjs_loader.helpers.generate_require_function_to_inject("relative/path/root/test.ext", "sync");
            assert.equal(typeof require_function(), "string", "sync require function should return a string")
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
        it('should be able to retreive CommonJS-style exports while preserving scope', async function(){
            var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
            var frame = await commonjs_loader.helpers.promise_to_create_frame();
            commonjs_loader.provision.commonjs_variables(frame, null);
            await commonjs_loader.helpers.load_module_into_frame(test_paths.js_commonjs, frame);
            var exports = await commonjs_loader.helpers.extract_exports_from_frame(frame);
            assert.equal(exports.foo, "bar", "value extracted correctly");
            assert(typeof window.module == "undefined", "global scope not polluted");
        })
        it('should be able to remove frame from dom', async function(){
            var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
            var frame = await commonjs_loader.helpers.promise_to_create_frame();
            commonjs_loader.helpers.remove_frame(frame);
        })
        it('integration: should be able to retreive exports with scope preserved', async function(){
            var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
            var exports = await commonjs_loader.promise_to_retreive_exports(test_paths.js_commonjs, "async");
            assert.equal(exports.foo, "bar", "value extracted correctly");
            assert(typeof window.module == "undefined", "global scope not polluted");
        })
    })
    describe("loaded environment", function(){
        it('should define window in the modules environment', async function(){
            var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
            var exports = await commonjs_loader.promise_to_retreive_exports(test_paths.reference_window, "async");
            assert.equal(typeof exports, "object", "window should be defined");
            assert.equal(typeof exports.document, "object", "window.document should be defined");
        })
        it("should define window.clientside_require in the modules environment", async function(){
            var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
            var exports = await commonjs_loader.promise_to_retreive_exports(test_paths.reference_clientside_require, "async");
            assert.equal(typeof exports, "object", "window.clientside_require should be defined");
            assert.equal(typeof exports.asynchronous_require, "function", "window.clientside_require.asynchronous_require should be defined");
        })
        it('should define window.require in the modules environment', async function(){
            var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
            var exports = await commonjs_loader.promise_to_retreive_exports(test_paths.reference_load, "async");
            assert.equal(typeof exports, "function", "require method should be defined");
        })
        it('should define window.load in the modules environment', async function(){
            var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
            var exports = await commonjs_loader.promise_to_retreive_exports(test_paths.reference_require, "async");
            assert.equal(typeof exports, "function", "load method should be defined");
        })
        it('should define window.root_window in the modules environment', async function(){
            var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
            var exports = await commonjs_loader.promise_to_retreive_exports(test_paths.reference_root_window, "async");
            assert.equal(typeof exports, "object", "root_window should be defined");
        })
        it('should define window.location in the modules environment accurately', async function(){
            var commonjs_loader = require(process.env.src_root + "/utilities/content_loading/commonjs.js");
            var exports = await commonjs_loader.promise_to_retreive_exports(test_paths.reference_location, "async");
            assert.equal(typeof exports, "object", "location should be defined");
            assert.equal(exports.href, "file:///var/www/git/More/clientside-require/test/_env/test_js/reference_location_in_module.js")
            assert.equal(exports.protocol, "file:")
            assert.equal(exports.pathname, "/var/www/git/More/clientside-require/test/_env/test_js/reference_location_in_module.js")
        })
    })
})
