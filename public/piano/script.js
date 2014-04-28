// Start the socket
var socket = io.connect('/');


var keys = ["c1", "d1f", "d1", "e1f", "e1", "f1", "g1f", "g1", "a1f", "a1", "b1f", "b1", "c2", "d2f", "d2", "e2f", "e2", "f2", "g2f", "g2", "a2f", "a2", "b2f", "b2", "c3"];

var iokeys = keys.map(function() {
	return 0;
});

var keyboard = keys.map(function(i) {
	return document.getElementById(i);
});

var portals = keys.map(function(i) {
	return document.getElementById(i + "-p");
});




// MOUSE CONTROL -------------------

document.body.onmousedown = function(e) {
	e = e || window.event;
	var elementId = e.target.id;

	n = keys.indexOf(elementId);
	iokeys[n] = 1;

	send();
}

document.body.onmouseup = function(e) {
	e = e || window.event;
	var elementId = e.target.id;

	n = keys.indexOf(elementId);
	iokeys[n] = 0;

	send();
}

// KEYBOARD CONTROL ----------------

var keychars = keys.map(function(i) {
	num = document.getElementById(i).firstElementChild.innerHTML.charCodeAt(0);
	// For some reason, the charCode and keyCode numbers are not the same for ',' and  '.'  and '/'
	// These remap those numbers so the keys presses below work correctly.
	if (num == 80) {
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
	iokeys[n] = 1;

	send();
}

window.onkeyup = function(e) {

	var c = e.which || e.keyCode;
	var n = keychars.indexOf(c);
	iokeys[n] = 0;

	send();
}



// SEND AND RECEIVE ------------------

var send = function() {
	socket.emit('message', {"iokeys" : iokeys});
}

var receive = function(msg) {

	// Light up LED if key is being pressed.
	for (var i = 0; i < portals.length; i++) {
		if (msg[i] == 1) {
			portals[i].style.background = "#ff0000";
		} else {
			portals[i].style.background = "#000000";
		}
	};

}

// Send off array to receive() when sockets receives a message.
socket.on('message', function(msg) {
	receive(msg.iokeys);
});
