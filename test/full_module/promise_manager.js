var assert = require("assert");
describe('promise_manager', function(){
    it('should find that promise manager waits for all modules - one module', async function(){
        // update clientside_require module
        var clientside_require = require(process.env.src_root + '/index.js');
        window.clientside_require = clientside_require;
        clientside_require.modules_root = "file:///"+ process.env.test_env_root + "/node_modules";

        // reset cache to clean test environment
        clientside_require.cache.reset();
        clientside_require.promise_manager.reset();

        // queue requests
        clientside_require.asynchronous_require("color-name");

        // ensure that all modules are waited for
        var promises = await clientside_require.promise_all;
        assert.equal(promises.length, 1, "assert length of promises is accurate");
        assert.equal(typeof promises[0].aqua, "object", "ensure that the first promise resolves the `color-name` object");
    })
    it('should find that promise manager waits for all modules - one module with sync dependencies', async function(){
        // update clientside_require module
        var clientside_require = require(process.env.src_root + '/index.js');
        window.clientside_require = clientside_require;
        clientside_require.modules_root = "file:///"+ process.env.test_env_root + "/custom_node_modules";

        // reset cache to clean test environment
        clientside_require.cache.reset();
        clientside_require.promise_manager.reset();

        // queue requests
        clientside_require.asynchronous_require("sync_dependencies");

        // ensure that all modules are waited for
        var promises = await clientside_require.promise_all;
        assert.equal(promises.length, 3, "assert length of promises is accurate");
        assert.equal(typeof promises[0], "object", "first element should be an object");
    })
    it('should find that promise manager waits for all modules - one module with async dependencies', async function(){
        // update clientside_require module
        var clientside_require = require(process.env.src_root + '/index.js');
        window.clientside_require = clientside_require;
        clientside_require.modules_root = "file:///"+ process.env.test_env_root + "/custom_node_modules";

        // reset cache to clean test environment
        clientside_require.cache.reset();
        clientside_require.promise_manager.reset();

        // queue requests
        clientside_require.asynchronous_require("async_dependencies");

        // ensure that all modules are waited for
        var promises = await clientside_require.promise_all;
        assert.equal(promises.length, 3, "assert length of promises is accurate");
        assert.equal(typeof promises[0], "object", "first element should be an object");
    })
})
