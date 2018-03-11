var assert = require("assert");
describe('basic', function(){
    it('should initialize', function(){
        window.node_modules_root = "file:///"+ process.env.test_env_root + "/node_modules";
        var clientside_require = require(process.env.src_root + '/index.js');
        window.clientside_require = clientside_require; // update window definition of clientside_require to actual module
    })
    it('should be able to load a module', async function(){
        var content = await window.clientside_require.asynchronous_require("async");
        assert.equal(content, "the data");
    })
    it('should have cached the module', async function(){
        var unique_requsts = window.clientside_require.cache._unique_requests;
        assert.equal(unique_requsts.length, 1);
    })
    it('should not create a duplicate request if module was already cached', async function(){
        await window.clientside_require.asynchronous_require("async");
        var unique_requsts = window.clientside_require.cache._unique_requests;
        assert.equal(unique_requsts.length, 1);
    })
})
