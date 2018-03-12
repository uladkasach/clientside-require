var assert = require("assert");
describe('basic', function(){
    it('should initialize', function(){
        var clientside_require = require(process.env.src_root + '/index.js');
        window.clientside_require = clientside_require; // update window definition of clientside_require to actual module
    })
})
