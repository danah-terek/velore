const { authMiddleware, optionalAuth, adminAuthMiddleware } = require('./middleware');
const { uploadFaceImage } = require('./upload');

module.exports = {
  authMiddleware,
  optionalAuth,
  adminAuthMiddleware,
  uploadFaceImage,
};