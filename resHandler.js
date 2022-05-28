const successHandler = (res, data, isShowBody = true) => {
  res.status(200);
  if (isShowBody) {
    res.send({
      status: "success",
      data,
    });
  }
};

const errorHandler = (res, error = null, statusCode = 400) => {
  const message = statusCode == 404 ? "404 無此頁面:(" : "格式錯誤或無此id";
  const resBody = {
    status: "false",
    message,
  };
  if (error !== null) resBody.error = error;
  res.status(statusCode).send(resBody);
};

module.exports = { successHandler, errorHandler };
