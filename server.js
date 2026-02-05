require('dotenv').config();
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});



const express = require("express")
const app = express()
const http = require("http")
const Port = process.env.PORT || 5000
const connectDB = require("./DB/connectDB")
const { Server } = require("socket.io") 
const roomRouter = require("./routes/room")
const socketHandler = require("./RealTime/socketIO")
const createCodeRouter = require("./routes/runCode")


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public")) 

app.use("/api/v1", roomRouter)

const myServer = http.createServer(app)
const io = new Server(myServer)
socketHandler(io)

const codeRouter = createCodeRouter(io);
app.use("/api/v1", codeRouter);



const startServer = async () => {
    try {
        await connectDB();

        // Initialize code worker for queue processing
        const codeWorker = require("./workers/codeExecution");
        codeWorker(io);
        myServer.listen(Port, () => {
            console.log(`Server is running at port ${Port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();



