import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
  limits: { fileSize: 10000000 }, // 10MB limit for medical reports which might be high resolution
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export { uploadTestReport };
