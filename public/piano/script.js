// Start the socket
var socket = io.connect('/');

// CREATE UNIQUE USERCOLOR -------------------
var userColor = Math.round(Math.random() * 0xFFFFFF);


// INITIALIZE KEYBOARD MAPS -------------------

var c1 = 261.626;

var keys = ["c1", "d1f", "d1", "e1f", "e1", "f1", "g1f", "g1", "a1f", "a1", "b1f", "b1", "c2", "d2f", "d2", "e2f", "e2", "f2", "g2f", "g2", "a2f", "a2", "b2f", "b2", "c3"];


var iokeys = keys.map(function() {
	return 0;
});

var keyboard = keys.map(function(i) {
	return document.getElementById(i);
});

var heatmap = keys.map(function(i) {
	return 255;
});

var portals = keys.map(function(i) {
	return document.getElementById(i + "-p");
});

// INITIALIZE PIANO ROLL -------------------
var score = document.getElementById("score");
var rollWidth = score.scrollWidth;
var noteWidth = 4;

var addRollColumn = function(array) {
	var column = document.createElement("div");
	column.style.width = noteWidth.toString() + "px";
	column.className = "rollColumn";
	score.appendChild(column);

	for (var j = 0; j < array.length; j++) {
		var row = document.createElement("div");
		if (array[j] == 0) {
			row.style.background = "#303030";
		} else {
			row.style.background = "#" + array[j].toString(16);
		}
		row.className = "rollRow";
		column.appendChild(row);
	};

	pianoRoll.push(column);
}

var pianoRoll = [];
for (var i = 0; i < (rollWidth / noteWidth); i++) {
	addRollColumn(iokeys)
};



// MOUSE CONTROL -------------------

document.body.onmousedown = function(e) {
	e = e || window.event;
	var elementId = e.target.id;

	n = keys.indexOf(elementId);
	iokeys[n] = userColor;

	send();
};

document.body.onmouseup = function(e) {
	e = e || window.event;
	var elementId = e.target.id;

	n = keys.indexOf(elementId);
	iokeys[n] = 0;

	send();
};

// KEYBOARD CONTROL ----------------

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

window.onkeydown = function(e) {
	var c = e.which || e.keyCode;
	var n = keychars.indexOf(c);
	iokeys[n] = userColor;

	send();
};

window.onkeyup = function(e) {

	var c = e.which || e.keyCode;
	var n = keychars.indexOf(c);
	iokeys[n] = 0;

	send();
};

// SOUND CONTROL -------------------

var harmonics = [1., 17 / 16, 9 / 8, 19 / 16, 5 / 4, 21 / 16, 11 / 8, 3 / 2, 13 / 8, 27 / 16, 7 / 4, 15 / 8, 1. * 2, 17 / 16 * 2, 9 / 8 * 2, 19 / 16 * 2, 5 / 4 * 2, 21 / 16 * 2, 11 / 8 * 2, 3 / 2 * 2, 13 / 8 * 2, 27 / 16 * 2, 7 / 4 * 2, 15 / 8 * 2, 1. * 4];

var frequencies = harmonics.map(function(i) {
	return i * c1;
});

var audioLibSamples = frequencies.map(function(hz) {
	param = ["sin",0.0000,0.4000,0.20,0.25,0.0000,0.10,20.0000,hz,20.0000,1.0000,1.0000,0.0000,0.0100,-0.3000,-1.0000,1.0000,0.0000,0.0000,-1.0000,0.0,1.0000,1.0000,1.0000,1.0000,1.0000,0.0000,-1.0000];


	return jsfxlib.createWave(param);
});


// SEND AND RECEIVE ------------------

var send = function() {
	socket.emit('message', {"iokeys" : iokeys});
};

// Connection counter
var connectionCounter = function(connections) {
	var val = Math.round(connections * 10);
	document.body.style.background = "rgb(" + [val, val, val].join(",") + ")";

	if (connections > 13) {
		document.getElementById("instructions").style.color = "#303030"
		document.getElementsByTagName("a").style.color = "#303030"
	} else {
		document.getElementById("instructions").style.color = "#bbbbbb"
		document.getElementsByTagName("a").style.color = "#bbbbbb"
	}
};

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
