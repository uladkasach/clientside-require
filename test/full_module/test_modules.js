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
})
