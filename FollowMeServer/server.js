var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.writeHead(200, {
		'Content-Type' : 'text/plain'
	});
	res.end('This is socket.io endpoint.\n');
});

io.on('connection', function(socket) {
	console.log("Conecting ...");
	socket.on('position', function(msg) {
		console.log("message... " + msg);
		io.emit('position', msg);
	});
});
http.listen(3000, function() {
	console.log('listening on *:4000');
});