const { exec } = require("child_process")
const path = require("path")


const executeNodeJs = async (filePath) => {
  return new Promise((resolve, reject) => {
    exec( `node ${filePath}` , // no need to compile node.js code
      (error, stdout, stderr) => {
       error && reject(error, stderr);
       stderr && reject(stderr);
       resolve (stdout);
      }
    )
  })
}

module.exports = executeNodeJs
