//HTTP server that serves files from a directory

const fs = require("fs");   //to load files from disk
const http = require("http");   //create http server and handle requests
const mime = require("mime");   //determines the content type for files we are going to serve
const path = require("path");   //handle paths
const url = require("url");    //parse URLs

//tells which files to serve
function walkDirectory(dirPath,callback){
    const dirents = fs.readdirSync(dirPath,{withFileTypes: true});
    dirents.forEach(dirent => {
        if(dirent.isDirectory()){
            walkDirectory(path.join(dirPath,dirent.name),callback);
        }
        else{
            callback(path.join(dirPath,dirent.name));
        }
    })
}
const rootDirectory = path.resolve(process.argv[2] || "./");
//scan the directory tree and store the path to all files in a Set
const files = new Set();
walkDirectory(rootDirectory,(file) => {
    file = file.substr(rootDirectory.length);
    files.add(file);
})
console.log(`Found ${files.size} in ${rootDirectory} ...`);

//the list of files ready to serve now create http server
const server = http.createServer();
//request handler function
server.on("request",(request,response) => {
    const requestUrl = url.parse(request.url);
    const requestedPath = path.join(requestUrl.pathname);
    if(!files.has(requestedPath)){
        console.log("404 %s",requestUrl.href);
        response.end();
        return;
    }
    const contentType = mime.getType(path.extname(requestedPath));
    console.log("200 %s", requestUrl.href);
    response.writeHead(200,{"Content-type":contentType});
    fs.createReadStream(path.join(rootDirectory,requestedPath)).pipe(response);
})
const port = 3000;
console.log("Starting server on port %d",port);
console.log("Go to http://localhost:%d",port);
server.listen(port);
