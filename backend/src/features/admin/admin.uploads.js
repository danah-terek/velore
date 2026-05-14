const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const multer = require('multer')

const UPLOADS_PUBLIC_ROOT = '/uploads'
const ADMIN_PRODUCTS_PUBLIC_DIR = '/uploads/products/admin'

function jsonError(res, status, message, errors = []) {
  return res.status(status).json({ success: false, message, errors })
}

function ensureDirExists(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function safeBaseName(name) {
  if (!name) return 'file'
  // Remove path separators and control chars; keep simple ascii-ish chars.
  return String(name)
    .replace(/[\\\/]/g, '')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\.+/, '')
    .replace(/\.+$/, '')
    .slice(0, 80) || 'file'
}

function extFromMime(mime) {
  if (mime === 'image/jpeg') return '.jpg'
  if (mime === 'image/png') return '.png'
  if (mime === 'image/webp') return '.webp'
  if (mime === 'image/svg+xml') return '.svg'
  return ''
}

function buildStorage() {
  return multer.diskStorage({
    destination(req, file, cb) {
      const uploadsFsRoot = path.join(__dirname, '..', '..', '..', 'uploads')
      const dest = path.join(uploadsFsRoot, 'products', 'admin')
      try {
        ensureDirExists(dest)
        cb(null, dest)
      } catch (e) {
        cb(e)
      }
    },
    filename(req, file, cb) {
      const base = safeBaseName(path.parse(file.originalname || 'image').name)
      const ext = extFromMime(file.mimetype) || path.extname(file.originalname || '').toLowerCase() || '.bin'
      const id = crypto.randomBytes(12).toString('hex')
      cb(null, `${base}-${id}${ext}`)
    }
  })
}

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Unsupported file type'), false)
  }
  cb(null, true)
}

const uploadProductImages = multer({
  storage: buildStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10
  }
}).array('files')

function uploadProductImagesHandler(req, res) {
  uploadProductImages(req, res, (err) => {
    if (err) {
      const msg = err.message === 'Unsupported file type'
        ? 'Only jpeg, png, webp, svg images are allowed'
        : err.code === 'LIMIT_FILE_SIZE'
          ? 'File too large. Max 5MB per file.'
          : err.code === 'LIMIT_FILE_COUNT'
            ? 'Too many files.'
            : 'Upload failed'
      return jsonError(res, 400, msg, [])
    }

    const files = req.files || []
    const paths = files.map((f) => `${ADMIN_PRODUCTS_PUBLIC_DIR}/${f.filename}`)
      .map((p) => p.replace(/\/+/g, '/'))
      .filter((p) => p.startsWith(`${UPLOADS_PUBLIC_ROOT}/products/`))

    return res.status(201).json({
      success: true,
      message: 'Product images uploaded successfully',
      data: { paths }
    })
  })
}

module.exports = { uploadProductImagesHandler }

