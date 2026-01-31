const { StatusCodes } = require("http-status-codes");
const { generateFile } = require("../controllers/generateFile");
const File = require("../models/fileModel");
const addCodeToQueue = require("../queues/addCodeTOQueue");
const executeCpp = require("../controllers/excecuteCpp");
const executePython = require("../controllers/executePython");
const executeNodeJs = require("../controllers/executeNodeJs");

// Execute code (queue-based OR direct execution if Redis unavailable)
const runCodeController = async (req, res, io) => {
  const { language, code, roomId, username } = req.body;

  if (!language || !code || !roomId || !username) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      msg: "Please enter language, code, roomId, and username"
    });
  }

  try {
    //Generate file
    const filePath = await generateFile(language, code);

    //Save initial DB document
    const file = await File.create({
      language,
      filePath,
      status: "running",
      submittedAt: new Date()
    });

    // Try to execute directly (for when Redis is not available)
    try {
      let output;

      // Execute based on language
      if (language === "cpp") output = await executeCpp(filePath);
      else if (language === "python") output = await executePython(filePath);
      else if (language === "javascript" || language === "nodejs") output = await executeNodeJs(filePath);
      else throw new Error("Unsupported language");

      // Update file with success
      file.completedAt = new Date();
      file.status = "success";
      file.output = output;
      await file.save();

      // Broadcast output to all users in the room via Socket.io
      if (io) {
        io.to(roomId).emit("code-output", {
          fileId: file._id,
          status: "success",
          output: output,
          username: username,
          language: language
        });
      }

      // Return output directly to client
      return res.status(StatusCodes.OK).json({
        success: true,
        output: output,
        fileId: file._id
      });

    } catch (executionError) {
      // If direct execution fails, try queue as fallback
      console.log("Direct execution failed, trying queue:", executionError.message);

      // Add job to queue as fallback
      addCodeToQueue({ fileId: file._id, language, filePath, roomId, username });

      // Respond with pending status
      return res.status(StatusCodes.CREATED).json({
        success: true,
        msg: "Code queued for execution",
        fileId: file._id,
        status: "queued"
      });
    }

  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: "Something went wrong"
    });
  }
};

module.exports = { runCodeController };
