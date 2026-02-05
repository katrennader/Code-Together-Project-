const Queue = require("bull");
require("dotenv").config();
console.log("🔵 Initializing Code Queue...");

const codeQueue = new Queue(
  "code-queue",
  process.env.REDIS_URL,
  {
    redis: {
      connectTimeout: 10000,
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    },
    defaultJobOptions: {
      attempts: 1,
      removeOnComplete: true,
      removeOnFail: true
    }
  });

// Add error event listeners for better diagnostics
codeQueue.on('error', (err) => {
  console.error('❌ Bull Queue Error:', err);
});
codeQueue.on('failed', (job, err) => {
  console.error(`❌ Job failed [${job.id}]:`, err);
});
codeQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job stalled [${job.id}]`);
});
codeQueue.on('waiting', (jobId) => {
  console.log(`⏳ Job waiting [${jobId}]`);
});
codeQueue.on('active', (job, jobPromise) => {
  console.log(`🚀 Job active [${job.id}]`);
});
codeQueue.on('completed', (job, result) => {
  console.log(`✅ Job completed [${job.id}]`);
});

console.log("🟢 Code Queue initialized...");

module.exports = codeQueue;
