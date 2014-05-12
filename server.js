// Load in packages
var express = require('express'),
	http = require('http'),
	app = express(),
	socketServer = http.createServer(app),
	io = require('socket.io').listen(socketServer);

// Tell express to load any file in the public folder
app.use(express.static(__dirname + '/public'));


// Launch server
var server = socketServer.listen(process.env.PORT || 5000, function() {
		console.log('Listening on port %d', server.address().port);
});

// Initiate socket called "connection". When packet of name "message" is received, immediately emit it as name "message".
// Also, emit number of clients connected.
io.sockets.on('connection', function(socket) {
	socket.on('message', function(message) {
		io.sockets.emit('message', message);
		io.sockets.emit('connections', io.sockets.clients().length);
	});
});
