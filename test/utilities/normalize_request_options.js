var assert = require("assert");

describe("normalize_request_options", function(){
    it('should initialize', function(){
        require(process.env.src_root + "/utilities/normalize_request_options.js");
    })
    it('should default relative path root to window.location.origin dir', function(){
        var normalize_options = require(process.env.src_root + "/utilities/normalize_request_options.js");
        var options = normalize_options();
        assert.equal(options.relative_path_root, "http://clientside-require.localhost/", "relative path root default is valid")
    })
})
