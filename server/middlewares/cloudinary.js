require("dotenv/config");
const { v2: cloudinary } = require("cloudinary");
const { parseFile } = require("./multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = (fieldName) => [
  parseFile(fieldName),
  async (req, res, next) => {
    const file = req[fieldName];
    if (file) {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: `odinbox/${req.user.id}/${fieldName}`,
      });
      req[`${fieldName}Url`] = result.secure_url;
    }

    next();
  },
];

module.exports = { uploadFile };
