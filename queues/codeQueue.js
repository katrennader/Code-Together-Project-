          //  connect bull with redis 
require("dotenv").config();

const Queue = require("bull");
const Redis = require("ioredis");

const codeQueue = new Queue("code-queue", {
  redis: {
    host: process.env.REDIS_HOST 
    , port: process.env.REDIS_PORT
  }
});
module.exports = codeQueue;


