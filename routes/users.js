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

// 追蹤朋友
router.post("/:id/follow", isAuth, UsersControllers.follow);

// 取消追蹤朋友
router.delete("/:id/unfollow", isAuth, UsersControllers.unfollow);

// 取得個人按讚列表
router.get("/getLikeList", isAuth, UsersControllers.getLikeList);

// 取得個人追蹤名單
router.get("/following", isAuth, UsersControllers.getFollowing);

module.exports = router;
