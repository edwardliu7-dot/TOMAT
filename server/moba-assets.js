import express from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'

const router = express.Router()
const assetDirectory = path.resolve(process.cwd(), 'local_moba_assets')

fs.mkdirSync(assetDirectory, { recursive: true })

const allowedMimeTypes = new Set(['image/png', 'image/jpeg', 'image/jpg'])
const allowedExtensions = new Set(['.png', '.jpg', '.jpeg'])

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, assetDirectory),
  filename: (_req, file, callback) => {
    const originalExtension = path.extname(file.originalname).toLowerCase()
    const safeName = path
      .basename(file.originalname, originalExtension)
      .replace(/[^a-z0-9-_]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'asset'

    callback(null, `${safeName}-${crypto.randomUUID().slice(0, 8)}${originalExtension}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase()
    if (allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(extension)) {
      callback(null, true)
      return
    }

    callback(new Error('Hanya file PNG atau JPG yang dapat diunggah.'))
  },
})

function toAssetRecord(file) {
  const filePath = path.join(assetDirectory, file)
  const stats = fs.statSync(filePath)
  return {
    id: file,
    filename: file,
    url: `/local-moba-assets/${encodeURIComponent(file)}`,
    size: stats.size,
    uploadedAt: stats.mtime.toISOString(),
  }
}

router.get('/assets', (_req, res) => {
  const assets = fs
    .readdirSync(assetDirectory)
    .filter(file => allowedExtensions.has(path.extname(file).toLowerCase()))
    .map(file => toAssetRecord(file))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))

  res.json({ assets })
})

router.post('/upload-asset', upload.single('asset'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Pilih file gambar terlebih dahulu.' })
  }

  return res.status(201).json({
    message: 'Asset berhasil disimpan di local_moba_assets.',
    asset: toAssetRecord(req.file.filename),
  })
})

router.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Ukuran file maksimal adalah 10 MB.' })
  }

  if (error) {
    return res.status(400).json({ error: error.message || 'Upload asset gagal.' })
  }

  return res.status(500).json({ error: 'Terjadi kesalahan pada upload asset.' })
})

export default router