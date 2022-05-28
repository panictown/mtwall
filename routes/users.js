var express = require("express");
var router = express.Router();
const UsersControllers = require("../controllers/usersController");
const { isAuth } = require("../service/auth");

// 註冊
router.post("/sign_up", UsersControllers.sign_up);

// 登入
router.post("/sign_in", UsersControllers.sign_in);

// 重設密碼
router.post("/updatePassword", isAuth, UsersControllers.updatePassword);

// 取得個人資料
router.get("/profile", isAuth, UsersControllers.getData);

// 更新個人資料
router.patch("/profile", isAuth, UsersControllers.patchData);

module.exports = router;
