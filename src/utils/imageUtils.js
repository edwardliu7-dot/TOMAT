// Shared helpers for the profile-photo crop + compress pipeline.

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file.'))
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('File bukan gambar yang valid.'))
    img.src = src
  })
}

// Draws the cropped area (in source-image pixel coordinates, as produced by
// react-easy-crop's onCropComplete) onto a square canvas of `outputSize`.
export async function getCroppedImage(imageSrc, croppedAreaPixels, outputSize = 480) {
  const img = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')
  ctx.drawImage(
    img,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    outputSize,
    outputSize
  )
  return canvas.toDataURL('image/jpeg', 0.9)
}

// Rough estimate of the decoded byte size of a base64 data URL.
function dataUrlBytes(dataUrl) {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Math.ceil((base64.length * 3) / 4)
}

// Iteratively lowers JPEG quality (and, if needed, resolution) until the
// resulting data URL is at or under maxBytes (default 1 MB).
export async function compressDataUrlToLimit(dataUrl, maxBytes = 1024 * 1024) {
  if (dataUrlBytes(dataUrl) <= maxBytes) return dataUrl

  const img = await loadImage(dataUrl)
  let size = Math.max(img.width, img.height)
  let quality = 0.85
  let result = dataUrl

  for (let attempt = 0; attempt < 8; attempt++) {
    const canvas = document.createElement('canvas')
    const scale = size / Math.max(img.width, img.height)
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    result = canvas.toDataURL('image/jpeg', quality)

    if (dataUrlBytes(result) <= maxBytes) return result

    if (quality > 0.4) {
      quality -= 0.15
    } else {
      size = Math.round(size * 0.8)
    }
  }
  return result
}
