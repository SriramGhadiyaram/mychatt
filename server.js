const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Set up the app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (like index.html)
app.use(express.static('public'));

// Store usernames by socket ID
let usernames = {};

// When a user connects
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle username set
  socket.on('set-username', (username) => {
    usernames[socket.id] = username;  // Store username by socket ID
    console.log(`${username} has set their username.`);

    // Notify other users about the new user
    io.emit('update-user-list', Object.values(usernames));  // Broadcast updated user list
  });

  // Handle new message
  socket.on('send-message', (message) => {
    const senderId = usernames[socket.id] || 'Unknown'; // Use the stored username or default to 'Unknown'
    io.emit('receive-message', message, senderId);  // Send the message to everyone
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    delete usernames[socket.id];  // Remove username from the list when user disconnects
    io.emit('update-user-list', Object.values(usernames));  // Broadcast updated user list
  });
});

// Start server on port 3000
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
