const room = require("../models/roomModel");

const socketHandler = (io) => {

    const users = {};
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


    io.on("connection", (socket) => { 

        socket.on("join-room", ({ roomID, username }) => {  
            users[socket.id] = username;
            socket.join(roomID);  
            const clients = getALLConnectedClients(roomID);

            console.log(`User ${username} joined room ${roomID}. Total members:`, clients.length);

            // notify that new user was joined room 
            io.to(roomID).emit("joined-room", {
                clients, username, socketID: socket.id
            });

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



        socket.on("code-change", ({ roomID, code }) => {
            socket.to(roomID).emit("code-change", { code });
        })
        socket.on("sync-code", ({ socketID, code }) => {
            io.to(socketID).emit("code-change", { code });
        });
        
        socket.on("disconnecting", () => {
            const username = users[socket.id];
            const rooms = [...socket.rooms];
            
            delete users[socket.id];
            rooms.forEach(roomID => {
                if (roomID === socket.id) return;

                io.to(roomID).emit("user-disconnected", { socketID: socket.id, username });

                const updatedClients = getALLConnectedClients(roomID).filter(c => c.username);
                console.log(`User ${username} disconnected from room ${roomID}. Updated members:`, updatedClients.length);
                io.to(roomID).emit("update-members", { clients: updatedClients });
            });

        });

    })
}


module.exports = socketHandler 