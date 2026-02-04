const { StatusCodes } = require("http-status-codes");
const { generateFile } = require("./generateFile");
const File = require("../models/fileModel");
const addCodeToQueue = require("../queues/addCodeTOQueue");

// Controller for queue-based execution
const runCodeController = async (req, res) => {
  console.log("🔥 runCodeController HIT");
  console.log("🧪 Request Body:", req.body);
  const { language, code, roomID, username } = req.body;

  if (!language || !code || !roomID || !username) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      msg: "Please provide language, code, roomID, and username",
    });
  }
  
  try {

    // 1️⃣ Generate code file
    console.log("🔥 Calling generateFile...");
    const filePath = await generateFile(language, code);
    console.log("🧪 Generated file at:", filePath);

    // 2️⃣ Save initial file document in DB
    const file = await File.create({
      language,
      filePath,
      status: "queued",
      submittedAt: new Date(),
      roomID,
    });
    console.log("🧪 File document created:", file._id);

    // 3️⃣ Add job to queue
    console.log("🧪 Adding job to queue...");
    await addCodeToQueue({
      fileId: file._id,
      language,
      filePath,
      roomID,
      username
    });
    console.log("🧪 Job added to queue");

    return res.status(StatusCodes.OK).json({
      success: true,
      msg: "Code has been queued for execution",
      fileId: file._id,
      status: 'queued',
    });
  } catch (error) {
    console.error("❌ Error in runCodeController:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: "Failed to queue code",
    });
  }
};

module.exports = { runCodeController };
