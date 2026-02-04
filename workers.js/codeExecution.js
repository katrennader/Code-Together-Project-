module.exports = (io) => {
  const codeQueue = require("../queues/codeQueue");
  const File = require("../models/fileModel");
  const sanitizeError = require("./sanitizeErrorHandler");

  const executeCpp = require("../controllers/excecuteCpp");
  const executePython = require("../controllers/executePython");
  const executeNodeJs = require("../controllers/executeNodeJs");

  console.log("🟢 Code Worker is running...");
  codeQueue.process("execute-code", async (job) => {
    const { fileId, language, filePath, roomID, username} = job.data;

    let output = "";
    let file;

    try {
      file = await File.findById(fileId);
      if (!file) return console.log("File not found:", fileId);

      file.startedAt = new Date();
      await file.save();

      if (language === "cpp") output = await executeCpp(filePath);
      else if (language === "python") output = await executePython(filePath);
      else if (language === "nodejs") output = await executeNodeJs(filePath);

      file.completedAt = new Date();
      file.status = "success";
      file.output = output;
      file.errorType = null;
      await file.save();

      console.log("🟢 Emitting output to frontend...");
      io.to(roomID).emit("code-output", { status: "success", output,errorType: null, username, language });
            console.log("🟢 Code execution completed successfully.");

      return output;
    } catch (err) {
      const rawError = err.stderr || err.message || String(err);
      const errorMsg = sanitizeError({ stderr: rawError }, language);
      const errorType = "RUNTIME_ERROR";

      if (file) {
        file.completedAt = new Date();
        file.status = "error";
        file.output = errorMsg;
        file.errorType = errorType;
        await file.save();
      }

      io.to(roomID).emit("code-output", { status: "error", output: errorMsg, username, language, errorType });
      return errorMsg;
    }
  });
};
