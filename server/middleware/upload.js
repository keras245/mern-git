const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration générale pour les uploads
const createUploadConfig = (folderName, fileTypes = /jpeg|jpg|png|gif|webp/) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = `uploads/${folderName}/`;
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const prefix = folderName.slice(0, -1); // enlever le 's' final
      cb(null, prefix + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  return multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
      const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = fileTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Type de fichier non autorisé'));
      }
    }
  });
};

// Configuration spécifique pour les avatars
const avatarUpload = createUploadConfig('avatars');

// Configuration pour les documents
const documentUpload = createUploadConfig('documents', /pdf|doc|docx|txt/);

// Fonction utilitaire pour supprimer un fichier
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error('Erreur suppression fichier:', error);
  }
  return false;
};

module.exports = {
  avatarUpload,
  documentUpload,
  deleteFile,
  createUploadConfig
}; 