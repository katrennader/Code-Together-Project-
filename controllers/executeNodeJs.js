const { exec } = require("child_process");

const executeNodeJs = (filePath) => {
  return new Promise((resolve, reject) => {
    exec(`node ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.log("Node Execution - error: ", error);
        // ALWAYS reject on non-zero exit code
        return reject({
          stderr: stderr || error.message,
          message: error.message
        });
      }

      // If process exited successfully, resolve stdout
      resolve(stdout || "");
    });
  });
};
module.exports = executeNodeJs;