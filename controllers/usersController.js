const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const Post = require("../models/postsModel");
const User = require("../models/usersModel");
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");
const { generateSendJWT } = require("../service/auth");

module.exports = {
  sign_up: handleErrorAsync(async (req, res, next) => {
    let { email, password, confirmPassword, name } = req.body;

    // 暱稱除去空格
    name = validator.trim(name);

    // 欄位必填
    if (!email || !password || !confirmPassword || !name) {
      return next(appError(400, "欄位未填寫", next));
    }

    // 暱稱至少 2 個字元以上
    if (!validator.isLength(name, { min: 2 })) {
      return next(appError(400, "暱稱至少 2 個字元以上", next));
    }

    // 密碼一致
    if (password !== confirmPassword) {
      return next(appError(400, "密碼不一致", next));
    }

    // 密碼需至少 8 碼以上，並中英混合
    if (
      !validator.isStrongPassword(password, {
        minUppercase: 0,
        minNumbers: 1,
        minSymbols: 0,
      })
    ) {
      return next(appError(400, "密碼需至少 8 碼以上，並中英混合", next));
    }

    // 是否為 Email
    if (!validator.isEmail(email)) {
      return next(appError(400, "Email 格式不正確", next));
    }

    // Email 是否重複
    const isEmailUsed = await User.findOne({ email });
    if (isEmailUsed) {
      return next(appError(400, "Email 已被使用", next));
    }

    // 加密密碼
    password = await bcrypt.hash(req.body.password, 12);

    // DB：創建 User
    const newUser = await User.create({
      email,
      password,
      name,
    });

    // OK 發證
    generateSendJWT(newUser, 201, res);
  }),
  sign_in: handleErrorAsync(async (req, res, next) => {
    let { email, password } = req.body;

    // 欄位必填
    if (!email || !password) {
      return next(appError(400, "欄位未填寫", next));
    }

    // DB：撈取指定 User 密碼
    const user = await User.findOne({ email }).select("+password");

    // 比對密碼
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(appError(400, "密碼不正確", next));
    }

    // OK 發證
    generateSendJWT(user, 200, res);
  }),
  updatePassword: handleErrorAsync(async (req, res, next) => {
    let { password, confirmPassword } = req.body;

    // 欄位必填
    if (!password || !confirmPassword) {
      return next(appError(400, "欄位未填寫", next));
    }

    // 密碼一致
    if (password !== confirmPassword) {
      return next(appError(400, "密碼不一致", next));
    }

    // 密碼需至少 8 碼以上，並中英混合
    if (
      !validator.isStrongPassword(password, {
        minUppercase: 0,
        minNumbers: 1,
        minSymbols: 0,
      })
    ) {
      return next(appError(400, "密碼需至少 8 碼以上，並中英混合", next));
    }

    // 加密密碼
    newPassword = await bcrypt.hash(req.body.password, 12);

    // DB：更新 User 密碼
    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword,
    });

    // OK 發證
    generateSendJWT(user, 200, res);
  }),
  getData: handleErrorAsync(async (req, res, next) => {
    res.status(200).json({
      status: "success",
      user: req.user,
    });
  }),
  patchData: handleErrorAsync(async (req, res, next) => {
    let { name, photo, sex } = req.body;

    // 欄位必填
    if (!name || !photo || !sex) return next(appError(400, "欄位未填寫", next));

    // 格式驗證
    if (sex !== "male" && sex !== "female")
      return next(appError(400, "性別格式錯誤", next));

    // DB：更新 User 資料
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        photo,
        sex,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      user,
    });
  }),
  follow: handleErrorAsync(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return appError(400, "User ID 格式錯誤", next);
    }

    if ((await User.findById(req.params.id).exec()) === null) {
      return appError(400, "無此 User ID", next);
    }

    if (req.params.id === req.user.id) {
      return next(appError(401, "您無法追蹤自己", next));
    }

    // 雙向更新 many:many
    // 自己追蹤對方 (自己的 following)
    await User.updateOne(
      {
        _id: req.user.id,
        "following.user": { $ne: req.params.id },
      },
      {
        $addToSet: { following: { user: req.params.id } },
      }
    );
    // 對方被我追蹤 (對方的 follower)
    await User.updateOne(
      {
        _id: req.params.id,
        "followers.user": { $ne: req.user.id },
      },
      {
        $addToSet: { followers: { user: req.user.id } },
      }
    );

    res.status(200).json({
      status: "success",
      message: "您已成功追蹤！",
    });
  }),
  unfollow: handleErrorAsync(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return appError(400, "User ID 格式錯誤", next);
    }

    if ((await User.findById(req.params.id).exec()) === null) {
      return appError(400, "無此 User ID", next);
    }

    if (req.params.id === req.user.id) {
      return next(appError(401, "您無法取消追蹤自己", next));
    }

    // 雙向更新 many:many
    // 自己追蹤對方 (自己的 following)
    await User.updateOne(
      {
        _id: req.user.id,
      },
      {
        $pull: { following: { user: req.params.id } },
      }
    );
    // 對方被我追蹤 (對方的 follower)
    await User.updateOne(
      {
        _id: req.params.id,
      },
      {
        $pull: { followers: { user: req.user.id } },
      }
    );

    res.status(200).json({
      status: "success",
      message: "您已成功取消追蹤！",
    });
  }),
  getLikeList: handleErrorAsync(async (req, res, next) => {
    const likeList = await Post.find({
      likes: { $in: [req.user.id] },
    }).populate({
      path: "user",
      select: "name _id",
    });
    res.status(200).json({
      status: "success",
      likeList,
    });
  }),
  getFollowing: handleErrorAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate({
      path: "following.user",
      select: "name photo",
    });
    const followingList = user.following;
    res.status(200).json({
      status: "success",
      followingList,
    });
  }),
};
