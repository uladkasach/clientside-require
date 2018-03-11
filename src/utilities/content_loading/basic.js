/*
    basic resource loading methods that do not nessesarily preserve scope
*/
module.exports = {
    promise_to_load_script_into_document : function(script_src, target_document){
        if(typeof target_document == "undefined") target_document = window.document; // if no document is specified, assume its the window's document
        return new Promise((resolve, reject)=>{
            var script = target_document.createElement('script');
            script.setAttribute("src", script_src);
            script.onload = function(){
                resolve(target_document);
            };
            target_document.getElementsByTagName('head')[0].appendChild(script);
        })
    },
    promise_to_retreive_json : function(json_source){
        return new Promise((resolve, reject)=>{
            var xhr = new window.XMLHttpRequest();
            xhr.open("GET", json_source, true);
            xhr.onload = function(){
                if(this.status == "404") throw {type : "404"};
                try {
                    resolve(JSON.parse(this.responseText));
                } catch (err){
                    throw (err);
                }
            };
            xhr.onerror = function(error){
                if(typeof error == "undefined") error = this.statusText; // if error is not defined, atleast resolve with status text
                throw (error);
            };
            xhr.send();
        })
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
                throw error;
            };
            target_document.getElementsByTagName('head')[0].appendChild(styles);
        })
    },
    promise_to_get_content_from_file : function(destination_path){
        return new Promise((resolve, reject)=>{
            var xhr = new window.XMLHttpRequest();
            xhr.open("GET", destination_path, true);
            xhr.onload = function(){
                resolve(this.responseText)
            };
            xhr.onerror = function(error){
                if(typeof error == "undefined") error = this.statusText; // if error is not defined, atleast resolve with status text
                throw (error);
            };
            xhr.send();
        })
    },
}
