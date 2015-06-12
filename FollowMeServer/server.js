var port = 4000;

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var sessions = [];
var numOnlineUsers = 0;

console.log('Starting FollowMe server on port ' + port + '...');

// app.get('/', function(req, res) {
// res.writeHead(200, {
// 'Content-Type' : 'text/plain'
// });
// console.log("GET request...");
// res.end('This is socket.io endpoint on port ' + port + ' \n');
// });

app.use(express.static(__dirname + '/webUI'));

io.on('connection', function(socket) {
	var address = socket.handshake.address;
	console.log("*** Conecting ... #" + socket.id + " " + socket.request.connection.remoteAddress);

	socket.on('put_position', function(msg) {
		// console.log(JSON.stringify(socket));
		var pos = JSON.parse(msg);

		pos.socketId = socket.id;
		pos.follows = numOnlineUsers;

//		var user = new User();
//		user.setUser(msg.uddi, msg.socketId, pos.user);
		// sessions[pos.user] = user;

		console.log("**user: " + pos.user + ":. #" + socket.id + "  " + pos.lat + " " + pos.lng);
		socket.broadcast.emit('get_position', JSON.stringify(pos));
	});

	socket.on('connect', function(msg) {
		console.log("Connecting user: " + msg.user);
		msg.socketId = socket.id;
		pos.follows = numOnlineUsers;
		socket.broadcast.emit('connect', msg);
	});

	// socket.on('disconnect', function(msg) {
	// console.log("Disconnecting user: " + msg.user);
	// msg.socketId = socket.id;
	// socket.broadcast.emit('disconnect', msg);
	// });

	socket.on('logon', function(msg) {
		console.log("Loging on user: " + msg.user);
		msg.socketId = socket.id;
		msg.follows = numOnlineUsers;
		numOnlineUsers = numOnlineUsers + 1;
		socket.broadcast.emit('logon', msg);

	});

	socket.on('logoff', function(msg) {
		console.log("Loging off user: " + JSON.stringify(msg));
		msg.socketId = socket.id;
		msg.follows = numOnlineUsers;
		numOnlineUsers = numOnlineUsers - 1;
		socket.broadcast.emit('logoff', msg);

	});
});

http.listen(port, function() {
	console.log('listening on:' + port + ' ...');
});

// setInterval(function() {
// console.log("***** timer *****");
// for ( var user in sessions) {
// console.log("TST:" + user.tst + " now:" + new Date().getTime());
// if ((user.tst + 10 * 1000) < new Date().getTime()) {
// console.log("***Remove user..." + user.userName);
// user = null;
// }
//
// }
// }, 10 * 1000);

function User() {
	this.id;
	this.socketId;
	this.userName;
	this.tst;

	this.setUser = function(id, socketId, userName) {
		console.log("getting possition from... " + userName);
		this.id = id;
		this.socketId = socketId;
		this.userName = userName;
		this.tst = new Date().getTime();

		numOnlineUsers++;
	};

}

function exitHandler(options, err) {
	if (options.cleanup) {
		console.log('** FollowMe server closing down ...');
	}
	if (err)
		console.log(err.stack);
	if (options.exit)
		process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, {
	cleanup : true
}));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {
	exit : true
}));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {
	exit : true
}));
