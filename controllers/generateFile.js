
/* steps need to run code 
* start with cpp code 
  * generate c++ file will content the code that user send in request body format , code  
  * and we will run the file and send ouput in the reponse 
*/
const fs = require("fs")
const path = require("path")
const { v4: uuidv4 } = require("uuid")

const dircodes = path.join(__dirname, "codes")

// check if folder not exist create it 
if (!fs.existsSync(dircodes)) fs.mkdirSync(dircodes, { recursive: true })

const generateFile = async (language, code) => {    
  fileId = uuidv4();  
  const fileName = `${fileId}.${language}`  
  const filePath = path.join(dircodes, fileName)
  
  fs.writeFileSync(filePath, code)
  return filePath
}

module.exports = { generateFile }
