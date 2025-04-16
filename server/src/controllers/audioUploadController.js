



// export const uploadAudio = async (req, res) => {
//     try {
//         const bufferStream = Readable.from(req.file.buffer);
//         const uploadStream = cloudinary.uploader.upload_stream(
//           { resource_type: "video", folder: "interview-audio" },
//           (error, result) => {
//             if (error) return res.status(500).json({ error });
//             return res.status(200).json({ url: result.secure_url });
//           }
//         );
//         bufferStream.pipe(uploadStream);
//       } catch (err) {
//         res.status(500).json({ error: "Upload failed" });
//       }
// }

