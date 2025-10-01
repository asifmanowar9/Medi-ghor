import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define path for prescription images
const prescriptionUploadPath = path.join(
  __dirname,
  '../../uploads/prescriptions/'
);

// Create the directory if it doesn't exist
if (!fs.existsSync(prescriptionUploadPath)) {
  fs.mkdirSync(prescriptionUploadPath, { recursive: true });
  console.log(`Created directory: ${prescriptionUploadPath}`);
}

// Set storage engine specifically for prescriptions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, prescriptionUploadPath);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `prescription-${Date.now()}-${Math.round(
        Math.random() * 1000000
      )}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image|pdf/.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      'Error: Prescription files must be images (JPEG, PNG, GIF, WEBP) or PDF files!'
    );
  }
}

const uploadPrescription = multer({
  storage,
  limits: { fileSize: 15000000 }, // 15MB limit for prescriptions
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Add image compression middleware specifically for prescriptions
const compressPrescriptionImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Only compress image files, not PDFs
  if (!req.file.mimetype.startsWith('image/')) {
    console.log('File is not an image, skipping compression');
    return next();
  }

  try {
    console.log(`Compressing prescription image: ${req.file.path}`);

    // Get file info
    const stats = fs.statSync(req.file.path);
    const fileSizeMB = stats.size / (1024 * 1024);

    console.log(`Original prescription file size: ${fileSizeMB.toFixed(2)}MB`);

    // Only compress if larger than 3MB for prescriptions (higher quality needed)
    if (fileSizeMB > 3) {
      const compressedFilename = path.basename(req.file.path);
      const compressedPath = path.join(
        prescriptionUploadPath,
        `compressed_${compressedFilename}`
      );

      await sharp(req.file.path)
        .resize(2000, 2000, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 85, // Higher quality for prescription readability
          progressive: true,
        })
        .toFile(compressedPath);

      // Get compressed file size
      const compressedStats = fs.statSync(compressedPath);
      const compressedSizeMB = compressedStats.size / (1024 * 1024);

      console.log(
        `Compressed prescription file size: ${compressedSizeMB.toFixed(2)}MB`
      );
      console.log(
        `Compression ratio: ${(
          (1 - compressedSizeMB / fileSizeMB) *
          100
        ).toFixed(1)}%`
      );

      // Replace original with compressed version if compression was successful
      if (compressedSizeMB < fileSizeMB) {
        fs.unlinkSync(req.file.path);
        fs.renameSync(compressedPath, req.file.path);
        console.log('Replaced original with compressed version');
      } else {
        fs.unlinkSync(compressedPath);
        console.log('Kept original as compression did not reduce size');
      }
    } else {
      console.log('File size is acceptable, no compression needed');
    }

    next();
  } catch (error) {
    console.error('Error compressing prescription image:', error);
    // Continue even if compression fails
    next();
  }
};

// Ensure the directory exists at startup
const ensurePrescriptionDirectoriesExist = () => {
  if (!fs.existsSync(prescriptionUploadPath)) {
    try {
      fs.mkdirSync(prescriptionUploadPath, { recursive: true });
      console.log(
        `Created prescription upload directory: ${prescriptionUploadPath}`
      );
    } catch (error) {
      console.error('Failed to create prescription upload directory:', error);
    }
  }
};

ensurePrescriptionDirectoriesExist();

export { uploadPrescription, compressPrescriptionImage };
