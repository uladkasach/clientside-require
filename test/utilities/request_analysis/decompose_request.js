var assert = require("assert");
var modules_root = "file:///"+ process.env.test_env_root + "/custom_node_modules";
var normalize_options = require(process.env.src_root + "/utilities/normalize_request_options.js");
var relative_path_root = normalize_options().relative_path_root;

describe('decompose_request', async function(){
    it('should initialize', function(){
        require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
    })
    it('should decompose regular path accurately', async function(){
        var promise_to_decompose_request = require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
        var request = "/path/to/file.css";
        var details = await promise_to_decompose_request(request, modules_root, relative_path_root, "async");

        assert.equal(details.type, "css", "type should be css");
        assert.equal(details.path, 'http://clientside-require.localhost/path/to/file.css', "path should be accurate");
        assert.equal(details.search_for_dependencies, false, "search_for_dependencies should be false for css");
        assert.equal(details.dependencies.length, 0, "there should be no dependencies");
    })
    it('should find module path accurately - not defined in json', async function(){
        var promise_to_decompose_request = require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
        var request = "sync";
        var details = await promise_to_decompose_request(request, modules_root, relative_path_root);

        assert.equal(details.type, "js", "type should be js");
        assert.equal(details.path, 'file:////var/www/git/More/clientside-require/test/_env/custom_node_modules/sync/index.js', "path should be accurate");
        assert.equal(details.search_for_dependencies, true, "search_for_dependencies should be true for this module");
        assert.equal(details.dependencies.length, 0, "there should be no dependencies");
    })
    it('should find module path accurately - defined in json', async function(){
        var promise_to_decompose_request = require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
        var request = "sync_main";
        var details = await promise_to_decompose_request(request, modules_root, relative_path_root);

        assert.equal(details.type, "js", "type should be js");
        assert.equal(details.path, 'file:////var/www/git/More/clientside-require/test/_env/custom_node_modules/sync_main/src/index.js', "path should be accurate");
        assert.equal(details.search_for_dependencies, true, "search_for_dependencies should be false for this module");
        assert.equal(details.dependencies.length, 0, "there should be no dependencies");
    })
    it('should throw error if module can not be found', async function(){
        var promise_to_decompose_request = require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
        var request = "non-existant-module";
        try {
            var details = await promise_to_decompose_request(request, modules_root, relative_path_root);
            throw new Error("should not reach here");
        } catch (error){
            assert.equal(error.code, 404, "error code should be `404`")
        }
    })
    describe('search_for_dependencies respecting module settings', function(){
        it('should find search_for_dependencies true for package which does not specify', async function(){
            var promise_to_decompose_request = require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
            var request = "sync_main";
            var details = await promise_to_decompose_request(request, modules_root, relative_path_root);

            assert.equal(details.type, "js", "type should be js");
            assert.equal(details.search_for_dependencies, true, "search_for_dependencies should be true");
        })
        it('should find search_for_dependencies false for package which defines itself as async', async function(){
            var promise_to_decompose_request = require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
            var request = "async";
            var details = await promise_to_decompose_request(request, modules_root, relative_path_root);

            assert.equal(details.type, "js", "type should be js");
            assert.equal(details.search_for_dependencies, false, "search_for_dependencies should be false");
        })
    })
    describe('sync dependencies', function(){
        it('should not find dependencies if search_for_dependencies is false', async function(){
            var promise_to_decompose_request = require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
            var request = "async_dependencies";
            var details = await promise_to_decompose_request(request, modules_root, relative_path_root);

            assert.equal(details.type, "js", "type should be js");
            assert.equal(details.search_for_dependencies, false, "search_for_dependencies should be false");
            assert.equal(details.dependencies.length, 0, "there should be no dependencies");
        })
        it('should find dependencies accurately for sync require injection', async function(){
            var promise_to_decompose_request = require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
            var request = "sync_dependencies";
            var details = await promise_to_decompose_request(request, modules_root, relative_path_root);

            assert.equal(details.type, "js", "type should be js");
            assert.equal(details.search_for_dependencies, true, "search_for_dependencies should be true");
            assert.equal(details.dependencies.length, 2, "there should be 2 dependencies");
            assert.equal(details.dependencies[0] == "dep-one", details.dependencies[1] == "dep-two");
        })
    })
})
