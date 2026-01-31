const mongoose = require("mongoose")
// this model will create for each file to calulate status , time taken to complie and give output

const fileSchema = new mongoose.Schema({
      language :{
        type :String ,
        required : true ,
        enum :["cpp","python","nodejs"]
      }, 
      filePath : {
        type :String, 
        required : true,
      },
      submittedAt :{
        type : Date,
        default : Date.now
      },
      startedAt :{
        type : Date
      },
      completedAt :{
        type : Date
      },
       output:{
        type : String
       },
       status :{
        type :String, 
        default :"running",
        enum :["success" , "running", "error"]
       }

})


const fileModel = mongoose.model("fileModel", fileSchema)

module.exports = fileModel

