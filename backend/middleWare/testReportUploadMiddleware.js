import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define path for test report images
const testReportUploadPath = path.join(
  __dirname,
  '../../uploads/test-report-images/'
);

// Create the directory if it doesn't exist
if (!fs.existsSync(testReportUploadPath)) {
  fs.mkdirSync(testReportUploadPath, { recursive: true });
  console.log(`Created directory: ${testReportUploadPath}`);
}

// Set storage engine specifically for test reports
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, testReportUploadPath);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `test-report-${Date.now()}-${Math.round(
        Math.random() * 1000000
      )}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

const uploadTestReport = multer({
  storage,
  limits: { fileSize: 10000000 }, // 10MB limit for initial upload
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Add image compression middleware
const compressImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    console.log(`Compressing image: ${req.file.path}`);

    // Get file info
    const stats = fs.statSync(req.file.path);
    const fileSizeMB = stats.size / (1024 * 1024);

    console.log(`Original file size: ${fileSizeMB.toFixed(2)}MB`);

    // Only compress if larger than 2MB
    if (fileSizeMB > 2) {
      const compressedFilename = path.basename(req.file.path);
      const compressedPath = path.join(
        testReportUploadPath,
        `compressed_${compressedFilename}`
      );

      // Calculate compression quality (lower for larger images)
      const quality = Math.max(60, Math.min(80, 100 - fileSizeMB * 5));

      // Process with sharp - resize and compress
      await sharp(req.file.path)
        .resize(1800, 1800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: quality, progressive: true })
        .toFile(compressedPath);

      // Replace original file with compressed version
      fs.unlinkSync(req.file.path);
      fs.renameSync(compressedPath, req.file.path);

      // Get new stats
      const newStats = fs.statSync(req.file.path);
      const newFileSizeMB = newStats.size / (1024 * 1024);

      console.log(
        `Compressed file size: ${newFileSizeMB.toFixed(2)}MB, reduction: ${(
          (1 - newFileSizeMB / fileSizeMB) *
          100
        ).toFixed(2)}%`
      );
    } else {
      console.log('Image already under 2MB threshold, skipping compression');
    }

    next();
  } catch (error) {
    console.error('Error compressing image:', error);
    // Continue even if compression fails
    next();
  }
};

// Ensure the directory exists at startup
const ensureDirectoriesExist = () => {
  if (!fs.existsSync(testReportUploadPath)) {
    try {
      fs.mkdirSync(testReportUploadPath, { recursive: true });
      console.log(
        `Created test report upload directory: ${testReportUploadPath}`
      );
    } catch (error) {
      console.error('Failed to create test report upload directory:', error);
    }
  }
};

ensureDirectoriesExist();

export { uploadTestReport, compressImage };
