var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");
const uploadRouter = require("./routes/upload");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

// 資料庫連線
mongoose
  .connect(DB)
  .then(() => console.log("資料庫連接成功"))
  .catch((err) => {
    console.log("⚠️ 資料庫連接失敗", err);
  });

const app = express();

// node.js uncaughtException - 程式出現重大錯誤時
process.on("uncaughtException", (err) => {
  // log 紀錄
  console.error("⚠️ Uncaughted Exception");
  console.error(err);

  // 停掉該 process
  process.exit(1);
});

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", usersRouter);
app.use(postsRouter);
app.use("/upload", uploadRouter);

// 404
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "404 無此頁面:(",
  });
});

// express 錯誤管理 //////////////////////

// PRODUCTION
const resErrorProd = (err, res) => {
  // 可預期錯誤
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message,
    });
    return;
  }

  // 不可預期
  // log 紀錄
  console.error("⚠️ 出現重大錯誤", err);

  res.status(500).json({
    status: "error",
    message: "系統錯誤，請恰系統管理員",
  });
};

// DEV
const resErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  // DEV
  if (process.env.NODE_ENV === "dev") {
    return resErrorDev(err, res);
  }

  // PRODUCTION
  // ValidationError = 可預期錯誤
  if (err.name === "ValidationError") {
    err.message = "資料欄位未填寫正確，請重新輸入";
    err.isOperational = true;
  }
  resErrorProd(err, res);
});

// Node.js unhandledRejection 未捕捉到的 catch
process.on("unhandledRejection", (reason, promise) => {
  // log 紀錄
  console.error("⚠️ Unhandled Rejection：", promise, "🤯 原因：", reason);
});

module.exports = app;
