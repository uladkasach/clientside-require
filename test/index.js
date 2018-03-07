describe('clientside usage', function(){
    describe('basic file loading', function(){
        it('should load js files into a document')
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
