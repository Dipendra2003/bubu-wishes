import express, { Request, Response } from "express";
import { db } from "../../db/index";
import { mediaLibrary } from "../../db/schema";
import { authenticate } from "../middleware/auth";
import { eq, and, desc } from "drizzle-orm";
import multer from "multer";
import { uploadMedia, deleteMedia } from "../services/cloudinaryService";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Get all media for authenticated user
router.get("/", authenticate, async (req: Request | any, res: Response) => {
  try {
    const userId = req.user.id;
    const mediaType = req.query.type; // Optional filter: 'image' or 'audio'
    
    let query = db
      .select()
      .from(mediaLibrary)
      .where(eq(mediaLibrary.userId, userId))
      .orderBy(desc(mediaLibrary.createdAt));
    
    const media = await query;
    
    // Filter by type if specified
    const filteredMedia = mediaType 
      ? media.filter(m => m.mediaType === mediaType)
      : media;
    
    res.json({ success: true, media: filteredMedia });
  } catch (error: any) {
    console.error("Error fetching media library:", error);
    res.status(500).json({ error: "Failed to fetch media library" });
  }
});

// Upload new media to library
router.post("/", authenticate, upload.single('file'), async (req: Request | any, res: Response) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const { type } = req.body; // 'image', 'audio', or 'video'
    
    // File validation
    if (type === 'image') {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Invalid image format. Allowed: jpg, png, webp, gif" });
      }
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "Image exceeds 5MB limit" });
      }
    } else if (type === 'audio') {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mp4'];
      if (!validTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Invalid audio format. Allowed: mp3, wav, webm, ogg" });
      }
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ error: "Audio exceeds 10MB limit" });
      }
    } else if (type === 'video') {
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!validTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Invalid video format. Allowed: mp4, webm, ogg, mov" });
      }
      if (file.size > 50 * 1024 * 1024) {
        return res.status(400).json({ error: "Video exceeds 50MB limit" });
      }
    } else {
      return res.status(400).json({ error: "Invalid type specified. Must be 'image', 'audio', or 'video'" });
    }

    const folder = type === 'image' ? 'media_library/images' : type === 'audio' ? 'media_library/audio' : 'media_library/videos';
    const resourceType = type === 'image' ? 'image' : 'video'; // Cloudinary treats audio and video as 'video'
    const uploadResult: any = await uploadMedia(file.buffer, folder, resourceType);
    
    // Create media library entry
    const newMedia = await db.insert(mediaLibrary).values({
      userId,
      mediaType: type,
      mediaUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileName: file.originalname,
      fileSize: file.size.toString(),
      mimeType: file.mimetype,
      thumbnail: type === 'image' ? uploadResult.secure_url : (uploadResult.thumbnail_url || null),
      usageCount: '0',
    }).returning();
    
    res.json({ 
      success: true, 
      media: newMedia[0],
      message: "Media uploaded to library successfully" 
    });
  } catch (error: any) {
    console.error("Error uploading to media library:", error);
    res.status(500).json({ error: "Failed to upload media to library" });
  }
});

// Update media metadata
router.patch("/:id", authenticate, async (req: Request | any, res: Response) => {
  try {
    const userId = req.user.id;
    const mediaId = req.params.id;
    const { fileName } = req.body;
    
    // Check ownership
    const media = await db
      .select()
      .from(mediaLibrary)
      .where(and(eq(mediaLibrary.id, mediaId), eq(mediaLibrary.userId, userId)))
      .limit(1);
    
    if (!media.length) {
      return res.status(404).json({ error: "Media not found or unauthorized" });
    }
    
    // Update only allowed fields
    const updated = await db
      .update(mediaLibrary)
      .set({ 
        fileName: fileName || media[0].fileName,
      })
      .where(eq(mediaLibrary.id, mediaId))
      .returning();
    
    res.json({ success: true, media: updated[0] });
  } catch (error: any) {
    console.error("Error updating media:", error);
    res.status(500).json({ error: "Failed to update media" });
  }
});

// Track media usage (increment usage count)
router.post("/:id/use", authenticate, async (req: Request | any, res: Response) => {
  try {
    const userId = req.user.id;
    const mediaId = req.params.id;
    
    // Check ownership
    const media = await db
      .select()
      .from(mediaLibrary)
      .where(and(eq(mediaLibrary.id, mediaId), eq(mediaLibrary.userId, userId)))
      .limit(1);
    
    if (!media.length) {
      return res.status(404).json({ error: "Media not found or unauthorized" });
    }
    
    const currentCount = parseInt(media[0].usageCount || '0');
    
    // Increment usage count
    const updated = await db
      .update(mediaLibrary)
      .set({ 
        usageCount: (currentCount + 1).toString(),
        lastUsedAt: new Date(),
      })
      .where(eq(mediaLibrary.id, mediaId))
      .returning();
    
    res.json({ success: true, media: updated[0] });
  } catch (error: any) {
    console.error("Error tracking media usage:", error);
    res.status(500).json({ error: "Failed to track media usage" });
  }
});

// Delete media from library
router.delete("/:id", authenticate, async (req: Request | any, res: Response) => {
  try {
    const userId = req.user.id;
    const mediaId = req.params.id;
    
    // Check ownership
    const media = await db
      .select()
      .from(mediaLibrary)
      .where(and(eq(mediaLibrary.id, mediaId), eq(mediaLibrary.userId, userId)))
      .limit(1);
    
    if (!media.length) {
      return res.status(404).json({ error: "Media not found or unauthorized" });
    }
    
    // Delete from Cloudinary if publicId exists
    if (media[0].publicId) {
      try {
        await deleteMedia(media[0].publicId);
      } catch (cloudError) {
        console.warn("Failed to delete from Cloudinary:", cloudError);
        // Continue with DB deletion even if Cloudinary fails
      }
    }
    
    // Delete from database
    await db.delete(mediaLibrary).where(eq(mediaLibrary.id, mediaId));
    
    res.json({ success: true, message: "Media deleted from library" });
  } catch (error: any) {
    console.error("Error deleting media:", error);
    res.status(500).json({ error: "Failed to delete media" });
  }
});

// Get single media item
router.get("/:id", authenticate, async (req: Request | any, res: Response) => {
  try {
    const userId = req.user.id;
    const mediaId = req.params.id;
    
    const media = await db
      .select()
      .from(mediaLibrary)
      .where(and(eq(mediaLibrary.id, mediaId), eq(mediaLibrary.userId, userId)))
      .limit(1);
    
    if (!media.length) {
      return res.status(404).json({ error: "Media not found" });
    }
    
    res.json({ success: true, media: media[0] });
  } catch (error: any) {
    console.error("Error fetching media:", error);
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

export const mediaLibraryRouter = router;
