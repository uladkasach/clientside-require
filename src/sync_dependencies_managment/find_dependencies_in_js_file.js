var basic_loaders = request("./../loading_utilities/basic.js");

module.exports = async function(path){
    var content = await basic_loaders.promise_to_get_content_from_file(path)

    /*
        extract all require requests from js file manually
            - use a regex to match between require(["'] ... ["'])
    */
    //console.log("conducting regex to extract requires from content...");
    var regex = /(?:require\(\s*["'])(.*?)(?:["']\s*\))/g // plug into https://regex101.com/ for description; most important is (.*?) and g flag
    var matches = [];
    while (m = regex.exec(content)){ matches.push(m[1]) };
    return matches
}
