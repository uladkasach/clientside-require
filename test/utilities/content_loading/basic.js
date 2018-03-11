var assert = require("assert");
describe("basic", function(){
    it("should initialize", function(){
        require(process.env.src_root + "/utilities/content_loading/basic.js");
    })
    it("should load json content", async function(){
        var basic_loaders = require(process.env.src_root + "/utilities/content_loading/basic.js");
        var content = await basic_loaders.promise_to_retreive_json("file:///"+ process.env.test_env_root + "/basic_content/test_json.json");
        assert.equal(content.foo, "bar", "content was expected")
    })
    it("should load content as text from a file", async function(){
        var basic_loaders = require(process.env.src_root + "/utilities/content_loading/basic.js");
        var content = await basic_loaders.promise_to_get_content_from_file("file:///"+ process.env.test_env_root + "/basic_content/test_html.html");
        assert.equal(content.replace(/\s/g, ""), "<div>hello</div>", "content was expected")
    })
    it("should load css into document", async function(){
        var basic_loaders = require(process.env.src_root + "/utilities/content_loading/basic.js");
        var original_header_children_count = window.document.head.childNodes.length;
        await basic_loaders.promise_to_load_css_into_document("file:///"+ process.env.test_env_root + "/basic_content/test_css.css");
        var final_header_children_count = window.document.head.childNodes.length;
        var difference = final_header_children_count - original_header_children_count;
        assert.equal(difference, 1, "difference is one");
    })
    it('should load js into document', async function(){
        var basic_loaders = require(process.env.src_root + "/utilities/content_loading/basic.js");
        await basic_loaders.promise_to_load_script_into_document("file:///"+ process.env.test_env_root + "/basic_content/test_js.js");
        assert.equal(window.test_variable.foo, "bar", "script loaded into document");
    })
})
