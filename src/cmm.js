console.log("here i am!");

var cmm = {
    worker_path : "/cmm_worker.js",
}

var promise_require = function(path){
    var worker = new Worker(window.cmm.worker_path);
    worker.postMessage(path);
    console.log('Message posted to worker');

}

var require = function(path){return promise_require(path)}
