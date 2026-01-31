const { exec } = require("child_process");

const executeNodeJs = (filePath) => {
  return new Promise((resolve, reject) => {
    exec(`node ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.log("Node.js Execution - error:", error , stderr);
        return reject(stderr || error.message);
      }
      if (stderr) {
        return reject(stderr);
      }
      resolve(stdout);
    });
  });
};

module.exports = executeNodeJs;
