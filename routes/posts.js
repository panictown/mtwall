const express = require("express");
const router = express.Router();
const PostsControllers = require("../controllers/postsController");
const { isAuth } = require("../service/auth");

// 取得所有貼文
router.get("/posts", isAuth, PostsControllers.getPosts);

// 取得單一貼文
router.get("/posts/:id", isAuth, PostsControllers.getPost);

// 新增貼文
router.post("/posts", isAuth, PostsControllers.postData);

// DELETE ALL
router.delete("/posts", PostsControllers.deleteAllData);

// DELETE ONE
router.delete("/post/:id", PostsControllers.deleteData);

// PATCH
router.patch("/post/:id", PostsControllers.patchData);

// 新增一則貼文的讚
router.post("/posts/:id/like", isAuth, PostsControllers.like);

// 取消一則貼文的讚
router.delete("/posts/:id/unlike", isAuth, PostsControllers.unlike);

// 新增一則貼文的留言
router.post("/posts/:id/comment", isAuth, PostsControllers.comment);

// 取得個人所有貼文列表
router.get("/post/user/:id", PostsControllers.getUserPosts);

module.exports = router;
