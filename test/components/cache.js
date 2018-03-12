var assert = require("assert");
var modules_root = "file:///"+ process.env.test_env_root + "/custom_node_modules";
var default_options = require(process.env.src_root + "/utilities/normalize_request_options.js")();

describe('cache', function(){
    it('should initialize', function(){
        var cache = require(process.env.src_root + "/cache.js");
    })
    it('should resolve with accurate cachepath for request - not module', function(){
        var cache = require(process.env.src_root + "/cache.js");
        var cache_path = cache.generate_cache_path_for_request("./test/path.js", modules_root, default_options);
        assert.equal(cache_path, "http://clientside-require.localhost/test/path.js", "should be an absolute path to the file");
    })
    it('should resolve with accurate cachepath for request - module', function(){
        var cache = require(process.env.src_root + "/cache.js");
        var cache_path = cache.generate_cache_path_for_request("async", modules_root, default_options);
        assert(cache_path.indexOf("module:") == 0, "`module:` is the first part of the string")
        assert.equal(cache_path, "module:file:////var/www/git/More/clientside-require/test/_env/custom_node_modules/async/package.json", "should be an absolute path to the file");
    })
    it('should get null when data not defined', function(){
        var cache = require(process.env.src_root + "/cache.js");
        var cache_path = cache.generate_cache_path_for_request("async", modules_root, default_options);
        var promise_content = cache.get(cache_path);
        assert.equal(promise_content, null, "should have no data for an uncached request");
    })
    it('should set and retreive data accurately', async function(){
        var cache = require(process.env.src_root + "/cache.js");
        var cache_path = cache.generate_cache_path_for_request("./path/to/a/file.js", modules_root, default_options);

        // set data
        var data_promise = Promise.resolve("the data");
        cache.set(cache_path, data_promise);

        // normal get
        var promise_content = cache.get(cache_path);
        assert(Promise.resolve(promise_content) == promise_content, "promise_content should be a promise")
        var data = await promise_content;
        assert.equal(data, "the data", "data should be expected - promise");

        // content get
        var data = cache.get(cache_path, "content");
        assert.equal(data, "the data", "data should be expected - content");
    })
})
