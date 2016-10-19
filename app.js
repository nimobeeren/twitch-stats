var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var irc = require('irc');

// Declare public static directory
app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
	// Log socket connection
	console.log('Client connected:', socket.id);

	// Set up IRC client with anonymous account
	var ircClient = new irc.Client(
		'irc.chat.twitch.tv',
		'justinfan' + Math.floor(Math.random() * 99899 + 100) // Generates random username
	);

	// Add listener to record chat
	ircClient.addListener('message', function(from, to, message){
		// Send message to client
		socket.emit('chatMessage', from, to, message);
	});

	// Give feedback when client connects to a channel
	ircClient.addListener('join', function(message){
		console.log('Successfully joined');
		socket.emit('channelChangeSuccess');
	});

	// Join new channel when user changes it
	socket.on('channelChange', function(channel){
		console.log('Joining', channel);
		ircClient.join('#' + channel);
	});

	// Log socket disconnect
	socket.on('disconnect', function(){
		console.log('Client disconnected:', socket.id);
	});
});

// Start the server
http.listen(80, function(){
  console.log('Server listening on port 80');
});
