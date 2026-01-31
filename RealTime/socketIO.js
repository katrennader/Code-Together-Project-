const room = require("../models/roomModel");

const socketHandler = (io) => {

    // users object to store socketID -> username
const users = {};

// Helper to get all connected clients in a room
const getALLConnectedClients = (roomID) => {
  return Array.from(io.sockets.adapter.rooms.get(roomID) || []).map(socketID => ({
    socketID,
    username: users[socketID] // may be undefined if user never joined properly
  })).filter(c => c.username); // filter out undefined usernames
};

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join Room
  socket.on("join-room", ({ roomID, username }) => {
    if (!username || !roomID) return; // safety check

    users[socket.id] = username;
    socket.join(roomID);

    const clients = getALLConnectedClients(roomID);
    console.log(`User ${username} joined room ${roomID}. Total members: ${clients.length}`);

    // Notify all users in the room
    io.to(roomID).emit("joined-room", { clients, username, socketID: socket.id });
    io.to(roomID).emit("update-members", { clients });
  });

  // Typing indicator
  socket.on("typing", ({ roomID, username }) => {
    io.to(roomID).emit("userTyping", username);
  });

  // Language change
  socket.on("change-lang", ({ roomID, username, language }) => {
    io.to(roomID).emit("language-change", { username, language });
  });

  // Code change
  socket.on("code-change", ({ roomID, code }) => {
    socket.to(roomID).emit("code-change", { code });
  });

  // Sync code for new user
  socket.on("sync-code", ({ socketID, code }) => {
    io.to(socketID).emit("code-change", { code });
  });

  // Code output from worker
  socket.on("code-output", (data) => {
    console.log('Output received:', data);
  });

  // Handle disconnecting
  socket.on("disconnecting", () => {
      const username = users[socket.id];
      const rooms = [...socket.rooms];
      // Finally delete user from the users object
      delete users[socket.id];

    rooms.forEach(roomID => {
      if (roomID === socket.id) return; // skip personal room

      // Notify others that this user is leaving
      io.to(roomID).emit("user-disconnected", { socketID: socket.id, username });

      // Send updated members list
      const updatedClients = getALLConnectedClients(roomID);
      console.log(`User ${username} disconnected from room ${roomID}. Updated members:`, updatedClients.length);
      io.to(roomID).emit("update-members", { clients: updatedClients });
    });

  });
});

}


module.exports = socketHandler 