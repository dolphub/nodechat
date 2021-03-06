

function nodeChat(_io, _http)
{
	this.users = {}; // Create object to store user socket ID's
	this.io = _io;	
	this.http = _http;
	// this.init();
}

/**
 * Starts the server
 */
nodeChat.prototype.start = function() {
	this.http.listen(3000, function() {
		console.log('NodeChat server started on port 3000');
	});
};


/**
 * Initializes the socket events
 */
nodeChat.prototype.init = function() {
	var self = this;
	/**
	 * @param {object} socket.io Object
	 * On new connection event handler
	 */
	this.io.on('connection', function(socket) {
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
				self.users[socket.username] = socket;
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
					if( self.users[msgsplit[1]] ) {
						self.users[msgsplit[1]].emit('whisper message', msgsplit.slice(2).join(' '), socket.username);
						// Send back to self to indicate the whisper was sent
						socket.emit('chat message', '[whisper] to ' + msgsplit[1] + ': ' + msgsplit.slice(2).join(' '));
						console.log('Whisper from:', socket.username,'to',msgsplit[1],msgsplit.slice(2).join(' '));
					}				
				}
				// TODO:  Add more chat commands, bring this out into its own handler for more complex 
				//        functions and implementations
			} else { // Emit to everyone the message
				self.io.emit('chat message', message);
				console.log('Message',message);
			}		
		})
	});

};


module.exports = nodeChat;