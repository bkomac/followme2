var remoteAddress = "http://ws.komac.si:4000";
var VERSION = "0.1.0";

var map;
var userMap = new Map();
var socket;
var app;
var panToPosition = true;
var infowindow;

window.addEventListener("load", init, false);

function init() {

	mapInit();

	socket = io(remoteAddress);

	app = new OnlineUsers();

	socket.on("get_position", positionChange);

	try {
		socket.on("logon", function(data) {
			// data = JSON.parse(data);
			GUI.setStatus(data.user + " logged on...");
			GUI.updateAddUser(data);
		});
		socket.on("logoff", function(data) {
			// data = JSON.parse(data);
			GUI.setStatus(data.user + " logged off...");

		});
		// socket.on("connect", function(data) {
		// data = JSON.parse(data);
		// GUI.setStatus(data.user + " connected...");
		//
		// });

		// socket.on("disconnect", function(data) {
		// // data = JSON.parse(data);
		// GUI.setStatus(data.user + " disconnected...");
		// GUI.removeUser(data);
		// });
	} catch (e) {
		error(e.message);
	}

}

function mapInit() {
	trace("init map...");

	var myOptions = {
		zoom : 13,
		center : new google.maps.LatLng(46.069333, 14.515620),
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map"), myOptions);

	return map;
}

function positionChange(data) {
	trace("getting position:" + data);
	data = JSON.parse(data);
	app.addUser(data);
	GUI.setStatus("User " + data.user + " is emitting...");
	panTo(data);

	GUI.updateAddUser(data);

}

// ////////////////////////////

function panTo(data) {
	// trace("Racifeve: lat=" + position.lat + " lng=" + position.lng);
	if (map == undefined)
		mapInit();

	if (panToPosition)
		map.panTo(new google.maps.LatLng(data.lat, data.lng));

	var point = new google.maps.LatLng(data.lat, data.lng);

	if (app.getMarker(data.uuid) == null) {
		var marker = new google.maps.Marker({
			position : point,
			icon : Utils.getIcon(data.user),
			map : map
		});

		app.setMarker(data.uuid, marker);

	} else {
		app.getMarker(data.uuid).setPosition(point);
	}

	if (app.getPoly(data.uuid) == null) {
		var poly = new google.maps.Polyline({
			geodesic : true,
			strokeColor : '#FF0000',
			strokeOpacity : 0.9,
			strokeWeight : 2
		});

		app.setPoly(data.uuid, poly);

		poly.setMap(map);

	}

	var path = app.getPoly(data.uuid).getPath();
	path.push(point);

	google.maps.event.addListener(app.getMarker(data.uuid), 'click', function() {

		var info = ('<h3>User: ' + data.user + '</h3><br>Latitude: ' + data.lat + '<br>' + 'Longitude: ' + data.lng + '<br>' + 'Altitude: '
				+ data.alt + ' m<br>' + 'Accuracy: ' + data.accur + ' m<br>' + '<br>' + 'Speed: ' + data.speed + 'km/h<br>'); // +
		// 'Timestamp:
		if (!infowindow) {
			infowindow = new google.maps.InfoWindow({
				content : info
			});
		} else {
			infowindow.setContent(info);
		}

		infowindow.open(map, app.getMarker(data.uuid));
	});

}

// Users
function OnlineUsers() {
	this.users = new Array();
	this.device = {};

	this.addUser = function(data) {
		trace("Ading user..." + data.user + " socketId:" + data.socketId);
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
				trace("User found: " + this.users[int].userName)
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

function convert(ms) {
	if (ms != null) {
		var kh = ms * 3.6;
		kh = Math.round(kh * 10) / 10;
	}
	return kh;
}

function alt(alt) {
	return Math.round(alt * 10) / 10;
}

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

var Utils = {
	getIcon : function(user, color) {
		trace("***" + user);
		color = color || 1;
		if (user != null && user != "") {
			return "img/icon/letters_" + color + "/letter_" + user.substring(0, 1) + ".png";
		}

		return "img/icon/letters_1/letter_x.png";
	},

};

var GUI = {

	setStatus : function(msg) {
		var statusUI = $("#status");
		statusUI.html(msg);
	},

	updateAddUser : function(data) {
		var userConteinerUI = $('#user-' + data.uuid);

		if (userConteinerUI.length == 0) {
			// DOM doesn't exsist
			$('#userRow').append(this.__private.generateUserContainer(data));

		} else {
			// DOM exists
			userConteinerUI.replaceWith(this.__private.generateUserContainer(data));
		}

	},

	removeUser : function(data) {
		var userConteinerUI = $('#user-' + data.uuid);
		trace("Removing user from GUI: " + data.user + " " + '#user-' + data.uuid);
		userConteinerUI.remove();

		app.getUser(data.uuid).marker.setMap(null);
		app.getUser(data.uuid).poly.setMap(null);
	},

	// private don't use outside!
	__private : {
		generateUserContainer : function(data) {
			var batt = data.battery;
			if (batt == undefined)
				batt = {
					"level" : 100
				};

var info = '<br><table class="table table-striped">' + '<tr><th>ID:</td><td>' + data.uuid
+ '</td></tr>' + '<tr><th>Lat:</td><td>' + data.lat + ' °</td></tr>' + '<tr><th>Lng:</td><td>' + data.lng
+ ' °</td></tr>' + '<tr><th>Alt:</td><td>' + data.alt + ' m</td></tr>' + '<tr><th>Accrur.:</td><td>' + data.accur
+ ' m</td></tr>' + '<tr><th>Speed:</td><td>' + data.speed + ' km/h</td></tr>' + '<tr><th>Battery:</td><td>'

+ '<div class="progress">' + '<div class="progress-bar" role="progressbar" aria-valuenow="' + batt.level
+ '" aria-valuemin="0" aria-valuemax="100" style="width: ' + batt.level + '%;">' + batt.level + '%</div></div>'
+ '</td></tr>'
+'</table>';			
			
var tab = '<div role="tabpanel">'
    +'<ul class="nav nav-tabs" role="tablist">'
    +'<li role="presentation" class="active"><a id="info" href="#info" aria-controls="info" role="tab" data-toggle="tab">Info</a></li>'
    +'<li role="presentation"><a id="alt" href="#alt" aria-controls="alt" role="tab" data-toggle="tab">Altitude</a></li>'
    +'<li role="presentation"><a id="batt" href="#batt" aria-controls="batt" role="tab" data-toggle="tab">Battery</a></li>'
  +'</ul>'

  +'<div class="tab-content">'
    +'<div role="tabpanel" aria-labelledby="info" class="tab-pane active" id="info-cont">'+info+'</div>'
    +'<div role="tabpanel" aria-labelledby="alt" class="tab-pane" id="alt-cont">...</div>'
    +'<div role="tabpanel" aria-labelledby="batt" class="tab-pane" id="batt-cont">...</div>'
  +'</div>'
+'</div>';
			
			
			var html = '<div id="user-' + data.uuid + '" class="col-md-4">' + '<div class="panel panel-default">'
					+ '<div class="panel-heading">' + '<h3 class="panel-title">' + '<img src="' + Utils.getIcon(data.user, 1) + '" /><b> '
					+ data.user + '</b></h3>' + '</div>'

					+ '<div class="panel-body">' 
					+ tab 
			+ '</div>' + '</div>' + '</div>';

			return html;
		}
	}

};

// ///////////////

// entities

var icon = [ 'http://labs.google.com/ridefinder/images/mm_20_red.png', 'http://labs.google.com/ridefinder/images/mm_20_blue.png',
		'http://labs.google.com/ridefinder/images/mm_20_green.png', 'http://labs.google.com/ridefinder/images/mm_20_yellow.png' ];

var color = [ '#f00', '#00f', '#0f0', '#0ff' ];

function Map() {
	this.keys = new Array();
	this.data = new Object();

	this.put = function(key, value) {
		if (this.data[key] == null) {
			this.keys.push(key);
		}
		this.data[key] = value;
	};

	this.get = function(key) {
		return this.data[key];
	};

	this.remove = function(key) {
		this.keys.remove(key);
		this.data[key] = null;
	};

	this.each = function(fn) {
		if (typeof fn != 'function') {
			return;
		}
		var len = this.keys.length;
		for (var i = 0; i < len; i++) {
			var k = this.keys[i];
			fn(k, this.data[k], i);
		}
	};

	this.entrys = function() {
		var len = this.keys.length;
		var entrys = new Array(len);
		for (var i = 0; i < len; i++) {
			entrys[i] = {
				key : this.keys[i],
				value : this.data[i]
			};
		}
		return entrys;
	};

	this.isEmpty = function() {
		return this.keys.length == 0;
	};

	this.size = function() {
		return this.keys.length;
	};
};
