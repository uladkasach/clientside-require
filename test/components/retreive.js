var assert = require("assert");
var modules_root = "file:///"+ process.env.test_env_root + "/custom_node_modules";
var default_options = require(process.env.src_root + "/utilities/normalize_request_options.js")();

/*
    retreiver combines loading utils with request decomposition functionality
*/
describe('retreive', function(){
    it('should initialize', function(){
        var retreive = require(process.env.src_root + "/retreive.js");
    })
    it('should be able to retreive a node module - async', async function(){
        var retreive = require(process.env.src_root + "/retreive.js");
        var request = "async"; // async module
        var content = await retreive.promise_to_retreive_content(request, modules_root, default_options);
        assert.equal(content.foo, "bar");
    })
    it('should be able to retreive a node module with dependencies preloaded - sync', async function(){
        var retreive = require(process.env.src_root + "/retreive.js");
        var request = "sync_dependencies"; // sync_dependencies module
        var content = await retreive.promise_to_retreive_content(request, modules_root, default_options);
        assert.equal(content.result, "success");
        assert.equal(content.deps.length, 2, "dependencies length is correct");
        assert.equal(content.deps[0], "dep-one", "dependency one was loaded correctly")
        assert.equal(content.deps[1], "dep-two", "dependency two was loaded correctly")
    })
    it('should throw an informative error when the path is not valid', async function(){
        var retreive = require(process.env.src_root + "/retreive.js");
        var request = "http://error_path.localhost/file.js"; // some invalid js file
        var content = await retreive.promise_to_retreive_content(request, modules_root, default_options);
        console.log(content)
    })
})
