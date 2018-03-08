process.env.src_root = __dirname + "/../src";

var clientside_require = null; // define globaly so that after loading it in the dinitialization test we can utilize it again outside of the test
describe('initialization', function(){
    clientside_require = require(process.env.src_root + '/index.js');
    console.log(clientside_require);
})

describe('components', function(){

})

describe('clientside usage', function(){
    describe('basic file loading', function(){
        it('should load js files into a document', function(){

        })
        it('should load css files into a document')
        it('should load json files')
        it('should load html files')
        it('should load text')
    })

    describe('path analysis', function(){
        it('should find absolute path accurately')
        it('should find relative path accurately - type 1')
        it('should find relative path accurately - type 2')
        it('should find module path accurately - defined in json')
        it('should find module path accurately - not defined in json')
    })

    describe('module loading', function(){
        it('should be able to load modules - async')
        it('should be able to load modules - sync')
    })

    describe("relative path loading", function(){
        it('should be able to load relative paths')
        it('should be able to load relative paths inside of modules')
    })
})
