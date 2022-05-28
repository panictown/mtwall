const jwt = require("jsonwebtoken");
const User = require("../models/usersModel");
const handleErrorAsync = require("./handleErrorAsync");
const appError = require("./appError");

// 登入狀態驗證
const isAuth = handleErrorAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(appError(401, "尚未登入", next));
  }

  // 驗證 token 正確性
  const decoded = await new Promise((resolve, reject) => {
    // 解密 JWT：jwt.verify(token, secretOrPublicKey, [options, callback])
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
  const currentUser = await User.findById(decoded.id);

  // req 加上 user 資訊，讓 next 可取用
  req.user = currentUser;
  next();
});

const generateSendJWT = (user, statusCode, res) => {
  const { _id, name } = user;
  // 產生 JWT token 通行證：payload、secret、option
  const token = jwt.sign({ id: _id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    user: {
      token,
      name,
    },
  });
};

module.exports = { isAuth, generateSendJWT };
