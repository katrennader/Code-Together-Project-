const codeQueue = require("./codeQueue");

const addCodeToQueue = async ({ fileId, language, filePath, roomID, username }) => {
    try {
        await codeQueue.add("execute-code", {
            fileId,
            language,
            filePath,
            roomID,
            username
        });
        console.log("✅ Job added to queue:", fileId);
    } catch (err) {
        console.error("❌ Queue add error:", err);
    }

};

module.exports = addCodeToQueue;
