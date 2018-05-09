var assert = require("assert");
describe('test_modules', function(){
    it('should be able to load a module with a load statement in it', async function(){
        // update clientside_require module
        var clientside_require = require(process.env.src_root + '/index.js');
        window.clientside_require = clientside_require;
        clientside_require.modules_root = "file:///"+ process.env.test_env_root + "/custom_node_modules";

        // retreive module
        var content = await clientside_require.asynchronous_require("load_module_in_module");
        assert.equal(content.foo, "bar"); // NOTICE: the resolution of "content" resolves the exported "load" promise (see module.exports for the `load_module_in_module` pacakge)
    })
    it('should find a promise as the output of a `load` inside of a `load`', async function(){
        // update clientside_require module
        var clientside_require = require(process.env.src_root + '/index.js');
        window.clientside_require = clientside_require;
        clientside_require.modules_root = "file:///"+ process.env.test_env_root + "/custom_node_modules";

        // retreive module
        var content = await clientside_require.asynchronous_require("load_module_in_module_stringify");
        assert.equal(content, "{}"); // JSON.stringify(Promise.resolve({foo:"bar"})) == "{}"
    })
    it('should be able to load a module with a require statement in it', async function(){
        // update clientside_require module
        var clientside_require = require(process.env.src_root + '/index.js');
        window.clientside_require = clientside_require;
        clientside_require.modules_root = "file:///"+ process.env.test_env_root + "/custom_node_modules";

        // retreive module
        var content = await clientside_require.asynchronous_require("require_module_in_module");
        assert.equal(content.foo, "bar"); // NOTICE: the resolution of "content" resolves the exported "load" promise (see module.exports for the `load_module_in_module` pacakge)
    })
    it('should find a real object as the output of a `require` inside of a `load`', async function(){
        // update clientside_require module
        var clientside_require = require(process.env.src_root + '/index.js');
        window.clientside_require = clientside_require;
        clientside_require.modules_root = "file:///"+ process.env.test_env_root + "/custom_node_modules";

        // retreive module
        var content = await clientside_require.asynchronous_require("require_module_in_module_stringify");
        assert.equal(content, '{"foo":"bar"}');
    })
})
