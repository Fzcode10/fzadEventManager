const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profiles");
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extMatch = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeMatch = allowedTypes.test(file.mimetype);

  if (extMatch && mimeMatch) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, webp) are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

module.exports = upload;