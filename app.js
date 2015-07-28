var http = require('http');

var express = require('express');
var app = express();
app.use(express.static(__dirname + '/build'));

var server = http.createServer(app);

server.listen(4000);
console.log("listening on port 4000");
