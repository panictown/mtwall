var express = require("express");
var router = express.Router();
const UploadControllers = require("../controllers/uploadController");
const { isAuth } = require("../service/auth");
const upload = require("../service/upload");

// 上傳
router.post("/", isAuth, upload, UploadControllers);

module.exports = router;
