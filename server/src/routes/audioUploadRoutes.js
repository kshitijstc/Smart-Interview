import express from 'express';
import multer from 'multer';
import {v2 as cloudinary} from 'cloudinary';
// import { uploadAudio } from '../controllers/audioUploadController.js';
import {Readable} from "stream";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post("/audio",upload.single("audio"),async (req, res) => {
    try {
        const bufferStream = Readable.from(req.file.buffer);
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "video", folder: "interview-audio" },
          (error, result) => {
            if (error) return res.status(500).json({ error });
            return res.status(200).json({ url: result.secure_url });
          }
        );
        bufferStream.pipe(uploadStream);
        console.log("Audio uploaded successfully");
      } catch (err) {
        res.status(500).json({ error: "Upload failed" });
      }
});

export default router;