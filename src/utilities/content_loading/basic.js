/*
    basic resource loading methods that do not nessesarily preserve scope
*/
module.exports = {
    promise_to_load_script_into_document : function(script_src, target_document){
        if(typeof target_document == "undefined") target_document = window.document; // if no document is specified, assume its the window's document
        var loading_promise = new Promise((resolve, reject)=>{
            var script = target_document.createElement('script');
            script.setAttribute("src", script_src);
            script.onload = function(){
                resolve(target_document);
            };
            script.onerror = function(error){
                reject(error);
            }
            target_document.getElementsByTagName('head')[0].appendChild(script);
        })
        return loading_promise;
    },
    promise_to_load_css_into_document : function(styles_href, target_document){
        if(typeof target_document == "undefined") target_document = window.document; // if no document is specified, assume its the window's document
        // <link rel="stylesheet" type="text/css" href="/_global/CSS/spinners.css">
        return new Promise((resolve, reject)=>{
            var styles = target_document.createElement('link');
            styles.type = "text/css";
            styles.rel = 'stylesheet';
            styles.href = styles_href;
            styles.onload = function(){
                resolve(target_document);
            };
            styles.onerror = function(error){
                reject(error);
            };
            target_document.getElementsByTagName('head')[0].appendChild(styles);
        })
    },
    promise_to_get_content_from_file : function(destination_path){
        return new Promise((resolve, reject)=>{
            var xhr = new window.XMLHttpRequest();
            xhr.open("GET", destination_path, true);
            xhr.onload = function(){
                var status_string = this.status + "";
                if(status_string[0] == "4") return reject(new Error(this.status));
                if(status_string[0] == "5") return reject(new Error(this.status));
                resolve(this.responseText)
            };
            xhr.onerror = function(error){
                if(typeof error == "undefined") error = this.statusText; // if error is not defined, atleast resolve with status text
                if(error.code == "ENOENT") return reject(new Error("404")); // maps not found node file:/// requests to 404 response
                return reject(error);
            };
            xhr.send();
        })
    },
    promise_to_retreive_json : async function(json_source){
        // get text from file
        var content = await this.promise_to_get_content_from_file(json_source);

        // cast data to json
        try {
            var data = (JSON.parse(content));
        } catch (err){
            throw (err);
        }

        // resolve with response
        return data;
    },
}
