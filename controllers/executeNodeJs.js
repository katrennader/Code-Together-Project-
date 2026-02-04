const { exec } = require("child_process");
const fs = require("fs")
const path = require("path")

const outputDir = path.join(__dirname, "outputs")

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const executeNodeJs = (filePath) => {
  return new Promise((resolve, reject) => {
    exec(`node ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.log("Node Execution - error: ", error);
        return reject({
          stderr: stderr || error.message,
          message: error.message
        });
      }

      resolve(stdout || "");
    });
  });
};
module.exports = executeNodeJs;