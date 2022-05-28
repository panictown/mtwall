const mongoose = require("mongoose");
const Post = require("../models/postsModel");
const User = require("../models/usersModel");
const Comment = require("../models/commentsModel");
const { successHandler } = require("../resHandler");
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");

module.exports = {
  getPosts: async (req, res, next) => {
    // asc 遞增(由小到大，由舊到新) createdAt
    // desc 遞減(由大到小、由新到舊) -createdAt * 預設
    const timeSort = req.query.timeSort == "asc" ? "createdAt" : "-createdAt";

    // content 關鍵字搜尋
    const q =
      req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {};

    const post = await Post.find(q)
      // 關聯式
      .populate({
        path: "user",
        select: "name photo ",
      })
      .populate({
        path: "comments",
        select: "comment user",
      })
      // 排序
      .sort(timeSort);
    successHandler(res, post);
  },
  getPost: handleErrorAsync(async (req, res, next) => {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return appError(400, "POST ID 格式錯誤", next);
    }

    if ((await Post.findById(id).exec()) === null) {
      return appError(400, "無此 POST ID", next);
    }

    const post = await Post.findById(id);
    res.status(200).json({
      status: "success",
      post,
    });
  }),
  postData: handleErrorAsync(async (req, res, next) => {
    const { content } = req.body;
    if (content === undefined) {
      return appError(400, "你沒有填寫 content 資料", next);
    }

    // if ((await User.findById(data.user).exec()) === null) {
    //   return appError(400, "無此 User ID", next);
    // }

    const newPost = await Post.create({
      user: req.user.id,
      content,
    });

    successHandler(res, newPost);
  }),
  deleteAllData: async (req, res, next) => {
    await Post.deleteMany({});
    const posts = await Post.find();
    successHandler(res, posts);
  },
  deleteData: async (req, res, next) => {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return appError(400, "POST ID 格式錯誤", next);
    }

    if ((await Post.findById(id).exec()) === null) {
      return appError(400, "無此 POST ID", next);
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
    });
  },
  patchData: async (req, res, next) => {
    const id = req.params.id;
    const data = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return appError(400, "POST ID 格式錯誤", next);
    }

    const newPost = await Post.findByIdAndUpdate(
      id,
      {
        name: data.name,
        content: data.content,
        image: data.image,
      },
      { new: true, runValidators: true }
    );

    if (
      newPost === null ||
      !(
        data.name !== undefined ||
        data.content !== undefined ||
        data.image !== undefined
      )
    ) {
      return appError(400, "格式錯誤或無此id", next);
    }
    successHandler(res, newPost);
  },
  like: handleErrorAsync(async (req, res, next) => {
    const id = req.params.id;

    await Post.findOneAndUpdate(
      { id },
      // $addToSet: 沒有 id 才 push，避免重複推
      { $addToSet: { likes: req.user.id } }
    );
    res.status(201).json({
      status: "success",
      postId: id,
      userId: req.user.id,
    });
  }),
  unlike: handleErrorAsync(async (req, res, next) => {
    const id = req.params.id;
    await Post.findOneAndUpdate({ id }, { $pull: { likes: req.user.id } });
    res.status(201).json({
      status: "success",
      postId: id,
      userId: req.user.id,
    });
  }),
  comment: handleErrorAsync(async (req, res, next) => {
    const user = req.user.id;
    const post = req.params.id;
    const { comment } = req.body;

    const newComment = await Comment.create({
      post,
      user,
      comment,
    });

    res.status(201).json({
      status: "success",
      data: {
        comments: newComment,
      },
    });
  }),
  getUserPosts: handleErrorAsync(async (req, res, next) => {
    const user = req.params.id;
    const posts = await Post.find({ user });

    res.status(200).json({
      status: "success",
      results: posts.length,
      posts,
    });
  }),
};
