const codeQueue = require("./codeQueue");

// function to add new code into the queue
const addCodeToQueue = async ({ fileId, language, filePath }) => {
  await codeQueue.add({
    fileId,
    language,
    filePath
  });
};

module.exports = addCodeToQueue;
