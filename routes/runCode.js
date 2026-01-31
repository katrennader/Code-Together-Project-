const express = require('express');
const codeRouter = express.Router()
const { runCodeController } = require("../controllers/runCodeController")

// Create a middleware factory to inject io instance
module.exports = (io) => {
    codeRouter.post("/runCode", (req, res) => runCodeController(req, res, io))
    return codeRouter
}