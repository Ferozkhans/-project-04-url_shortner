const express = require('express');
const router = express.Router();
const urlController = require("../controllers/urlController")

// Create Url
router.post("/createUrl",urlController.createUrl)

module.exports = router;     



