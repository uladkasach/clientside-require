var assert = require("assert");
describe('basic', function(){
    it('should initialize', function(){
        var clientside_require = require(process.env.src_root + '/index.js');
        window.clientside_require = clientside_require; // update window definition of clientside_require to actual module
        window.clientside_require.cache.reset();
    })
    it('should define the load method in root_window', function(){
        assert.equal(typeof window.load, "function", "window.load should be a function");
    })
    it('should not define the require method in root_window', function(){
        assert.equal(typeof window.require, "undefined", "window.require should be undefined");
    })
})
