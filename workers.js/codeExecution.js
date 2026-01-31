module.exports = (io) => {
    const codeQueue = require("../queues/codeQueue");
    const File = require("../models/fileModel");
    const executeCpp = require("../controllers/excecuteCpp");
    const executePython = require("../controllers/executePython");
    const executeNodeJs = require("../controllers/executeNodeJs");

    console.log("🟢 Code Worker is running...");

    codeQueue.process(async (job) => {
        const { fileId, language, filePath, roomId, username } = job.data; // include roomId and username
        let output;

        try {
            // update start time
            const file = await File.findById(fileId);
            file.startedAt = new Date();
            await file.save();

            // execute based on language
            if (language === "cpp") output = await executeCpp(filePath);
            else if (language === "python") output = await executePython(filePath);
            else if (language === "nodejs") output = await executeNodeJs(filePath);
            else throw new Error("Unsupported language");

            // update success
            file.completedAt = new Date();
            file.status = "success";
            file.output = output;
            await file.save();

            // 🔥 Emit output to all clients in the room
            io.to(roomId).emit("code-output", {
                fileId,
                status: "success",
                output,
                username: username,
                language: language
            });

            return output;

        } catch (error) {
            await File.findByIdAndUpdate(fileId, {
                completedAt: new Date(),
                status: "error",
                output: error.message
            });

            // Emit error to room
            io.to(roomId).emit("code-output", {
                fileId,
                status: "error",
                output: error.message,
                username: username,
                language: language
            });

            throw error;
        }
    });
};
