var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

// Create object to store user socket ID's
Users = {};

/**
 * @param {object} socket.io Object
 * On new connection event handler
 */
io.on('connection', function(socket) {
	// Default username
	socket.username = '';

	// Broadcast to all other connected users that a new user is connecting
	socket.broadcast.emit('new user', "New user has joined the channel");

	// Disconnected event
	socket.on('disconnect', function() {
		socket.broadcast.emit('user disconnected', socket.username);
		console.log('User has disconnnected...');
	});

	// User login event
	socket.on('user login', function(_username) {
		if( _username ) {
			socket.username = _username;
			Users[socket.username] = socket;
			console.log('User logged in as', socket.username);
			socket.broadcast.emit('user login', socket.username);
		}
	});

	// Chat message event
	socket.on('chat message', function(msg) {
		// Add username to chat message, and split message to check for functions
		var message = socket.username + ': ' + msg; 
		// Get components of message
		var msgsplit = msg.split(' '); 
		// If we find a chat command
		if( msg[0] == '/' ) {
			if( msgsplit.length >= 3 && (msgsplit[0] == '/w' || msgsplit[0] == '/whisper' )) { // Whisper command
				// Send this specific user as whisper
				Users[msgsplit[1]].emit('whisper message', msgsplit.slice(2).join(' '), socket.username);
				// Send back to self to indicate the whisper was sent
				socket.emit('chat message', '[whisper] to ' + msgsplit[1] + ': ' + msgsplit.slice(2).join(' '));
				console.log('Whisper from:', socket.username,'to',msgsplit[1],msgsplit.slice(2).join(' '));
			}
		} else { // Emit to everyone the message
			io.emit('chat message', message);
			console.log('Message',message);
		}		
	})
});


// Start webserver and listen on port...
http.listen(3000, function() {
	console.log('listening on *:3000');
});