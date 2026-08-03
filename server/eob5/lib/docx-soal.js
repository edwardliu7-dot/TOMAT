/**
 * server/eob5/lib/docx-soal.js
 * Build .docx file dari hasil generate soal otomatis AI.
 */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx'

/**
 * @param {object} soalData  — { soal: [{ pertanyaan, pilihan, jawaban, pembahasan }] }
 * @param {object} metadata  — { topik, materi, jenisSoal, tingkatKesulitan, mata_pelajaran }
 */
export async function buildSoalDocx(soalData, metadata) {
  const soalArr = soalData?.soal || []
  const children = []

  // Judul
  children.push(new Paragraph({
    children: [new TextRun({
      text: `Soal ${metadata.mata_pelajaran || 'Mata Pelajaran'} — ${metadata.topik || metadata.materi || ''}`,
      bold: true, size: 28,
    })],
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
  }))

  // Metadata
  children.push(new Paragraph({
    children: [new TextRun({ text: `Topik: ${metadata.topik || metadata.materi || '-'}  |  Tingkat Kesulitan: ${metadata.tingkatKesulitan || '-'}  |  Jenis: ${metadata.jenisSoal === 'esai' ? 'Esai' : 'Pilihan Ganda'}`, italics: true, color: '666666' })],
  }))
  children.push(new Paragraph({ text: '' }))

  soalArr.forEach((s, i) => {
    // Nomor + pertanyaan
    children.push(new Paragraph({
      children: [new TextRun({ text: `${i + 1}. `, bold: true }), new TextRun({ text: s.pertanyaan || '', bold: true })],
      spacing: { before: 200 },
    }))

    // Pilihan
    if (s.pilihan?.length) {
      s.pilihan.forEach(p => {
        const isJawaban = s.jawaban && (p.trim().startsWith(s.jawaban) || p === s.jawaban)
        children.push(new Paragraph({
          children: [new TextRun({ text: `   ${p}`, bold: isJawaban, color: isJawaban ? '16a34a' : undefined })],
        }))
      })
    }

    // Jawaban
    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Jawaban: ', bold: true, color: '15803d' }),
        new TextRun({ text: s.jawaban || '', bold: true, color: '15803d' }),
      ],
      spacing: { before: 80 },
    }))

    // Pembahasan
    if (s.pembahasan) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: 'Pembahasan: ', italics: true, color: '78716c' }),
          new TextRun({ text: s.pembahasan, italics: true, color: '78716c' }),
        ],
      }))
    }
  })

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  })

  return Packer.toBuffer(doc)
}
