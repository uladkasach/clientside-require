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
        - provision the xmlhttprequest in the window as well
*/
global.window = new jsdom.JSDOM(``,{
    url: "http://clientside-require.localhost/",
    resources: "usable", // load iframes and other resources
    runScripts : "dangerously", // enable loading of scripts - dangerously is fine since we are running code we wrote.
}).window;
window.XMLHttpRequest = xmlhttprequest.XMLHttpRequest; // append XMLHttpRequest to window


/*
    define a clientside_require object that can be used to mimic clientside_require object for tests
        - used by components/retreive
        - used by utilities/content_loading/commonjs.js
    NOTE: it gets overwritten in full_module/basic.js after we know that clientside_require can be initialized
*/
window.clientside_require = {
    asynchronous_require : function(request, options){
        return Promise.resolve(request);
    },
    synchronous_require : function(request, options){
        if(typeof request == "undefined") request = "not defined"; // cast it to string anyway
        return request;
    }
}


/*
    begin testing
*/
describe('utilities', function(){
    require("./utilities/normalize_request_options");
    describe("content_loading", function(){
        require("./utilities/content_loading/basic");
        require("./utilities/content_loading/commonjs");
    })
    describe("request_analysis", function(){
        require('./utilities/request_analysis/normalize_path')
        require('./utilities/request_analysis/decompose_request')
    })
})
describe('components', function(){
    require('./components/cache')
    require('./components/retreive')
})

describe('full_module', function(){
    require('./full_module/basic');
    require('./full_module/test_modules');
    require('./full_module/node_modules');
    require('./full_module/load_and_require.js');
})
