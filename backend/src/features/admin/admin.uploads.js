const crypto = require('crypto')
const multer = require('multer')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
function jsonError(res, status, message, errors = []) {
  return res.status(status).json({ success: false, message, errors })
}

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Unsupported file type'), false)
  }
  cb(null, true)
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }
}).array('files')

async function uploadProductImagesHandler(req, res) {
  upload(req, res, async (err) => {
    if (err) {
      const msg = err.message === 'Unsupported file type'
        ? 'Only jpeg, png, webp, svg images are allowed'
        : err.code === 'LIMIT_FILE_SIZE'
          ? 'File too large. Max 5MB per file.'
          : err.code === 'LIMIT_FILE_COUNT'
            ? 'Too many files.'
            : 'Upload failed'
      return jsonError(res, 400, msg)
    }

    const files = req.files || []
    const paths = []

    for (const file of files) {
      const ext = file.originalname.split('.').pop()
      const filename = `admin/${crypto.randomBytes(12).toString('hex')}.${ext}`

      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/products/${filename}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': file.mimetype,
            'x-upsert': 'true'
          },
          body: file.buffer
        }
      )

if (!uploadRes.ok) {
  const errText = await uploadRes.text()
  console.error('Supabase upload error:', uploadRes.status, errText)
  return jsonError(res, 500, 'Upload to Supabase failed')
}

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/products/${filename}`
      paths.push(publicUrl)
    }

    return res.status(201).json({
      success: true,
      message: 'Product images uploaded successfully',
      data: { paths }
    })
  })
}

module.exports = { uploadProductImagesHandler }