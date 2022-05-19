const express = require('express');
const router = express.Router();
const urlController = require("../controllers/urlController")


// Create Url
router.post("/createUrl", urlController.createUser)
router.get("/:urlCode", urlController.getUrl)

module.exports = router;



