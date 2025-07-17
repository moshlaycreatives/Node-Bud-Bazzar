import { BadRequestException } from "../errors/index.js";
import multer from "multer";
import fs from "fs";
import path from "path";

// ╔════════════════════════════════════════╗
// ║      Custom storage configuration      ║
// ╚════════════════════════════════════════╝
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "public/uploads";

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "_");

    cb(null, `${baseName}_${uniqueSuffix}${ext}`);
  },
});

// ╔═════════════════════════════════════╗
// ║        Optional file filter         ║
// ╚═════════════════════════════════════╝
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // ❌ Optional security: block potentially dangerous files
  const blockedExts = [".exe", ".sh", ".bat", ".cmd"];
  if (blockedExts.includes(ext)) {
    return cb(new BadRequestException("This file type is not allowed."), false);
  }

  cb(null, true);
};

// ╔════════════════════════════════════╗
// ║      Export "upload" function      ║
// ╚════════════════════════════════════╝
export const upload = multer({
  storage,
  fileFilter,
});
