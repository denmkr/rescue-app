const express=require('express');
var app=express();
var http = require('http').Server(app);
var fs = require('fs');
var io = require('socket.io')(http);

app.use(express.static(__dirname+"/public"));
app.get('/',function(req,res)
{
	res.send("Hello World");
});

app.get('/resource',function(req,res)
{
	res.sendFile('views/resource.html', {root: __dirname+"/public" })
});

app.get('/layout',function(req,res)
{
  res.sendFile('views/layout.html', {root: __dirname+"/public" })
});

app.get('/chord',function(req,res)
{
  res.sendFile('views/chord.html', {root: __dirname+"/public" })
});


var shake09_palace = [];
var shake08_palace = [];
var shake06_palace = [];

function readLines(input, func,filename) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      func(line,filename);
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);
    }
  });
}

function func(data,filename) {
  //console.log('Line: ' + data);
  if(filename === "palace09")
  	shake09_palace.push(data);
  else if(filename === "palace08")
  	shake08_palace.push(data);
  else if(filename === "palace06")
  	shake06_palace.push(data);
}

var palace09 = fs.createReadStream('public/data/shake09_palace.txt');
var palace08 = fs.createReadStream('public/data/shake08_palace.txt');
var palace06 = fs.createReadStream('public/data/shake06_palace.txt');
readLines(palace09, func,"palace09");
readLines(palace08, func,"palace08");
readLines(palace06, func,"palace06");

io.on('connection', function(socket) {
	socket.emit('shake09Palace',shake09_palace);
	socket.emit('shake08Palace',shake08_palace);
	socket.emit('shake06Palace',shake06_palace);
	
   
    socket.on('disconnect', function(){
    console.log('A client has disconnected from the server');
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, function() {
   console.log('listening on *:' + PORT);
});