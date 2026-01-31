const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema({
    roomId:{
        type :String, 
        unique : true ,
        required : true 
    }
})

const room = mongoose.model("roomModel", roomSchema)
module.exports =room 