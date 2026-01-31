const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")

const outputDir = path.join(__dirname, "outputs")

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const executeCpp = async (filePath) => {
  const fileId = path.basename(filePath).split(".")[0]
  const outputFilePath = path.join(outputDir, `${fileId}.out`)

  return new Promise((resolve, reject) => {
    exec(
      `g++ ${filePath} -o ${outputFilePath} && ${outputFilePath}`,
      (error, stdout, stderr) => {
       error && reject(error, stderr);
       stderr && reject(stderr);
       resolve (stdout);
      }
    )
  })
}

module.exports = executeCpp
