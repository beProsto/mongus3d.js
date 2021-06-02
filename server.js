const http = require("http");
const fs = require('fs');

const hostname = "0.0.0.0";
const port = 80;

let chatData = "";

const server = http.createServer(function(req, res) {
  console.log(`\n${req.method} ${req.url}`);
  console.log(req.headers);

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  
  req.on("data", function(chunk) {
    if(req.method == "POST" && req.url == "/chatdata.txt") {
        chatData = chunk;
        res.end("POSTED");
    }
    else if(req.method == "PUT" && req.url == "/chatdata.txt") {
      chatData += chunk;
      res.end("POSTED");
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
  else if(req.method == "GET") {
    fs.readFile(__dirname + req.url, function(err, data) {
      if(err) {
        console.error(err); 
      }
      res.end(String(data));
    });
  }
});

server.listen(port, hostname, function() {
  console.log(`Server running at http://localhost:${port}/`);
});
