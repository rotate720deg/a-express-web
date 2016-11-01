var http = require('http'),fs = require('fs'),url = require('url');

function serverHandle(req,res){
	var path = url.parse(req.url).pathname;
	console.log(path)
	fs.readFile('../helloworld.js',{"encoding ":"utf-8"},function(err,data){
		if(err){
			console.log(err)
		}else{
			res.writeHead(200,{"Content-Type":"text/plain"});
			res.write(data);
			res.end();
		}
	})
}

http.createServer(function(req,res){
	serverHandle(req,res)
}).listen(8888);