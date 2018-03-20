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
    it('should throw an error if the file does not exist', async function(){
        this.skip();
        /*
            in the browser a 404 error is automatically thrown. only w/ jsdom in node do we get obscure messages for this.
            not implementing any time soon. seperate branch exists for a potential implementation.
        */
    })
    it('should throw an error if the module does not exist', async function(){
        var retreive = require(process.env.src_root + "/retreive.js");
        var request = "non-existant-module"; // sync_dependencies module
        try {
            var content = await retreive.promise_to_retreive_content(request, modules_root, default_options);
            throw new Error("should not reach here");
        } catch (error){
            assert.equal(error.code, 404, "error code should be `404`")
            assert.equal(error.message, "Request Error : 404 : file:////var/www/git/More/clientside-require/test/_env/custom_node_modules/non-existant-module/package.json", "error message should be expected")
        }
    })
})
