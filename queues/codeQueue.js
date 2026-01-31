//  connect bull with redis 

const Queue = require("bull");
const codeQueue = new Queue("code-queue", {
  redis: {
    host: "127.0.0.1",
    port: 6379
  }
});

module.exports = codeQueue;
