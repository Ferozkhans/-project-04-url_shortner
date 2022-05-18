const express = require('express');
const router = express.Router();
const urlController = require("../controllers/urlController")


// Create Url
router.post("/createUrl", urlController.createUrl)
// router.get("/:getUrl", urlController.getUrl)
router.get("/:urlCode", urlController.getUrl)

module.exports = router;



