import express from "express";
import multer from "multer";
import { uploadMediaController } from "../controllers/uploadController";

const uploadRouter = express.Router();
// Use memory storage for direct buffer upload to Cloudinary stream
const upload = multer({ storage: multer.memoryStorage() });

uploadRouter.post("/", upload.single("file"), uploadMediaController);

export { uploadRouter };
