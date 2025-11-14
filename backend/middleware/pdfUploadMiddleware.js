import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/assignments directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'assignments');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`✅ Created uploads/assignments directory: ${uploadsDir}`);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  }
});

// File filter - allow PDF, ZIP, and DOC files
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimeTypes = [
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // Allowed file extensions
  const allowedExtensions = ['.pdf', '.zip', '.doc', '.docx'];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
  const isValidExtension = allowedExtensions.includes(fileExtension);

  if (isValidMimeType && isValidExtension) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only PDF, ZIP, and DOC files are allowed.`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

// Middleware for single assignment file upload
export const uploadAssignmentFile = upload.single('assignmentFile');

// Middleware for multiple file uploads (if needed in future)
export const uploadMultipleFiles = upload.array('files', 10);

export default upload;

