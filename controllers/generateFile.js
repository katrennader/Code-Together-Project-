
/* steps need to run code 
* start with cpp code 
  * generate c++ file will content the code that user send in request body format , code  
  * and we will run the file and send ouput in the reponse 
*/
const { StatusCodes } = require("http-status-codes")
const fs = require("fs")
const path = require("path")
const { v4: uuidv4 } = require("uuid") // get version 4 from uuid => used to generate unique id for each file as file name 

const dircodes = path.join(__dirname, "codes") // take file and put in codes folder 

console.log("heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
// check if folder not exist create it 
if (!fs.existsSync(dircodes)) fs.mkdirSync(dircodes, { recursive: true })

// generate file (create file name connect with dircodes to get file path , add code inside filepath)
const generateFile = async (language, code) => {   // format = extension 
  fileId = uuidv4();    // the first part of file name and the second is format == ID.format(extension) 
  const fileName = `${fileId}.${language}`  // create file name an now combine file name + dircodes to get file path
  const filePath = path.join(dircodes, fileName)
  
  fs.writeFileSync(filePath, code)
  return filePath
}
console.log("heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee22222")

module.exports = { generateFile }
