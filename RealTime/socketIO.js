const room = require("../models/roomModel");

const socketHandler = (io) => {

    // users object to store socket id with username {socketID:username}
    const users = {};
    // get list of members who set in the same room (clients array of objects([{socketID, username},...]))
    const getALLConnectedClients = (roomID) => {
        const socketIDs = Array.from(io.sockets.adapter.rooms.get(roomID) || []);
        const clients = socketIDs.map((socketID) => {
            return {
                socketID,
                username: users[socketID]
            }
        });
        return clients;
    }


    // start connection with io listen to event that is emitted by client side 
    io.on("connection", (socket) => { // every client make new connection to server it has socket to make request any time 

        socket.on("join-room", ({ roomID, username }) => { // in client will appear to add room Id and also username of the member 
            users[socket.id] = username;// to see the username of memeber in screen not his id 
            socket.join(roomID);   // codes will only appear to the memebrs who only have the same room id 
            const clients = getALLConnectedClients(roomID);

            console.log(`User ${username} joined room ${roomID}. Total members:`, clients.length);

            // notify that new user was joined room - send to ALL users in the room (including the new user)
            io.to(roomID).emit("joined-room", {
                clients, username, socketID: socket.id
            });

            // Also emit updated members to ensure everyone has the correct count
            io.to(roomID).emit("update-members", { clients });
        });

        // typing appearance  
        socket.on("typing", ({ roomID, username }) => {
            // notify all members in the room who is typing now 
            io.to(roomID).emit("userTyping", username)
        });

        // change language in the editor we want to notify all members 
        socket.on("change-lang", ({ roomID, username, langauge }) => {
            io.to(roomID).emit("language-change", username, langauge)
        })



        // make notification that code change to all other clients in the room except the one who made the change 
        socket.on("code-change", ({ roomID, code }) => {
            socket.to(roomID).emit("code-change", { code });
        })
        // sync code for new user who joined the room give me the current code using socketID to send code only to him 
        // because when new user join the room the code editor will be empty so we need to send him the existing code
        socket.on("sync-code", ({ socketID, code }) => {
            io.to(socketID).emit("code-change", { code });
        });
        
        socket.on("disconnecting", () => {
            const username = users[socket.id];
            const rooms = [...socket.rooms];
            
            // Now safe to delete
            delete users[socket.id];
            rooms.forEach(roomID => {
                if (roomID === socket.id) return; // skip own room

                // Notify others first
                io.to(roomID).emit("user-disconnected", { socketID: socket.id, username });

                // Send updated members list
                const updatedClients = getALLConnectedClients(roomID).filter(c => c.username);
                console.log(`User ${username} disconnected from room ${roomID}. Updated members:`, updatedClients.length);
                io.to(roomID).emit("update-members", { clients: updatedClients });
            });

        });

    })
}


module.exports = socketHandler 