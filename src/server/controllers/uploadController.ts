import { Request, Response } from "express";
import { uploadMedia } from "../services/cloudinaryService";

export const uploadMediaController = async (req: Request | any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const { type } = req.body; // 'image' or 'audio'
    
    // File validation
    if (type === 'image') {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Invalid image format. Allowed: jpg, png, webp" });
      }
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "Image exceeds 5MB limit" });
      }
    } else if (type === 'audio') {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/webm'];
      if (!validTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Invalid audio format. Allowed: mp3, wav, webm" });
      }
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ error: "Audio exceeds 10MB limit" });
      }
    } else if (type === 'video') {
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!validTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Invalid video format. Allowed: mp4, webm, ogg, mov" });
      }
      if (file.size > 30 * 1024 * 1024) {
        return res.status(400).json({ error: "Video exceeds 30MB limit" });
      }
    } else {
        return res.status(400).json({ error: "Invalid type specified. Must be 'image', 'audio', or 'video'" });
    }

    const folder = type === 'image' ? 'cards/images' : type === 'audio' ? 'cards/audio' : 'cards/videos';
    const resourceType = type === 'audio' ? 'video' : 'image'; // Cloudinary treats audio as video for some endpoints or 'auto'

    const uploadResult: any = await uploadMedia(file.buffer, folder, 'auto');
    
    // Using simple payload returning just URL
    const mediaUrl = uploadResult.secure_url;
    
    res.json({ success: true, url: mediaUrl, publicId: uploadResult.public_id, format: uploadResult.format });
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ error: "Failed to upload media" });
  }
};
