const { exec } = require("child_process")
const path = require("path")


const executePython = async (filePath) => {
  return new Promise((resolve, reject) => {
    exec( `python ${filePath}` , // no need to compile python code
      (error, stdout, stderr) => {
       error && reject(error, stderr);
       stderr && reject(stderr);
       resolve (stdout);
      }
    )
  })
}

module.exports = executePython
