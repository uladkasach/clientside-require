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
        assert.equal(details.injection_require_type, "async", "injection_require_type should be async");
        assert.equal(details.dependencies.length, 0, "there should be no dependencies");
    })
    it('should find module path accurately - not defined in json', async function(){
        var promise_to_decompose_request = require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
        var request = "async";
        var details = await promise_to_decompose_request(request, modules_root, relative_path_root);

        assert.equal(details.type, "js", "type should be js");
        assert.equal(details.path, 'file:////var/www/git/More/clientside-require/test/_env/custom_node_modules/async/index.js', "path should be accurate");
        assert.equal(details.injection_require_type, "async", "injection_require_type should be async");
        assert.equal(details.dependencies.length, 0, "there should be no dependencies");
    })
    it('should find module path accurately - defined in json', async function(){
        var promise_to_decompose_request = require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
        var request = "async_main";
        var details = await promise_to_decompose_request(request, modules_root, relative_path_root);

        assert.equal(details.type, "js", "type should be js");
        assert.equal(details.path, 'file:////var/www/git/More/clientside-require/test/_env/custom_node_modules/async_main/src/index.js', "path should be accurate");
        assert.equal(details.injection_require_type, "async", "injection_require_type should be async");
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
            assert.equal(error.message, "Request Error : 404 : file:////var/www/git/More/clientside-require/test/_env/custom_node_modules/non-existant-module/package.json", "error message should be expected")
        }
    })
    describe('injection request type for modules', function(){
        it('should find module is async if defined in package_json', async function(){
            var promise_to_decompose_request = require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
            var request = "async";
            var details = await promise_to_decompose_request(request, modules_root, relative_path_root);

            assert.equal(details.type, "js", "type should be js");
            assert.equal(details.injection_require_type, "async", "injection_require_type should be async");
            assert.equal(details.dependencies.length, 0, "there should be no dependencies");
        })
        it('should find module is sync if not defined in package_json', async function(){
            var promise_to_decompose_request = require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
            var request = "sync_main";
            var details = await promise_to_decompose_request(request, modules_root, relative_path_root);

            assert.equal(details.type, "js", "type should be js");
            assert.equal(details.injection_require_type, "sync", "injection_require_type should be async");
            assert.equal(details.dependencies.length, 0, "there should be no dependencies");
        })
    })
    describe('sync dependencies', function(){
        it('should not find find dependencies for async require injection with require statements', async function(){
            var promise_to_decompose_request = require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
            var request = "async_dependencies";
            var details = await promise_to_decompose_request(request, modules_root, relative_path_root);

            assert.equal(details.type, "js", "type should be js");
            assert.equal(details.injection_require_type, "async", "injection_require_type should be async");
            assert.equal(details.dependencies.length, 0, "there should be no dependencies");
        })
        it('should find dependencies accurately for sync require injection', async function(){
            var promise_to_decompose_request = require(process.env.src_root + "/utilities/request_analysis/decompose_request.js");
            var request = "sync_dependencies";
            var details = await promise_to_decompose_request(request, modules_root, relative_path_root);

            assert.equal(details.type, "js", "type should be js");
            assert.equal(details.injection_require_type, "sync", "injection_require_type should be async");
            assert.equal(details.dependencies.length, 2, "there should be no dependencies");
            assert.equal(details.dependencies[0] == "dep-one", details.dependencies[1] == "dep-two");
        })
    })
})
