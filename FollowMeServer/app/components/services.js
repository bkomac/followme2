'use strict';

angular.module('FollowMe').service(
		'SocketService',
		[
				'$log',
				function($log) {

					this.socket = null;
					var gmap = null;

					var users = new OnlineUsers();

					// pans map to position
					var panToPosition = function(map, data, panToPositionBoolean) {
						// trace("Racifeve: lat=" + position.lat + " lng=" +
						// position.lng);
						if (map === null) {
							$log.error("Map is not defined.");
							return;
						}

						if (panToPositionBoolean)
							map.panTo(new google.maps.LatLng(data.lat, data.lng));

						var point = new google.maps.LatLng(data.lat, data.lng);

						if (users.getMarker(data.uuid) == null) {
							var marker = new google.maps.Marker({
								position : point,
								icon : Utils.getIcon(data.user),
								map : map
							});

							users.setMarker(data.uuid, marker);

						} else {
							users.getMarker(data.uuid).setPosition(point);
						}

						if (users.getPoly(data.uuid) == null) {
							var poly = new google.maps.Polyline({
								geodesic : true,
								strokeColor : '#FF0000',
								strokeOpacity : 0.9,
								strokeWeight : 2
							});

							users.setPoly(data.uuid, poly);

							poly.setMap(map);

						}

						var path = users.getPoly(data.uuid).getPath();
						path.push(point);

						google.maps.event.addListener(users.getMarker(data.uuid), 'click', function() {

							var info = ('<h3>User: ' + data.user + '</h3><br>Latitude: ' + data.lat + '<br>' + 'Longitude: ' + data.lng
									+ '<br>' + 'Altitude: ' + data.alt + ' m<br>' + 'Accuracy: ' + data.accur + ' m<br>' + '<br>'
									+ 'Speed: ' + data.speed + 'km/h<br>'); // +
							// 'Timestamp:
							if (!infowindow) {
								infowindow = new google.maps.InfoWindow({
									content : info
								});
							} else {
								infowindow.setContent(info);
							}

							infowindow.open(map, users.getMarker(data.uuid));
						});

					}

					this.init = function(remoteAddress, map) {
						console.log("inti.... " + remoteAddress);
						this.socket = io(remoteAddress);
						gmap = map;
						return this;
					};

					this.onMessage = function(callBack) {
						this.socket.on("get_position", function(data) {
							data = JSON.parse(data);
							users.addUser(data);
							panToPosition(gmap, data, true);

							callBack(data);
						});
					};

					this.getOnlineUsers = function() {
						return users;
					};

				} ]);

// Users
function OnlineUsers() {
	this.users = new Array();
	this.device = {};

	this.addUser = function(data) {
		trace("Adding user..." + data.user + " socketId:" + data.socketId);
		var usr = new User();
		usr.userName = data.user;
		usr.socketId = data.socketId;
		usr.tst = new Date().getTime();
		usr.uuid = data.uuid;

		if (this.getUser(data.uuid) == null) {
			trace("Adding user..." + data.user + " socketId:" + data.socketId);
			this.users.push(usr);
		}
	};

	this.getUser = function(uuid) {
		var currentTime = new Date().getTime();

		for (var int = 0; int < this.users.length; int++) {
			trace(this.users[int].userName + " - TST:" + this.users[int].tst + " " + currentTime + " - " + this.users[int].socketId);

			// pucamo stare markerje
			// if ((this.users[int].tst + 15000) < currentTime) {
			// trace("brišem..." + this.users[int].userName);
			// this.users[int].marker.setMap(null);
			// this.users.splice(int, 1);
			// return;
			// }

			if (this.users[int].uuid == uuid) {
				trace("User found: " + this.users[int].userName);
				this.users[int].tst = new Date().getTime();
				return this.users[int];
			}

		}//
		return null;

	};

	this.clearUsers = function() {
		this.clearAllMarkers();
		this.clearAllPolys();
		this.users = new Array();
	};

	this.getMarker = function(uuid) {
		return this.getUser(uuid).marker;
	};

	this.clearAllMarkers = function() {
		for (var int = 0; int < this.users.length; int++) {
			trace("Clearing markers: " + this.users[int].userName);
			this.users[int].marker.setMap(null);
		}
	};

	this.setMarker = function(uuid, marker) {
		var usr = this.getUser(uuid);
		if (usr != null) {
			echo(this.users[uuid], "user je:");
			usr.marker = marker;
		}
	};

	this.getPoly = function(uuid) {
		return this.getUser(uuid).poly;
	};

	this.setPoly = function(uuid, poly) {
		var usr = this.getUser(uuid);
		if (usr != null) {
			echo(this.users[uuid], "user je:");
			usr.poly = poly;
		}
	};

	this.clearAllPolys = function() {
		for (var int = 0; int < this.users.length; int++) {
			trace("Clearing polys: " + this.users[int].userName);
			this.users[int].poly.setMap(null);
		}
	};

};

function User() {
	this.userName = "";
	this.uuid = null;
	this.poly = null;
	this.marker = null;
	this.tst = null;
};

var Utils = {
	getIcon : function(user, color) {
		trace("***" + user);
		color = color || 1;
		if (user != null && user != "") {
			return "../webUI/img/icon/letters_" + color + "/letter_" + user.substring(0, 1) + ".png";
		}

		return "../webUI/img/icon/letters_1/letter_x.png";
	},

};

function trace(msg) {
	console.log("TRACE: " + msg);
};
function debug(msg) {
	if (LOG_LEVEL <= LogLevel.DEBUG)
		console.log("DEBUG: " + msg);
}
function warn(msg) {
	if (LOG_LEVEL <= LogLevel.WARN)
		console.warn("WARN: " + msg);
}
function error(msg) {
	console.error("***ERROR: " + msg);
};

function echo(object, prepend) {
	if (prepend == undefined)
		prepend = "";
	trace(prepend + "->" + JSON.stringify(object));
}
