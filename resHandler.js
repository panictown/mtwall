const successHandler = (res, data, isShowBody = true) => {
  res.status(200);
  if (isShowBody) {
    res.send({
      status: "success",
      data,
    });
  }
};

module.exports = { successHandler };
