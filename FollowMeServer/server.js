var port = 4000;

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

console.log('Starting node on port ' + port + '...');

app.get('/', function(req, res) {
	res.writeHead(200, {
		'Content-Type' : 'text/plain'
	});
	res.end('This is socket.io endpoint. on port '+port+' \n');
});

io.on('connection', function(socket) {
	var address = socket.handshake.address;
	console.log("*** Conecting ... "+ socket.request.connection.remoteAddress);
	
	
	socket.on('position', function(msg) {
		//console.log(JSON.stringify(msg));
		var pos = JSON.parse(msg);
		console.log("message... " + pos.user+ ": "+pos.lat+ " "+pos.lng);
		io.emit('position', msg);
	});
});

io.on('disconnect', function(){
    console.log('*** disconnected');
  });

http.listen(port, function() {
	console.log('listening on:' + port+' ...');
});
