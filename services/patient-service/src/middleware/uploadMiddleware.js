const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsBaseDir = path.join(__dirname, "..", "..", "uploads");
const reportsDir = path.join(uploadsBaseDir, "reports");
const avatarsDir = path.join(uploadsBaseDir, "avatars");

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reportsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `report-${uniqueSuffix}${ext}`);
  },
});

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const allowedReportMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

const allowedAvatarMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
];

const reportFileFilter = (req, file, cb) => {
  if (allowedReportMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed."), false);
  }
};

const avatarFileFilter = (req, file, cb) => {
  if (allowedAvatarMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPG, JPEG, and PNG images are allowed for profile photo."),
      false
    );
  }
};

const uploadReport = multer({
  storage: reportStorage,
  fileFilter: reportFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = {
  uploadReport,
  uploadAvatar,
};