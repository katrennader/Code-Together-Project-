const Queue = require("bull");
require("dotenv").config();
console.log("🔵 Initializing Code Queue...");

const codeQueue = new Queue("code-queue", {
  redis: {
    url: process.env.REDIS_URL,
    connectTimeout: 3000,
    maxRetriesPerRequest: 1,
  },
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: true,
    removeOnFail: true
  }
});

console.log("🟢 Code Queue initialized...");

module.exports = codeQueue;
