var assert = require("assert");
describe('test_modules', function(){
    it('should be able to load a module', async function(){
        // update clientside_require module
        var clientside_require = require(process.env.src_root + '/index.js');
        window.clientside_require = clientside_require;
        clientside_require.modules_root = "file:///"+ process.env.test_env_root + "/custom_node_modules";

        // retreive module
        var content = await clientside_require.asynchronous_require("async");
        var unique_requsts = clientside_require.cache._unique_requests;
        assert.equal(content.foo, "bar");
    })
    it('should have cached the module', async function(){
        // update clientside_require module
        var clientside_require = require(process.env.src_root + '/index.js');
        window.clientside_require = clientside_require;
        clientside_require.modules_root = "file:///"+ process.env.test_env_root + "/custom_node_modules";

        // retreive module
        var unique_requsts = clientside_require.cache._unique_requests;
        assert.equal(unique_requsts.length, 1);
    })
    it('should not create a duplicate request if module was already cached', async function(){
        // update clientside_require module
        var clientside_require = require(process.env.src_root + '/index.js');
        window.clientside_require = clientside_require;
        clientside_require.modules_root = "file:///"+ process.env.test_env_root + "/custom_node_modules";

        // retreive module
        await window.clientside_require.asynchronous_require("async");
        var unique_requsts = clientside_require.cache._unique_requests;
        assert.equal(unique_requsts.length, 1);
    })
    it('should throw an error if the module does not exist', async function(){
        var clientside_require = require(process.env.src_root + '/index.js');
        window.clientside_require = clientside_require;
        clientside_require.modules_root = "test-env.clientside-require.localhost/custom_node_modules";
        try {
            var content = await clientside_require.asynchronous_require("nonexistant_module");
            throw new Error("should not reach here");
        } catch (error){
            assert.equal(error.message, "404", "error message should be `404`")
        }
    })
})
