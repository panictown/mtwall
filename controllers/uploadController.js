const { ImgurClient } = require("imgur");
const sizeOf = require("image-size");
const appError = require("../service/appError");
const handleErrorAsync = require("../service/handleErrorAsync");

module.exports = handleErrorAsync(async (req, res, next) => {
  const {
    files,
    query: { type },
  } = req;

  // 檔案必上傳
  if (!files.length) {
    return appError(400, "尚未上傳檔案", next);
  }

  // 頭貼 1:1
  if (type === "square") {
    const dimensions = sizeOf(files[0].buffer);
    if (dimensions.width !== dimensions.height) {
      return appError(400, "圖片長寬不符合 1:1 尺寸。", next);
    }
  }

  // 上傳至 imgur
  const client = new ImgurClient({
    clientId: process.env.IMGUR_CLIENTID,
    clientSecret: process.env.IMGUR_CLIENT_SECRET,
    refreshToken: process.env.IMGUR_REFRESH_TOKEN,
  });

  // imgur response
  const response = await client.upload({
    image: files[0].buffer.toString("base64"),
    type: "base64",
    album: process.env.IMGUR_ALBUM_ID,
  });

  // 上傳成功，抓取圖片 url link
  res.status(200).json({
    status: "success",
    imgUrl: response.data.link,
  });
});
