require('dotenv').config();
const express = require("express")
const app = express()
const http = require("http")
const Port = process.env.PORT || 5000
const connectDB = require("./DB/connectDB")
const { Server } = require("socket.io")   // take Server  class from library with capitale S
const roomRouter = require("./routes/room")
const socketHandler = require("./RealTime/socketIO")
const createCodeRouter = require("./routes/runCode")


// to have access on request body 
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // acceptt form_endcoded (data type written in body format)
app.use(express.static("public"))  // interact with public folder(client side )

app.use("/api/v1", roomRouter)

const myServer = http.createServer(app)
const io = new Server(myServer)
socketHandler(io)

// Mount code router with io instance
const codeRouter = createCodeRouter(io);
app.use("/api/v1", codeRouter);

const startServer = async () => {
    try {
        await connectDB();

        // Initialize code worker for queue processing
        const codeWorker = require("./workers.js/codeExecution");
        codeWorker(io);
        console.log("✅ Code Worker initialized");

        myServer.listen(Port, () => {
            console.log(`Server is running at port ${Port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();



