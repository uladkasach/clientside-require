var cmm = {
    worker_path : "/cmm_worker.js",
    root : "/test_env",
    _cache : {},
    loader_functions : {
        promise_to_load_script_into_document : function(script_src, target_document){
            if(typeof document == "undefined") target_document = window.document; // if no document is specified, assume its the window's document
            return new Promise((resolve, reject)=>{
                var script = document.createElement('script');
                script.setAttribute("src", script_src);
                script.onload = function(){
                    resolve(target_document);
                };
                target_document.getElementsByTagName('head')[0].appendChild(script);
            })
        },

        promise_to_retreive_json : function(json_source){
            return new Promise((resolve, reject)=>{
                var xhr = new XMLHttpRequest();
                xhr.overrideMimeType("application/json");
                xhr.open("GET", json_source, true);
                xhr.onload = function(){
                    resolve(JSON.parse(this.responseText));
                };
                xhr.send();
            })
        },

        promise_to_load_css_into_window : function(styles_href, target_document){
            if(typeof document == "undefined") target_document = window.document; // if no document is specified, assume its the window's document
            // <link rel="stylesheet" type="text/css" href="/_global/CSS/spinners.css">
            return new Promise((resolve, reject)=>{
                var styles = document.createElement('link');
                styles.type = "text/css";
                styles.rel = 'stylesheet';
                styles.href = styles_href;
                styles.onload = function(){
                    resolve(target_document);
                };
                target_document.getElementsByTagName('head')[0].appendChild(styles);
            })
        },

        promise_to_get_html_from_file : function(destination_path){
            return new Promise((resolve, reject)=>{
                var xhr = new XMLHttpRequest();
                xhr.open("POST", destination_path, true);
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xhr.onload = function(){
                    resolve(this.responseText)
                };
                xhr.send();
            })
        },
    },
    module_mapping : function(module){
        if(module.indexOf("/") == -1){
            var path = this.root + "/node_modules/" + module + "/index.js"; // TODO - map non "index.js" main files based on package.json
            return path
        } else {
            return module;
        }
    },

    promise_to_require : function(module){// load script into iframe to create closed namespace
                                          // TODO : handle require() requests inside of the module with caching included

        var path = cmm.module_mapping(module);
        if(typeof this._cache[path] != "undefined") return this._cache[path]; // retreive from cache if possible

        //console.log("promising to require...")
        var promise_frame_loaded = new Promise((resolve, reject)=>{
                //console.log("building promise");
                var frame = document.createElement('iframe');
                frame.onload = function(){resolve(frame)};
                frame.style.display = "none"; // dont display the iframe
                document.querySelector("html").appendChild(frame);
            })

        var promise_exports = promise_frame_loaded
            .then((frame)=>{
                //console.log("frame loaded. document : ")
                frame.contentWindow.module = {};
                var frame_document = frame.contentWindow.document;
                return this.loader_functions.promise_to_load_script_into_document(path, frame_document)
            })
            .then((frame_document)=>{
                var frame_window = frame_document.defaultView;
                //console.log(frame_window);
                //console.log(frame_window.module)
                return(frame_window.module.exports);
            })

        var promise_to_remove_frame = Promise.all([promise_frame_loaded, promise_exports])
            .then(([frame, __])=>{
                frame.parentNode.removeChild(frame);
            })

        var promise_exports_and_removal = Promise.all([promise_exports, promise_frame_loaded])
            .then(([exports, __])=>{
                //console.log("exports:");
                //console.log(exports);
                return exports;
            })

        this._cache[path] = promise_exports_and_removal; // cache the promise (and consequently the result)
        return promise_exports_and_removal;
    }
}

var promise_to_require = function(module){ return cmm.promise_to_require(module); }
var require = function(module){ return cmm.promise_to_require(module); }
