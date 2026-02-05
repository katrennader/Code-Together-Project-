const { StatusCodes } = require("http-status-codes");
const { generateFile } = require("./generateFile");
const File = require("../models/fileModel");
const addCodeToQueue = require("../queues/addCodeTOQueue");

const runCodeController = async (req, res) => {
  console.log("🔥 runCodeController HIT");
  const { language, code, roomID, username } = req.body;

  if (!language || !code || !roomID || !username) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      msg: "Please provide language, code, roomID, and username",
    });
  }
  
  try {
   console.log("🧪 Generating file for code execution...");
    const filePath = await generateFile(language, code);

    console.log("🧪 Creating file in database...");
    const file = await File.create({
      language,
      filePath,
      status: "queued",
      submittedAt: new Date(),
      roomID,
    });

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
