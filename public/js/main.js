var app = angular.module('nodeChat', ['ui.bootstrap','cgPrompt']);

app.factory('socket', function() {
	var socket = io.connect('http://localhost:3000');
	return socket;
});

app.controller('chatCtrl', ['$scope', 'socket', 'prompt', function($scope, socket, prompt) {
	$scope.headerMessage = "Welcome to NodeChat!";
	$scope.subMessage = "Powered by Socket.IO, AngularJS and NodeJS";
	$scope.msgQueue = [];
	$scope.msg = "";
	$scope.username = "";


	/**
	 * @param {object} Keypress Event
	 * On Enter key it will send the message to the server
	 */
	$scope.sendMessage = function(e) {
	  if( e.which === 13 && $scope.msg !== "" ) {
	  	socket.emit('chat message', $scope.msg);
	  	$scope.msg = "";
	  }	    
	}

	// Message event
	socket.on('chat message', function(msg) {
	  $scope.addMsg(msg);
	});

	// New user has logged in
    socket.on('user login', function(usr) {
      $scope.addMsg(usr + ' has joined the channel.');
    });
    
    // Private message
    socket.on('whisper message', function(msg, usr) {
      $scope.addMsg('[' + usr + '] whispers: ' + msg);
    });

    // User has left the channel
    socket.on('user disconnected', function(usr) {
      $scope.addMsg(usr + ' has disconnected.');
    });

    /**
     * @param {string} Message to put into the messageQueue
     * Adds a message to the message model
     */
    $scope.addMsg = function(msg)
    {
    	$scope.msgQueue.push({'text': msg});
    	$scope.$digest(); // This function is called by an event, must digest
    }

    /**
     * Prompts the user for their username, and ensures 
     * they have a username before allowing to participate
     */
    $scope.promptUsername = function() {
    	prompt({
			"title": "Login",
			"message": "",
			"input": true,
			"label": "Enter a Username",
			"value": ""
		}).then(function(result){
			$scope.username = result;
			socket.emit('user login', result);
			$scope.addMsg('Welcome to NodeChat v1.0.0 ' + result + '!');			
		}).finally(function() {  // Checks to see if they have entered a username or not
			if( $scope.username === "" )
				$scope.promptUsername();
		});
    };

}]);