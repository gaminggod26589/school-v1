// File upload route — handles teacher media uploads (PDF, video attachments)
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { protect, authorize } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /pdf|mp4|mov|mkv|jpg|jpeg|png|gif|webp|doc|docx|ppt|pptx|xlsx/i;
    const ext = path.extname(file.originalname).replace('.', '');
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('File type not allowed.'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB max

// POST /api/upload — single file upload (teacher or principal)
router.post('/', protect, authorize('teacher', 'principal'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
        
        let filename = req.file.filename;
        const oPath = req.file.path;
        let mimetype = req.file.mimetype;

        // Image optimization with Sharp
        if (mimetype.startsWith('image/')) {
            const ext = path.extname(filename);
            const baseName = path.basename(filename, ext);
            const optimizedFilename = `${baseName}_opt.webp`;
            const optPath = path.join(uploadDir, optimizedFilename);
            
            await sharp(oPath)
                .resize(600, null, { withoutEnlargement: true }) // Max width 600px
                .webp({ quality: 80 })
                .toFile(optPath);
                
            // Delete original unoptimized file
            fs.unlinkSync(oPath);
            
            filename = optimizedFilename;
            mimetype = 'image/webp';
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT || 5000}`;
        const fileUrl = `${baseUrl}/uploads/${filename}`;
        
        res.json({ url: fileUrl, filename: req.file.originalname, mimetype });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Error processing upload.' });
    }
});

module.exports = router;
