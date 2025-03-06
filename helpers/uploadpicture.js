const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    console.log(`File is being uploaded to: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const fileFilter = (req, file, cb) => {
  try {
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    console.log("Invalid file type:", file.mimetype);
    return cb(null, false);
  } catch (error) {
    console.log("Error in file filter:", error);
    return cb(null, false);
  }
};

// Correctly export multer instance
const uploadpicture = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

module.exports = uploadpicture;
