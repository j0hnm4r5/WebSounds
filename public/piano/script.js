// Start the socket
var socket = io.connect('/');

// CREATE UNIQUE USERCOLOR -------------------
var userColor = Math.floor(Math.random() * (0xc0c0c0 - 0x707070 + 1)) + 0x707070;
// Unused, but I want to keep them around
// var userR = parseInt(userColor.toString(16).substr(0,2), 16);
// var userG = parseInt(userColor.toString(16).substr(2,2), 16);
// var userB = parseInt(userColor.toString(16).substr(4,2), 16);

// INITIALIZE ROOMS -------------------
roomBar = document.getElementById("rooms");
numRooms = 4;
rooms = [];
for (var i = 0; i < numRooms; i++) {
	var room = document.createElement("div");
	room.style.width = (100 / numRooms).toString() + "%";
	room.className = "room";
	if (i == 0) {
		room.id = "left";
	}
	if (i == numRooms - 1) {
		room.id = "right";
	}
	roomBar.appendChild(room);
	rooms.push(room);
}


// INITIALIZE KEYBOARD MAPS -------------------

// Middle C is 261.625hz
var c1 = 261.626;

var keys = ["c1", "d1f", "d1", "e1f", "e1", "f1", "g1f", "g1", "a1f", "a1", "b1f", "b1", "c2", "d2f", "d2", "e2f", "e2", "f2", "g2f", "g2", "a2f", "a2", "b2f", "b2", "c3"];

// Make array of 0s as long as keys
var iokeys = keys.map(function() {
	return 0;
});

// Make array of key divs from page
var keyboard = keys.map(function(i) {
	return document.getElementById(i);
});

// Make array of 255s as long as keys
var heatmap = keys.map(function(i) {
	return 255;
});

// Make array of portal divs from page
var portals = keys.map(function(i) {
	return document.getElementById(i + "-p");
});

// INITIALIZE PIANO ROLL -------------------
var score = document.getElementById("score");
var rollWidth = score.scrollWidth;
var noteWidth = 2;

// Add column of divs as tall as there are keys. Color them accoding to iokeys array passed in.
// This gets called in two places: on page load (generating the piano roll from scratch), and when keys are played.
var addRollColumn = function(array) {
	var column = document.createElement("div");
	column.style.width = noteWidth.toString() + "px";
	column.className = "rollColumn";
	score.appendChild(column);

	for (var j = 0; j < array.length; j++) {
		var row = document.createElement("div");
		if (array[array.length - 1 - j] == 0) {
			row.style.background = "#303030";
		} else {
			row.style.background = "#" + array[array.length - 1 - j].toString(16);
		}
		row.className = "rollRow";
		column.appendChild(row);
	};

	pianoRoll.push(column);
}

// Fill the roll with columns
var pianoRoll = [];
for (var i = 0; i < (rollWidth / noteWidth); i++) {
	addRollColumn(iokeys);
};



// MOUSE CONTROL -------------------

// On click, set iokeys[i] to userColor
document.body.onmousedown = function(e) {
	e = e || window.event;
	var elementId = e.target.id;

	n = keys.indexOf(elementId);
	iokeys[n] = userColor;

	send();
};

// On release, set iokeys[i] to 0
document.body.onmouseup = function(e) {
	e = e || window.event;
	var elementId = e.target.id;

	n = keys.indexOf(elementId);
	iokeys[n] = 0;

	send();
};

// KEYBOARD CONTROL ----------------

// Create array of charCodes to use for keyboard playing
var keychars = keys.map(function(i) {
	num = document.getElementById(i).firstElementChild.innerHTML.charCodeAt(0);
	// .charCodeAt returns ASCII values, and .keyCode returns Unicode. This obviously isn't helpful.
	// The lines below remaps the differences between ASCII and Unicode so the keys presses below work correctly.
	if (num == 44) {
		return 188;
	} else if (num == 46) {
		return 190;
	} else if (num == 47) {
		return 191;
	} else {
		return num;
	}
});

// On press, set iokeys[i] to userColor
window.onkeydown = function(e) {
	var c = e.which || e.keyCode;
	var n = keychars.indexOf(c);
	iokeys[n] = userColor;

	send();
};

// On release, set iokeys[i] to 0
window.onkeyup = function(e) {

	var c = e.which || e.keyCode;
	var n = keychars.indexOf(c);
	iokeys[n] = 0;

	send();
};

// SOUND CONTROL -------------------

// These ratios are from the harmonic series, which means this piano plays in Just Temperament, not Equal. That's fun.
var harmonics = [1., 17 / 16, 9 / 8, 19 / 16, 5 / 4, 21 / 16, 11 / 8, 3 / 2, 13 / 8, 27 / 16, 7 / 4, 15 / 8, 1. * 2, 17 / 16 * 2, 9 / 8 * 2, 19 / 16 * 2, 5 / 4 * 2, 21 / 16 * 2, 11 / 8 * 2, 3 / 2 * 2, 13 / 8 * 2, 27 / 16 * 2, 7 / 4 * 2, 15 / 8 * 2, 1. * 4];

// Create array of frequencies as long as harmonics
var frequencies = harmonics.map(function(i) {
	return i * c1;
});

// Create an array of audio samples from each key
var audioLibSamples = frequencies.map(function(hz) {
	param = ["sin",0.0000,0.4000,0.20,0.25,0.0000,0.10,20.0000,hz,20.0000,1.0000,1.0000,0.0000,0.0100,-0.3000,-1.0000,1.0000,0.0000,0.0000,-1.0000,0.0,1.0000,1.0000,1.0000,1.0000,1.0000,0.0000,-1.0000];


	return jsfxlib.createWave(param);
});


// SAY HELLO ON LOAD ------------------
// Send message on load to update number of connections
window.onload = function() {
	send();
};

// SEND AND RECEIVE ------------------

// Emit a message consisting of iokeys whenever send() is called
var send = function() {

	// Error check for people trying to break iokeys
	iosum = iokeys.reduce(function(prev, cur, i, arr) {
		if (cur != 0) {
			cur = 1;
		}
		return prev + cur;
	})

	if (iosum <= 5) {
		socket.emit('message', {"iokeys" : iokeys});
	}

};

// Connection counter
var footerDiv = document.getElementById("footer");
var connectionsDiv = document.getElementById("connections");
var instructionsDiv = document.getElementById("instructions");
var connectionCounter = function(connections) {
	var val = Math.round(connections * 10);
	document.body.style.background = "rgb(" + [val, val, val].join(",") + ")";

	// Change text colors according to number of connections, i.e., background color of page.
	// TODO: Adjust colors according to actual background color, not an estimate from connections
	if (connections == 1) {
		footerDiv.style.color = "#bbbbbb";
		connectionsDiv.innerHTML = "You're all alone.";
		instructionsDiv.style.color = "#bbbbbb";
	} else if (connections > 1 && connections < 13) {
		footerDiv.style.color = "#bbbbbb";
		connectionsDiv.innerHTML = connections + " musicians";
		instructionsDiv.style.color = "#bbbbbb";
	} else if (connections >= 13) {
		footerDiv.style.color = "#303030";
		connectionsDiv.innerHTML = connections + " musicians";
		instructionsDiv.style.color = "#303030";
	}
};

// All-important receive function. Does things upon receipt of message from server.
var receive = function(msg) {

	for (var i = 0; i < portals.length; i++) {
		if (msg[i] > 0) {
			// Light up LED
			portals[i].style.background = "#" + msg[i].toString(16);

			// Change key color according to heatmap
			heatmap[i]--;
			if (keys[i][2] == "f"){
				keyboard[i].style.background = "rgb(" + [255 - heatmap[i], 0, 0].join(",") + ")";
			} else {
				keyboard[i].style.background = "rgb(" + [255, heatmap[i], heatmap[i]].join(",") + ")";
			}

			// Play sound
			audioLibSamples[i].play();

			// Add notes to piano roll
			score.removeChild(score.firstElementChild);
			addRollColumn(msg);

		} else {
			// Turn off LED
			portals[i].style.background = "#000000";
		}
	};

};

// Send off array to receive() when sockets receives a message.
socket.on('message', function(msg) {
	receive(msg.iokeys);
});

// Send off number of active connections to connectionCounter()
socket.on('connections', function(connections) {
	connectionCounter(connections);
});
