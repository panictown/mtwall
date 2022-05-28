const express = require("express");
const router = express.Router();
const PostsControllers = require("../controllers/postsController");
const { isAuth } = require("../service/auth");

// GET
router.get("/posts", isAuth, PostsControllers.getData);

// POST
router.post("/posts", isAuth, PostsControllers.postData);

// DELETE ALL
router.delete("/posts", PostsControllers.deleteAllData);

// DELETE ONE
router.delete("/post/:id", PostsControllers.deleteData);

// PATCH
router.patch("/post/:id", PostsControllers.patchData);

module.exports = router;
