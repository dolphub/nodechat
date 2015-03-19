var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
	socket.username = '';
	socket.broadcast.emit('new user', "New user has joined the channe");

	socket.on('disconnect', function() {
		socket.broadcast.emit('user disconnected', socket.username);
		console.log('User has disconnnected...');
	});

	socket.on('user login', function(_username) {
		if( _username ) {
			socket.username = _username;
			console.log('User logged in as', socket.username);
			socket.broadcast.emit('user login', socket.username);
		}			
	});

	socket.on('chat message', function(msg) {
		var message = socket.username + ': ' + msg;
		io.emit('chat message', message);
		console.log('Message',msg);
	})
});



http.listen(3000, function() {
	console.log('listening on *:3000');
});