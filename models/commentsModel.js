const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: [true, "comment can not be empty!"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    require: ["true", "user must belong to a post."],
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: "post",
    require: ["true", "comment must belong to a post."],
  },
});

// mongoose 前置器 pre hook, 有用到 find 開頭語法時觸發
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name id createdAt",
  });

  next();
});
const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
