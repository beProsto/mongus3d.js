const http = require("http");
const fs = require('fs');
const mime = require("mime");

const hostname = "0.0.0.0";
const port = 80;

let chatData = "";
let nicks = [];

const server = http.createServer(function(req, res) {
	//console.log(`\n${req.method} ${req.url}`);
	//console.log(req.headers);

	res.statusCode = 200;
	res.setHeader("Content-Type", "text/html; charset=UTF-8");
	
	req.on("data", function(chunk) {
		if(req.method == "POST" && req.url == "/chatdata.txt") {
			chatData = String(chunk);
			res.end("POSTED");
		}
		else if(req.method == "PUT" && req.url == "/chatdata.txt") {
			chatData += String(chunk);
			res.end("POSTED");
		}
		else if(req.method == "PUT" && req.url == "/nicknamecheck") {
			let isFound = false;
			for(let i = 0; i < nicks.length; i++) {
				if(nicks[i] == String(chunk)) {
					isFound = true;
					break;
				}
			}

			if(!isFound) {
				//nicks[nicks.length] = String(chunk);
				nicks.push(String(chunk));
				res.end("Posted");
			}
			else {
				res.end("ErrNickFound");
			}


		}
	});

	
	if(req.method == "GET" && req.url == "/") {
		fs.readFile(__dirname + "/index.html", function(err, data) {
			if(err) {
				console.error(err); 
			}
			res.end(String(data));
		});
	}
	else if(req.method == "GET" && req.url == "/chatdata.txt") {
		res.end(chatData);
	}
	else if(req.method == "GET" && req.url == "/favicon.ico") {
		res.end("");
	}
	else if(req.method == "GET") {
		fs.readFile(__dirname + req.url, function(err, data) {
			if(err) {
				console.error(err); 
			}
		res.setHeader("Content-Type", mime.getType(req.url));
			res.end(String(data));
		});
	}
});

server.listen(port, hostname, function() {
	console.log(`Server running at http://localhost:${port}/`);
});
