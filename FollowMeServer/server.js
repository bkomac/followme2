var port = 4000;

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var sessions = [];
var numOnlineUsers;

console.log('Starting node on port ' + port + '...');

app.get('/', function(req, res) {
	res.writeHead(200, {
		'Content-Type' : 'text/plain'
	});
	console.log("GET request...");
	res.end('This is socket.io endpoint on port ' + port + ' \n');
});

io.on('connection', function(socket) {
	var address = socket.handshake.address;
	console.log("*** Conecting ... #" + socket.id + " " + socket.request.connection.remoteAddress);

	socket.on('put_position', function(msg) {
		// console.log(JSON.stringify(socket));
		var pos = JSON.parse(msg);

		pos.socketId = socket.id;

		var user = new User();
		user.setUser(msg.uddi, msg.socketId, pos.user);
		sessions[pos.user] = user;

		console.log("user: " + pos.user + ":. #" + socket.id + "  " + pos.lat + " " + pos.lng);
		socket.broadcast.emit('get_position', pos);
	});
});

io.on('disconnect', function(socket) {
	console.log('*** disconnected socket #' + socket.id);
	socket.disconnect();
});

http.listen(port, function() {
	console.log('listening on:' + port + ' ...');
});

setInterval(function() {
	console.log("***** timer *****");
	for ( var user in sessions) {
		console.log("TST:" + user.tst + " now:" + new Date().getTime());
		if ((user.tst + 10 * 1000) < new Date().getTime()) {
			console.log("***Remove user..." + user.userName);
			user = null;
		}

	}
}, 10 * 1000);

function User() {
	this.id;
	this.socketId;
	this.userName;
	this.tst;

	this.setUser = function(id, socketId, userName) {
		console.log("Adding user... " + userName);
		this.id = id;
		this.socketId = socketId;
		this.userName = userName;
		this.tst = new Date().getTime();

		numOnlineUsers++;
	};

}
