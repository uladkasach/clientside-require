describe("basic", function(){
    it("should initialize", function(){
        require(process.env.src_root + "/utilities/content_loading/basic.js");
    })
    it("should load json content", async function(){
        var basic_loaders = require(process.env.src_root + "/utilities/content_loading/basic.js");
        var content = await basic_loaders.promise_to_retreive_json("file:///var/www/git/More/clientside-require/test/_env/basic_content/test_json.json");
        console.log(content);
    })
})
