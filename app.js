var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http);

app.use(express.static(__dirname + '/public/views'));
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/bower_components'));

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
	console.log('New Connection...');

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
				// Send this specific user as whisper if the user exists
				if( Users[msgsplit[1]] ) {
					Users[msgsplit[1]].emit('whisper message', msgsplit.slice(2).join(' '), socket.username);
					// Send back to self to indicate the whisper was sent
					socket.emit('chat message', '[whisper] to ' + msgsplit[1] + ': ' + msgsplit.slice(2).join(' '));
					console.log('Whisper from:', socket.username,'to',msgsplit[1],msgsplit.slice(2).join(' '));
				}				
			}
			// TODO:  Add more chat commands, bring this out into its own handler for more complex 
			//        functions and implementations
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