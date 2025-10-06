import path from 'path';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { protect, admin } from '../middleWare/authMiddleware.js';

const router = express.Router();

// Create uploads/products directory if it doesn't exist
const productsUploadDir = 'uploads/products';
if (!fs.existsSync(productsUploadDir)) {
  fs.mkdirSync(productsUploadDir, { recursive: true });
  console.log('Created uploads/products directory');
}

// General storage (for backward compatibility)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.originalname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Product-specific storage
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb('Error: Images Only! Allowed formats: JPG, JPEG, PNG, GIF, WEBP');
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const productUpload = multer({
  storage: productStorage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// General upload route (for backward compatibility)
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  res.send({
    image: `/uploads/${req.file.filename}`,
    message: 'Image uploaded successfully',
  });
});

// Product image upload route
router.post(
  '/product',
  protect,
  admin,
  productUpload.single('image'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      res.send({
        image: `/uploads/products/${req.file.filename}`,
        message: 'Product image uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      res
        .status(500)
        .json({ message: 'Error uploading image', error: error.message });
    }
  }
);

export default router;
