const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsRoot = path.join(__dirname, '..', 'uploads');
const profilesDir = path.join(uploadsRoot, 'profiles');
const resumesDir = path.join(uploadsRoot, 'resumes');
const certificatesDir = path.join(uploadsRoot, 'certificates');

[profilesDir, resumesDir, certificatesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const RESUME_EXTENSIONS = ['.pdf'];
const CERT_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

const imageFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (IMAGE_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, or WEBP images are allowed'), false);
  }
};

const pdfFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (RESUME_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const certFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (CERT_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF or image files are allowed'), false);
  }
};

const profilePictureStorage = multer.diskStorage({
  destination: profilesDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${req.user.id}-${Date.now()}${ext}`);
  },
});

const profileResumeStorage = multer.diskStorage({
  destination: resumesDir,
  filename: (req, file, cb) => {
    cb(null, `resume-${req.user.id}-${Date.now()}.pdf`);
  },
});

const certificateFileStorage = multer.diskStorage({
  destination: certificatesDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `cert-${req.user.id}-${Date.now()}${ext}`);
  },
});

const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const uploadProfileResume = multer({
  storage: profileResumeStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadCertificateFile = multer({
  storage: certificateFileStorage,
  fileFilter: certFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const handleMulterError = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large' });
      }
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    next();
  });
};

module.exports = {
  uploadsRoot,
  uploadProfilePicture,
  uploadProfileResume,
  uploadCertificateFile,
  handleMulterError,
};
