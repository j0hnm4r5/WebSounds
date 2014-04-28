// This connects to our own server.
var socket = io.connect('/');

// Variables for html elements.
// var controls = document.getElementById("controls"),
// 	btn = controls.querySelector("button"),
// 	input = controls.querySelector("#input"),
// 	textbox = document.getElementById("text");
var keyboard = $(".key").map(function() {
		return this;
	}).get().sort();

console.log(keyboard);


// Variables for color changes.
var clr = [0, 0, 0],
	rgb_index = 0;

// Variables for submit button text.
var submits = ["Submit", "Hit it!", "Yesss...", "What's up?", "MS Paint", "RGB!", "Color me.", "Add it!", "Rainbows", "No!", "Smack dat", "Mmhmmmmm", "Generate"];

// ---------------------


function makeSound(hz) {
	var data = [];
	var sampleRateHz = 44100;

	var seconds = .25;

	for (var i = 0; i < sampleRateHz * seconds; i++) {
		data[i] = Math.round(128 + 127 * Math.sin(i * 2 * Math.PI * hz / sampleRateHz));
	}


	//Riffwave stuff

	var audio = new Audio();
	var wave = new RIFFWAVE();

	wave.header.sampleRate = sampleRateHz;
	wave.header.numChannels = 1;

	wave.Make(data);
	audio.src = wave.dataURI;

	return audio;

}

var send = function() {
	// Sets msg to content of input box (minus extraneous whitespace), then removes text from input box.
	var msg = input.textContent.trim();
	input.innerHTML = "";

	msg = parseInt(msg);

	if (!isNaN(msg)) {
		if (rgb_index % 3 == 0) {
			clr[0] = msg % 256;
		} else if (rgb_index % 3 == 1) {
			clr[1] = msg % 256;
		} else {
			clr[2] = msg % 256;
		}

		rgb_index++;

	} else {
		console.log("NaN");
	}


	// Emits json packet to socket with name "message".
	socket.emit('message', {
		"clr" : clr,
		"rgb_index" : rgb_index,
		"textmsg" : msg
	});

	btn.innerHTML = submits[rgb_index % submits.length];

	var sound = makeSound(msg);
	sound.play();

}

// ---------------------

var receive = function(clr, rgb_index, textmsg) {

	// If background is light, make all drawing elements black. If it's dark, make everything white.
	if (clr[0] + clr[1] + clr[2] > 400) {
		btn.style.color = "black";
		input.style.background = "black";
		input.style.color = "white";
		controls.style.borderColor = "black";
		document.body.style.color = "black";
	} else {
		btn.style.color = "white";
		input.style.background = "white";
		input.style.color = "black";
		controls.style.borderColor = "white";
		document.body.style.color = "white";
	}

	// Change the background color
	document.body.style.backgroundColor = "rgb(" + clr[0] + "," + clr[1] + "," + clr[2] + ")";
	btn.style.backgroundColor = "rgb(" + clr[0] + "," + clr[1] + "," + clr[2] + ")";

	// Put the number entered in a div inside textbox. Set the color to the background color at the time.
	var number = document.createElement("span");
	number.style.color = btn.style.backgroundColor = "rgb(" + clr[0] + "," + clr[1] + "," + clr[2] + ")";
	number.innerHTML = textmsg % 256 + " ";
	textbox.appendChild(number);
}

// ---------------------

// On button click, initiate send()
btn.addEventListener("click", send, false);

// If enter key is pressed, initiate send()
window.onkeydown = function(e) {
	if (e.keyCode == 13 || e.charCode == 13) { // Enter key
		send();
		return false;
	}
}

// If message with type "message" is in socket, and the ID does not match your own, initiate receive()
socket.on('message', function(msg) {
	receive(msg.clr, msg.rgb_index, msg.textmsg);
});
