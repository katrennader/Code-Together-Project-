const codeQueue = require("./codeQueue");

// function to add new code into the queue
const addCodeToQueue = async ({ fileId, language, filePath, roomId, username }) => {
  await codeQueue.add({
    fileId,
    language,
    filePath,
    roomId,   
    username 
  });
};

module.exports = addCodeToQueue;
