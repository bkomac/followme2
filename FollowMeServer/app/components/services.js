angular.module('FollowMe').service('SocketService', [ '$log', function($log) {

	$log.log("Sem v servisu...");

	this.socket = null;

	this.init = function(remoteAddress) {
		console.log("inti.... " + remoteAddress);
		this.socket = io(remoteAddress);
		return this;
	};

	this.onMessage = function(callBack) {
		$log.log("onMessage called...");
		this.socket.on("get_position", callBack);

	};

	var socket = io(this.remoteAddress);

} ]);