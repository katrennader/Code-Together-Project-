const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")
const outputDir = path.join(__dirname, "outputs")

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}
const executePython = async (filePath) => {
  return new Promise((resolve, reject) => {
    exec(`python ${filePath}`, // no need to compile python code
      (error, stdout, stderr) => {
        console.log("Python Execution - error:", error);
        error && reject(error, stderr);
        stderr && reject(stderr);
        resolve(stdout);
      }
    )
  })
}

module.exports = executePython
