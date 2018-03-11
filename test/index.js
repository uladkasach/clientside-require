process.env.src_root = __dirname + "/../src";
process.env.test_env_root = __dirname + "/_env"

/*
    load testing dependencies
*/
var jsdom = require("jsdom");
var xmlhttprequest = require("xmlhttprequest");

/*
    provision environment to mimic browser environment
    - provision the window (specifically document & location)
    - provision the xmlhttprequest
*/
global.window = new jsdom.JSDOM(``,{
    resources: "usable", // load iframes and other resources
    runScripts : "dangerously", // enable loading of scripts
}).window;
/*
window.XMLHttpRequest = function(message){ // mimic alert function
    console.log("ALERT: " + message);
}
*/

global.XMLHttpRequest = xmlhttprequest.XMLHttpRequest;
window.XMLHttpRequest = XMLHttpRequest; // append XMLHttpRequest to window
/*
    define modules root for testing
*/



/*
    begin testing
*/


describe('utilities', function(){
    describe("content_loading", function(){
        require("./utilities/content_loading/basic");
        require("./utilities/content_loading/commonjs");
    })
    describe("request_analysis", function(){
        require('./utilities/request_analysis/normalize_path')
    })
})
describe('components', function(){
    require('./components/cache')
})

describe('integrated', function(){
    it('should initialize', function(){
        this.skip();
        var clientside_require = require(process.env.src_root + '/index.js');
        //console.log(clientside_require);
    })
})