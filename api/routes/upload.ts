import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary if credentials exist
const useCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;
if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Multer: memoryStorage for Cloudinary, diskStorage for local
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!useCloudinary && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: useCloudinary
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadsDir),
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          const name = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
          cb(null, name);
        },
      }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 JPG、PNG、GIF、WebP 格式的图片'));
    }
  },
});

const router = Router();

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: '请选择要上传的图片' });
    return;
  }

  try {
    if (useCloudinary) {
      // Upload buffer to Cloudinary
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'what-to-eat', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string });
          }
        );
        uploadStream.end(req.file!.buffer);
      });
      res.json({ success: true, data: { url: result.secure_url } });
    } else {
      // Local file
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ success: true, data: { url: imageUrl } });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: '图片上传失败: ' + error.message });
  }
});

export default router;
