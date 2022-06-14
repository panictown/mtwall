const path = require("path");
const multer = require("multer");
const appError = require("../service/appError");

// multer 檔案上傳
// Multer is a node.js middleware for handling multipart/form-data
const upload = multer({
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
      // cb(new Error("檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。"));
      appError(400, "檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。", cb);
    }
    // null => 進到全域 error；true => next
    cb(null, true);
  },
})
  // Accepts all files that comes over the wire. An array of files will be stored in req.files.
  .any();

module.exports = upload;
