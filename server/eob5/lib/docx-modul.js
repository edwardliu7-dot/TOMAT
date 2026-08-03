/**
 * server/eob5/lib/docx-modul.js
 * Build .docx file dari modul ajar AI (Kurikulum Merdeka).
 */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

function h1(text) {
  return new Paragraph({ children: [new TextRun({ text, bold: true, size: 28 })], heading: HeadingLevel.HEADING_1 })
}
function h2(text) {
  return new Paragraph({ children: [new TextRun({ text, bold: true, size: 24 })], heading: HeadingLevel.HEADING_2, spacing: { before: 240 } })
}
function body(text) {
  return new Paragraph({ children: [new TextRun({ text: text || '-' })], spacing: { before: 80 } })
}
function listItem(text, i) {
  return new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${text}` })], spacing: { before: 60 }, indent: { left: 360 } })
}
function blank() {
  return new Paragraph({ text: '' })
}

/**
 * @param {object} content — JSON modul ajar dari AI
 * @param {object} metadata — { materi, kelas, alokasi_waktu }
 */
export async function buildModulDocx(content, metadata) {
  const c = content || {}
  const id = c.identitas || {}
  const children = []

  // Judul
  children.push(new Paragraph({
    children: [new TextRun({ text: 'MODUL AJAR', bold: true, size: 32 })],
    alignment: AlignmentType.CENTER,
  }))
  children.push(new Paragraph({
    children: [new TextRun({ text: `${id.mata_pelajaran || metadata?.materi || ''}  ·  Kelas ${id.kelas || metadata?.kelas || '-'}`, bold: false, size: 24, color: '555555' })],
    alignment: AlignmentType.CENTER,
  }))
  children.push(blank())

  // Identitas
  h2('A. Identitas Modul')
  children.push(h2('A. Identitas Modul'))
  const idFields = [
    ['Mata Pelajaran', id.mata_pelajaran || metadata?.materi],
    ['Kelas', id.kelas || metadata?.kelas],
    ['Alokasi Waktu', id.alokasi_waktu || metadata?.alokasi_waktu],
    ['Materi', id.materi || metadata?.materi],
    ['Nama Penyusun', id.nama_penyusun],
  ]
  idFields.forEach(([k, v]) => {
    if (v) children.push(body(`${k}: ${v}`))
  })
  children.push(blank())

  // Capaian Pembelajaran
  if (c.capaian_pembelajaran) {
    children.push(h2('B. Capaian Pembelajaran'))
    children.push(body(c.capaian_pembelajaran))
    children.push(blank())
  }

  // Tujuan Pembelajaran
  if (c.tujuan_pembelajaran?.length) {
    children.push(h2('C. Tujuan Pembelajaran'))
    c.tujuan_pembelajaran.forEach((t, i) => children.push(listItem(t, i)))
    children.push(blank())
  }

  // Profil Pelajar Pancasila
  if (c.profil_pelajar_pancasila?.length) {
    children.push(h2('D. Profil Pelajar Pancasila'))
    c.profil_pelajar_pancasila.forEach((p, i) => children.push(listItem(p, i)))
    children.push(blank())
  }

  // Sarana & Prasarana
  if (c.sarana_prasarana?.length) {
    children.push(h2('E. Sarana & Prasarana'))
    c.sarana_prasarana.forEach((s, i) => children.push(listItem(s, i)))
    children.push(blank())
  }

  // Model Pembelajaran
  if (c.model_pembelajaran) {
    children.push(h2('F. Model Pembelajaran'))
    children.push(body(c.model_pembelajaran))
    children.push(blank())
  }

  // Kegiatan Pembelajaran
  if (c.kegiatan_pembelajaran) {
    children.push(h2('G. Kegiatan Pembelajaran'))
    const kp = c.kegiatan_pembelajaran
    ;['pendahuluan', 'inti', 'penutup'].forEach(fase => {
      if (!kp[fase]) return
      children.push(new Paragraph({ children: [new TextRun({ text: fase.charAt(0).toUpperCase() + fase.slice(1) + (kp[fase].durasi ? ` (${kp[fase].durasi})` : ''), bold: true })], spacing: { before: 160 } }))
      ;(kp[fase].langkah || []).forEach((l, i) => children.push(listItem(l, i)))
    })
    children.push(blank())
  }

  // Asesmen
  if (c.asesmen) {
    children.push(h2('H. Asesmen'))
    ;['diagnostik', 'formatif', 'sumatif'].forEach(k => {
      if (c.asesmen[k]) {
        children.push(new Paragraph({ children: [new TextRun({ text: `${k.charAt(0).toUpperCase() + k.slice(1)}: `, bold: true }), new TextRun({ text: c.asesmen[k] })], spacing: { before: 80 } }))
      }
    })
    children.push(blank())
  }

  // Pengayaan & Remedial
  if (c.pengayaan_remedial) {
    children.push(h2('I. Pengayaan & Remedial'))
    if (c.pengayaan_remedial.pengayaan) children.push(body(`Pengayaan: ${c.pengayaan_remedial.pengayaan}`))
    if (c.pengayaan_remedial.remedial)  children.push(body(`Remedial: ${c.pengayaan_remedial.remedial}`))
    children.push(blank())
  }

  // Refleksi Guru
  if (c.refleksi_guru) {
    children.push(h2('J. Refleksi Guru'))
    children.push(body(c.refleksi_guru))
    children.push(blank())
  }

  // Referensi
  if (c.referensi?.length) {
    children.push(h2('K. Referensi'))
    c.referensi.forEach((r, i) => children.push(listItem(r, i)))
  }

  const doc = new Document({ sections: [{ properties: {}, children }] })
  return Packer.toBuffer(doc)
}
