import express from "express";
import multer from "multer";
import { uploadMediaController } from "../controllers/uploadController";
import { authenticate, requireVerified } from "../middleware/auth";
import { uploadLimiter } from "../middleware/rateLimiter";

const uploadRouter = express.Router();
// Use memory storage for direct buffer upload to Cloudinary stream
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } }); // 30MB max (images: 5MB, audio: 10MB, video: 30MB — enforced in controller)

uploadRouter.post("/", authenticate, requireVerified, uploadLimiter, upload.single("file"), uploadMediaController);

export { uploadRouter };
