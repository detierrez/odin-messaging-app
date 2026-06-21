require("dotenv/config");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadAvatar = async (req, res, next) => {
  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "odinbox/avatars",
    });
    req.avatarUrl = result.secure_url;
  }

  next();
};

const uploadAttachment = async (req, res, next) => {
  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "odinbox/attachments",
    });
    req.attachmentUrl = result.secure_url;
  }

  next();
};

module.exports = { uploadAvatar, uploadAttachment };
