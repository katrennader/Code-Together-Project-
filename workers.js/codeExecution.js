module.exports = (io) => {
    const codeQueue = require("../queues/codeQueue");
    const File = require("../models/fileModel");
    const sanitizeError = require("./sanitizeErrorHandler");

    const executeCpp = require("../controllers/excecuteCpp");
    const executePython = require("../controllers/executePython");
    const executeNodeJs = require("../controllers/executeNodeJs");

    console.log("🟢 Code Worker is running...");

    codeQueue.process(async (job) => {
        const { fileId, language, filePath, roomId, username } = job.data;

        let output = "";
        let file;

        try {
            // fetch the file document
            file = await File.findById(fileId);
            if (!file) throw new Error("File not found");

            // mark start time
            file.startedAt = new Date();
            await file.save();

            // execute based on language
            if (language === "cpp") output = await executeCpp(filePath);
            else if (language === "python") output = await executePython(filePath);
            else if (language === "nodejs") output = await executeNodeJs(filePath);
            else throw new Error("Unsupported language");

            // success update
            file.completedAt = new Date();
            file.status = "success";
            file.output = output;
            file.errorType = null; // always null for success
            await file.save();

        
            // emit to frontend
            io.to(roomId).emit("code-output", {
                fileId: file._id,
                status: file.status,
                output: file.output,
                errorType: file.errorType ?? null, // safe null
                username,
                language
            });
            
            return output;
            
        } catch (error) {
            // catch execution errors
           const errorMsg = sanitizeError(error, language);
            let errorType = "RUNTIME_ERROR"; // default

            // 🔍 C++ errors
            if (language === "cpp") {
                if (errorMsg.includes("error:")) errorType = "COMPILATION_ERROR";
                else if (errorMsg.includes("Segmentation fault")) errorType = "SEGMENTATION_FAULT";
            }

            // 🔍 Python & Node.js errors
            if (language === "python" || language === "nodejs") {
                if (errorMsg.includes("SyntaxError") || errorMsg.includes("IndentationError")) {
                    errorType = "COMPILATION_ERROR";
                }
            }

            // 🔍 Timeout
            if (errorMsg.toLowerCase().includes("timed out")) {
                errorType = "TIMEOUT_ERROR";
            }

            // update DB safely
            if (file) {
                file.completedAt = new Date();
                file.status = "error";
                file.output = errorMsg;
                file.errorType = errorType; // always one of the enum
                await file.save();
            } else {
                // fallback if file was not found
                console.error("File not found for error update");
            }
            
            // emit error safely
            console.log("Emitting output to room:", roomId);
            io.to(roomId).emit("code-output", {
                fileId: fileId,
                status: "error",
                output: errorMsg,
                errorType: errorType ?? "RUNTIME_ERROR", // safe fallback
                username,
                language
            });

            throw error;
        }
    });
};
