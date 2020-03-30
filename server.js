const http = require("http");
const fs = require('fs');

const hostname = "0.0.0.0";
const port = 8080;

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
  
  
  if(req.method == "GET" && req.url != "/favicon.ico" && req.url != "/chatdata.txt") {
    fs.readFile(__dirname + (req.url == "/" ? "/index.html" : req.url), function(err, data) {
      if(err) {
        console.error(err); 
      }
      res.end(data.toString());
    });
  }
  else if(req.method == "GET" && req.url == "/chatdata.txt") {
    res.end(chatData);
  }
});

server.listen(port, hostname, function() {
  console.log(`Server running at http://localhost:${port}/`);
});
