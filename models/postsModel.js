const mongoose = require("mongoose");

// schema 開始
const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Content 未填寫"],
    },
    image: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // select: false,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "貼文 ID 未填寫"],
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// mongoose 虛擬引用語法 (類 join)
// 在 model post 開一個虛擬的 comments 欄位, 需要時 populate 拉 collection 資料顯示, 不直接存放在 post 避免超出 document 16MB 限制
// mongo db 原生: aggregate lookup
postSchema.virtual("comments", {
  ref: "Comment", // 引用的 model
  foreignField: "post", // model 比對的欄位
  localField: "_id", // local 比對的欄位
});
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
