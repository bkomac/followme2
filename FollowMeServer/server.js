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
	console.log("*** Conecting ... "+ address.address + ":" + address.port);
	
	var address = socket.handshake.address;
	
	
	socket.on('position', function(msg) {
		console.log("message... " + msg.user+ ": "+msg.lat+ " "+msg.lng);
		io.emit('position', msg);
	});
});

socket.on('disconnect', function(){
    console.log('*** disconnected');
  });

http.listen(port, function() {
	console.log('listening on:' + port+' ...');
});
