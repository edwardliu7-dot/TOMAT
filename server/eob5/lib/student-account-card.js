/**
 * server/eob5/lib/student-account-card.js
 * Generate kartu akun siswa sebagai PDF buffer.
 * Satu kartu per halaman, format kartu fisik 10cm x 6cm yang bisa dicetak.
 */
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const PDFDocument = require('pdfkit')

/**
 * accounts: [{ name, kelas, username, password }]
 * username dan password diambil dari tabel student_accounts
 * kolom: username (BUKAN eob5_username), password (BUKAN password_plain)
 */
export function buildAccountCardsPdf(accounts) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [283, 170], margin: 16 }) // ~10cm x 6cm
    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    accounts.forEach((acc, i) => {
      if (i > 0) doc.addPage()

      // Header
      doc
        .fontSize(8).font('Helvetica').fillColor('#888888')
        .text('KARTU AKUN TOMAT', { align: 'center' })
        .moveDown(0.3)

      // Garis pembatas atas
      const y1 = doc.y
      doc.moveTo(16, y1).lineTo(267, y1).strokeColor('#cccccc').lineWidth(0.5).stroke()
      doc.moveDown(0.5)

      // Nama siswa
      doc
        .fontSize(12).font('Helvetica-Bold').fillColor('#000000')
        .text(acc.name || '—', { align: 'center' })
        .font('Helvetica').fontSize(9).fillColor('#444444')
        .text(`Kelas: ${acc.kelas || '—'}`, { align: 'center' })
        .moveDown(0.6)

      // Username
      doc
        .fontSize(8).font('Helvetica').fillColor('#666666')
        .text('Username:', { continued: false })
        .fontSize(14).font('Helvetica-Bold').fillColor('#000000')
        .text(acc.username || '—')
        .moveDown(0.2)

      // Password
      doc
        .fontSize(8).font('Helvetica').fillColor('#666666')
        .text('Password:', { continued: false })
        .fontSize(14).font('Helvetica-Bold').fillColor('#000000')
        .text(acc.password || '—')
        .moveDown(0.5)

      // Garis pembatas bawah
      const y2 = doc.y
      doc.moveTo(16, y2).lineTo(267, y2).strokeColor('#cccccc').lineWidth(0.5).stroke()
      doc.moveDown(0.3)

      // Footer
      doc
        .fontSize(6.5).font('Helvetica').fillColor('#999999')
        .text('Simpan kartu ini dengan baik. Jangan bagikan ke orang lain.', { align: 'center' })
    })

    doc.end()
  })
}
