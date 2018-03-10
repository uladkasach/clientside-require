
describe('cache', function(){
    var cache = null; // define in this scope so that after loading we can use the cache object in subsequent tests
    it('should initialize', function(){
        cache = require(process.env.src_root + "/cache.js");
    })
    it('should resolve with accurate cachepath for request - not module', function(){
        this.skip();
    })
    it('should resolve with accurate cachepath for request - module')
    it('should get null when data not defined')
    it('should set data accurately')
    it('should return data accurately')
})
