const Room = require("../models/roomModel")
const { StatusCodes } = require("http-status-codes")

// create new room 
const createRoom = async (req, res) => {
    try {
        const { roomId, username } = req.body
        console.log('Create room request:', { roomId, username });

        if (!roomId) {
            console.log('Room creation failed: roomId is missing');
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: "fail", message: "please enter roomId" })
        }

        const existingRoom = await Room.findOne({ roomId })
        if (existingRoom) {
            console.log('Room creation failed: Room already exists -', roomId);
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: `This room with ID ${roomId} was already created by: ${username} ` })
        }

        const newRoom = await Room.create({ roomId })
        console.log('Room created successfully:', roomId);

        return res
            .status(StatusCodes.CREATED)
            .json({ message: "Room is created successfully", room: newRoom })

    }
    catch (err) {
        console.error('Room creation error:', err.message);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Something went wrong: " + err.message });
    }

}
// join existing room

const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.body
        if (!roomId) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: "fail", message: "please enter roomId" })
        }
        const existingRoom = await Room.findOne({ roomId })
        if (!existingRoom) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({
                    message: `Room with Id ${roomId} not found. Please check room ID again`
                })
        }
        return res
            .status(StatusCodes.OK)
            .json({ message: "Room joined successfully" })
    } catch (err) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Something went wrong" });
    }

}


module.exports = {
    createRoom,
    joinRoom
}