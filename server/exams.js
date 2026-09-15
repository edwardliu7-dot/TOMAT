import express from 'express'
import multer from 'multer'
import mammoth from 'mammoth'
import crypto from 'node:crypto'
import Groq from 'groq-sdk'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'
import { notifyClassStudents, notifyUser } from './notifications.js'

const guruRouter = express.Router()
const siswaRouter = express.Router()
guruRouter.use(requireAuth, requireRole('guru'))
siswaRouter.use(requireAuth, requireRole('siswa'))

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      || /\.docx$/i.test(file.originalname || '')
    cb(allowed ? null : new Error('Hanya file Word .docx yang didukung.'), allowed)
  },
})

const AI_MODEL = process.env.GROQ_EXAM_MODEL || 'llama-3.3-70b-versatile'

function cleanText(value, max) {
  return String(value ?? '').replace(/\u0000/g, '').trim().slice(0, max)
}

function normalizeQuestion(input, position) {
  const answerType = ['multiple_choice', 'short_answer', 'true_false'].includes(input?.answerType || input?.answer_type)
    ? (input.answerType || input.answer_type)
    : 'multiple_choice'
  const options = Array.isArray(input?.options)
    ? input.options.map(option => cleanText(option, 300)).filter(Boolean).slice(0, 6)
    : []
  const correct = cleanText(input?.correctAnswer ?? input?.correct_answer ?? '', 300)
  return {
    position,
    prompt: cleanText(input?.prompt ?? input?.question ?? '', 5000),
    answerType,
    options: answerType === 'multiple_choice' ? options : [],
    correctAnswer: correct || null,
    points: Math.min(100, Math.max(1, Number.parseInt(input?.points, 10) || 1)),
  }
}

function validateQuestions(rawQuestions) {
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0 || rawQuestions.length > 200) {
    throw new Error('Ujian harus memiliki 1–200 soal.')
  }
  const questions = rawQuestions.map((question, index) => normalizeQuestion(question, index + 1))
  for (const question of questions) {
    if (!question.prompt) throw new Error(`Soal nomor ${question.position} belum memiliki pertanyaan.`)
    if (question.answerType === 'multiple_choice' && question.options.length < 2) {
      throw new Error(`Soal nomor ${question.position} membutuhkan minimal 2 pilihan jawaban.`)
    }
    if (!question.correctAnswer) throw new Error(`Kunci jawaban soal nomor ${question.position} wajib diisi.`)
  }
  return questions
}

function publicQuestion(question) {
  return {
    id: question.id,
    position: question.position,
    prompt: question.prompt,
    answerType: question.answer_type || question.answerType,
    options: question.options || [],
    points: question.points,
  }
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function makeToken() {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

function tokenMatches(token, hash) {
  const actual = Buffer.from(hashToken(String(token || '').trim().toUpperCase()), 'hex')
  const expected = Buffer.from(hash, 'hex')
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

function canonicalAnswer(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function answerIsCorrect(answer, question) {
  if (answer === null || answer === undefined) return false
  return canonicalAnswer(answer) === canonicalAnswer(question.correct_answer)
}

function examForClient(row) {
  return {
    id: row.id,
    kelas: row.kelas,
    mataPelajaran: row.mata_pelajaran || 'Matematika',
    title: row.title,
    description: row.description,
    durationMinutes: row.duration_minutes,
    status: row.status,
    questionCount: Number(row.question_count || 0),
    publishedAt: row.published_at,
    createdAt: row.created_at,
  }
}

async function teacherClasses(req) {
  const { rows } = await pool.query('select kelas_diampu from gurus where id = $1', [req.session.user.id])
  return rows[0]?.kelas_diampu || []
}

function requireRegisteredTeacher(req, res, next) {
  if (!req.session.user?.hasMateriTerdaftar) {
    return res.status(403).json({ error: 'Hanya guru mapel terdaftar yang dapat mengelola ujian.' })
  }
  next()
}

async function loadTeacherExam(req, examId) {
  const { rows } = await pool.query(
    'select * from exams where id = $1 and guru_id = $2 limit 1',
    [examId, req.session.user.id],
  )
  return rows[0] || null
}

async function saveQuestions(client, examId, questions) {
  for (const question of questions) {
    await client.query(
      `insert into exam_questions
        (exam_id, position, prompt, answer_type, options, correct_answer, points)
       values ($1,$2,$3,$4,$5::jsonb,$6,$7)`,
      [examId, question.position, question.prompt, question.answerType,
        JSON.stringify(question.options), question.correctAnswer, question.points],
    )
  }
}

async function logAudit({ examId = null, attemptId = null, actorId, actorRole, eventType, metadata = {} }) {
  await pool.query(
    `insert into exam_audit_logs
      (exam_id, attempt_id, actor_id, actor_role, event_type, metadata)
     values ($1,$2,$3,$4,$5,$6::jsonb)`,
    [examId, attemptId, actorId, actorRole, eventType, JSON.stringify(metadata)],
  )
}

// ── Guru: exam management ─────────────────────────────────────────────────────
guruRouter.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `select e.*, count(q.id)::int as question_count,
              count(a.id)::int as attempt_count,
              count(a.id) filter (where a.status = 'submitted')::int as submitted_count
       from exams e
       left join exam_questions q on q.exam_id = e.id
       left join exam_attempts a on a.exam_id = e.id
       where e.guru_id = $1
       group by e.id
       order by e.created_at desc`,
      [req.session.user.id],
    )
    res.json({ exams: rows.map(row => ({ ...examForClient(row), attemptCount: row.attempt_count, submittedCount: row.submitted_count })) })
  } catch (err) {
    console.error('guru/exams list error', err)
    res.status(500).json({ error: 'Gagal memuat daftar ujian.' })
  }
})

guruRouter.get('/:id', async (req, res) => {
  try {
    const exam = await loadTeacherExam(req, req.params.id)
    if (!exam) return res.status(404).json({ error: 'Ujian tidak ditemukan.' })
    const { rows: questions } = await pool.query(
      'select * from exam_questions where exam_id = $1 order by position',
      [exam.id],
    )
    res.json({ exam: examForClient({ ...exam, question_count: questions.length }), questions: questions.map(row => ({
      ...publicQuestion(row), correctAnswer: row.correct_answer, answerType: row.answer_type,
    })) })
  } catch (err) {
    console.error('guru/exams detail error', err)
    res.status(500).json({ error: 'Gagal memuat detail ujian.' })
  }
})

guruRouter.post('/', requireRegisteredTeacher, async (req, res) => {
  const client = await pool.connect()
  try {
    const { kelas, mataPelajaran, title, description, durationMinutes, questions } = req.body || {}
    const classes = await teacherClasses(req)
    if (!classes.includes(kelas)) return res.status(403).json({ error: 'Anda tidak mengampu kelas ini.' })
    const cleanSubject = cleanText(mataPelajaran, 100)
    if (!cleanSubject) return res.status(400).json({ error: 'Nama mata pelajaran wajib diisi.' })
    const cleanTitle = cleanText(title, 160)
    if (!cleanTitle) return res.status(400).json({ error: 'Judul ujian wajib diisi.' })
    const duration = Math.min(480, Math.max(1, Number.parseInt(durationMinutes, 10) || 60))
    const cleanQuestions = validateQuestions(questions)
    await client.query('begin')
    const { rows } = await client.query(
      `insert into exams (guru_id, kelas, mata_pelajaran, title, description, duration_minutes)
       values ($1,$2,$3,$4,$5,$6) returning *`,
      [req.session.user.id, kelas, cleanSubject, cleanTitle, cleanText(description, 2000), duration],
    )
    await saveQuestions(client, rows[0].id, cleanQuestions)
    await client.query('commit')
    res.status(201).json({ exam: examForClient({ ...rows[0], question_count: cleanQuestions.length }), questions: cleanQuestions })
  } catch (err) {
    await client.query('rollback').catch(() => {})
    console.error('guru/exams create error', err)
    res.status(400).json({ error: err.message || 'Gagal membuat ujian.' })
  } finally {
    client.release()
  }
})

guruRouter.patch('/:id', requireRegisteredTeacher, async (req, res) => {
  const client = await pool.connect()
  try {
    const exam = await loadTeacherExam(req, req.params.id)
    if (!exam) return res.status(404).json({ error: 'Ujian tidak ditemukan.' })
    if (exam.status !== 'draft') return res.status(409).json({ error: 'Ujian yang sudah diterbitkan tidak dapat diedit.' })
    const { kelas, mataPelajaran, title, description, durationMinutes, questions } = req.body || {}
    const classes = await teacherClasses(req)
    if (kelas && !classes.includes(kelas)) return res.status(403).json({ error: 'Anda tidak mengampu kelas ini.' })
    const cleanSubject = mataPelajaran === undefined ? null : cleanText(mataPelajaran, 100)
    if (mataPelajaran !== undefined && !cleanSubject) return res.status(400).json({ error: 'Nama mata pelajaran wajib diisi.' })
    const cleanQuestions = validateQuestions(questions)
    await client.query('begin')
    const { rows } = await client.query(
      `update exams set kelas = coalesce($1, kelas), mata_pelajaran = coalesce($2, mata_pelajaran),
       title = coalesce($3, title), description = coalesce($4, description),
       duration_minutes = coalesce($5, duration_minutes),
       updated_at = now() where id = $6 returning *`,
      [kelas || null, cleanSubject, title ? cleanText(title, 160) : null,
        description !== undefined ? cleanText(description, 2000) : null,
        durationMinutes ? Math.min(480, Math.max(1, Number.parseInt(durationMinutes, 10) || 60)) : null, exam.id],
    )
    await client.query('delete from exam_questions where exam_id = $1', [exam.id])
    await saveQuestions(client, exam.id, cleanQuestions)
    await client.query('commit')
    res.json({ exam: examForClient({ ...rows[0], question_count: cleanQuestions.length }), questions: cleanQuestions })
  } catch (err) {
    await client.query('rollback').catch(() => {})
    console.error('guru/exams update error', err)
    res.status(400).json({ error: err.message || 'Gagal memperbarui ujian.' })
  } finally {
    client.release()
  }
})

guruRouter.delete('/:id', requireRegisteredTeacher, async (req, res) => {
  try {
    const exam = await loadTeacherExam(req, req.params.id)
    if (!exam) return res.status(404).json({ error: 'Ujian tidak ditemukan.' })
    if (exam.status !== 'draft') {
      return res.status(409).json({ error: 'Hanya draft yang dapat dihapus. Ujian yang sudah diterbitkan harus ditutup.' })
    }
    await pool.query('delete from exams where id = $1 and guru_id = $2 and status = \'draft\'', [exam.id, req.session.user.id])
    res.json({ ok: true, deletedId: exam.id })
  } catch (err) {
    console.error('guru/exams delete error', err)
    res.status(500).json({ error: 'Gagal menghapus draft ujian.' })
  }
})

guruRouter.post('/:id/publish', requireRegisteredTeacher, async (req, res) => {
  try {
    const exam = await loadTeacherExam(req, req.params.id)
    if (!exam) return res.status(404).json({ error: 'Ujian tidak ditemukan.' })
    const { rows: countRows } = await pool.query('select count(*)::int as count from exam_questions where exam_id = $1', [exam.id])
    if (countRows[0].count < 1) return res.status(400).json({ error: 'Tambahkan minimal satu soal sebelum menerbitkan ujian.' })
    const { rows } = await pool.query(
      `update exams set status = 'published', published_at = coalesce(published_at, now()),
       closed_at = null, updated_at = now() where id = $1 returning *`,
      [exam.id],
    )
    await notifyClassStudents(exam.kelas, {
      type: 'exam_published',
      title: 'Ujian baru tersedia',
      body: `${exam.title} · ${countRows[0].count} soal`,
      url: '/',
      metadata: { examId: exam.id },
    })
    res.json({ exam: examForClient({ ...rows[0], question_count: countRows[0].count }) })
  } catch (err) {
    console.error('guru/exams publish error', err)
    res.status(500).json({ error: 'Gagal menerbitkan ujian.' })
  }
})

guruRouter.post('/:id/close', requireRegisteredTeacher, async (req, res) => {
  try {
    const exam = await loadTeacherExam(req, req.params.id)
    if (!exam) return res.status(404).json({ error: 'Ujian tidak ditemukan.' })
    const { rows } = await pool.query(
      `update exams set status = 'closed', closed_at = now(), updated_at = now()
       where id = $1 returning *`,
      [exam.id],
    )
    res.json({ exam: examForClient({ ...rows[0], question_count: 0 }) })
  } catch (err) {
    console.error('guru/exams close error', err)
    res.status(500).json({ error: 'Gagal menutup ujian.' })
  }
})

guruRouter.post('/:id/token', requireRegisteredTeacher, async (req, res) => {
  try {
    const exam = await loadTeacherExam(req, req.params.id)
    if (!exam) return res.status(404).json({ error: 'Ujian tidak ditemukan.' })
    if (exam.status !== 'published') return res.status(409).json({ error: 'Terbitkan ujian terlebih dahulu.' })
    const token = makeToken()
    await pool.query(
      `insert into exam_tokens (exam_id, token_hash, token_hint, revoked_at)
       values ($1,$2,$3,null)
       on conflict (exam_id) do update set token_hash = excluded.token_hash,
         token_hint = excluded.token_hint, created_at = now(), revoked_at = null`,
      [exam.id, hashToken(token), `${token.slice(0, 2)}••${token.slice(-2)}`],
    )
    await logAudit({ examId: exam.id, actorId: req.session.user.id, actorRole: 'guru', eventType: 'token_regenerated' })
    res.json({ token, tokenHint: `${token.slice(0, 2)}••${token.slice(-2)}` })
  } catch (err) {
    console.error('guru/exams token error', err)
    res.status(500).json({ error: 'Gagal membuat token.' })
  }
})

guruRouter.get('/:id/results', async (req, res) => {
  try {
    const exam = await loadTeacherExam(req, req.params.id)
    if (!exam) return res.status(404).json({ error: 'Ujian tidak ditemukan.' })
    const { rows } = await pool.query(
      `select a.id, a.student_id, s.name, s.username, s.kelas, a.status,
              a.started_at, a.deadline_at, a.last_seen_at, a.submitted_at,
              a.score, a.correct_count, a.total_points,
              (select count(*)::int from exam_answers ea where ea.attempt_id = a.id) as answered_count
       from exam_attempts a join students s on s.id = a.student_id
       where a.exam_id = $1 order by s.name`,
      [exam.id],
    )
    res.json({ exam: examForClient(exam), attempts: rows })
  } catch (err) {
    console.error('guru/exams results error', err)
    res.status(500).json({ error: 'Gagal memuat hasil ujian.' })
  }
})

guruRouter.get('/:id/audit', async (req, res) => {
  try {
    const exam = await loadTeacherExam(req, req.params.id)
    if (!exam) return res.status(404).json({ error: 'Ujian tidak ditemukan.' })
    const { rows } = await pool.query(
      `select l.*, coalesce(s.name, g.name, l.actor_id) as actor_name
       from exam_audit_logs l
       left join students s on s.id = l.actor_id and l.actor_role = 'siswa'
       left join gurus g on g.id = l.actor_id and l.actor_role = 'guru'
       where l.exam_id = $1 order by l.created_at desc limit 500`,
      [exam.id],
    )
    res.json({ logs: rows })
  } catch (err) {
    console.error('guru/exams audit error', err)
    res.status(500).json({ error: 'Gagal memuat riwayat aktivitas.' })
  }
})

guruRouter.post('/import-docx', requireRegisteredTeacher, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File Word .docx wajib dipilih.' })
    const extracted = await mammoth.extractRawText({ buffer: req.file.buffer })
    const text = cleanText(extracted.value, 50000)
    if (!text) return res.status(400).json({ error: 'File Word tidak berisi teks yang dapat dibaca.' })
    if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: 'Pemrosesan AI belum dikonfigurasi di server.' })
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'system',
        content: `Anda adalah parser soal ujian sekolah berbahasa Indonesia. Kembalikan JSON valid dengan bentuk {"questions":[...]}.
Setiap item wajib memiliki prompt, answerType (multiple_choice|short_answer|true_false), options (array string), correctAnswer, points.
Pertahankan isi soal, jangan membuat soal baru, jangan menebak kunci yang tidak ada. Jika kunci tidak jelas, gunakan null.
Untuk pilihan ganda, correctAnswer harus sama persis dengan salah satu option. Untuk benar-salah gunakan "Benar" atau "Salah".`,
      }, {
        role: 'user',
        content: `Ekstrak semua soal dan kunci dari dokumen berikut. Abaikan kop, nomor halaman, dan instruksi umum yang bukan soal.\n\n${text}`,
      }],
    })
    const raw = completion.choices?.[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/gi, '').trim())
    const questions = validateQuestions(parsed.questions)
    res.json({ questions, sourceTextLength: text.length })
  } catch (err) {
    console.error('guru/exams docx import error', err)
    res.status(400).json({ error: err.message || 'AI gagal mengenali soal dari dokumen.' })
  }
})

// ── Siswa: token gate, attempt, autosave and submit ───────────────────────────
siswaRouter.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `select e.*, count(q.id)::int as question_count,
              a.id as attempt_id, a.status as attempt_status,
              a.deadline_at, a.score
       from exams e
       left join exam_questions q on q.exam_id = e.id
       left join exam_attempts a on a.exam_id = e.id and a.student_id = $2
       where e.kelas = $1 and e.status in ('published','closed')
       group by e.id, a.id
       order by e.published_at desc nulls last, e.created_at desc`,
      [await getStudentClass(req), req.session.user.id],
    )
    res.json({ exams: rows.map(row => ({
      ...examForClient(row),
      attemptId: row.attempt_id,
      attemptStatus: row.attempt_status,
      deadlineAt: row.deadline_at,
      score: row.score,
    })) })
  } catch (err) {
    console.error('siswa/exams list error', err)
    res.status(500).json({ error: 'Gagal memuat ujian.' })
  }
})

async function getStudentClass(req) {
  const { rows } = await pool.query('select kelas from students where id = $1', [req.session.user.id])
  return rows[0]?.kelas || null
}

async function loadStudentAttempt(req, attemptId, { forUpdate = false } = {}) {
  const { rows } = await pool.query(
    `select a.*, e.title, e.description, e.duration_minutes, e.status as exam_status, e.kelas, e.guru_id
     from exam_attempts a join exams e on e.id = a.exam_id
     where a.id = $1 and a.student_id = $2 ${forUpdate ? 'for update' : ''}`,
    [attemptId, req.session.user.id],
  )
  return rows[0] || null
}

async function buildAttemptPayload(attempt) {
  const { rows: questions } = await pool.query(
    'select * from exam_questions where exam_id = $1 order by position',
    [attempt.exam_id],
  )
  const { rows: answers } = await pool.query(
    'select question_id, answer, revision, saved_at from exam_answers where attempt_id = $1',
    [attempt.id],
  )
  const answerMap = Object.fromEntries(answers.map(row => [row.question_id, {
    answer: row.answer, revision: row.revision, savedAt: row.saved_at,
  }]))
  const { rows: violationRows } = await pool.query(
    `select count(*)::int as count
     from exam_audit_logs
     where attempt_id = $1
       and event_type in (
         'background', 'reload_or_exit', 'fullscreen_exit',
         'copy_attempt', 'cut_attempt', 'paste_attempt',
         'contextmenu_attempt', 'shortcut_attempt', 'strict_violation'
       )`,
    [attempt.id],
  )
  const effectiveStatus = attempt.status === 'in_progress' && new Date(attempt.deadline_at) <= new Date()
    ? 'expired' : attempt.status
  return {
    attempt: {
      id: attempt.id, examId: attempt.exam_id, title: attempt.title,
      description: attempt.description, status: effectiveStatus,
      startedAt: attempt.started_at, deadlineAt: attempt.deadline_at,
      strictViolationCount: violationRows[0]?.count || 0,
      serverNow: new Date().toISOString(),
    },
    questions: questions.map(publicQuestion),
    answers: answerMap,
  }
}

siswaRouter.post('/:id/start', async (req, res) => {
  try {
    const examId = Number.parseInt(req.params.id, 10)
    const token = String(req.body?.token || '').trim().toUpperCase()
    const kelas = await getStudentClass(req)
    const { rows: examRows } = await pool.query(
      `select e.*, t.token_hash from exams e
       left join exam_tokens t on t.exam_id = e.id and t.revoked_at is null
       where e.id = $1 and e.kelas = $2 limit 1`,
      [examId, kelas],
    )
    const exam = examRows[0]
    if (!exam || exam.status !== 'published') return res.status(404).json({ error: 'Ujian tidak tersedia untuk kelas Anda.' })
    if (!exam.token_hash || !token || !tokenMatches(token, exam.token_hash)) {
      await logAudit({ examId, actorId: req.session.user.id, actorRole: 'siswa', eventType: 'token_failed' }).catch(() => {})
      return res.status(401).json({ error: 'Token ujian tidak cocok.' })
    }
    const { rows: existing } = await pool.query('select * from exam_attempts where exam_id = $1 and student_id = $2', [examId, req.session.user.id])
    if (existing[0]) {
      if (existing[0].status === 'submitted') return res.status(409).json({ error: 'Ujian ini sudah dikumpulkan.', attempt: { id: existing[0].id, status: existing[0].status } })
      const payload = await buildAttemptPayload(existing[0])
      await pool.query('update exam_attempts set last_seen_at = now() where id = $1', [existing[0].id])
      await logAudit({ examId, attemptId: existing[0].id, actorId: req.session.user.id, actorRole: 'siswa', eventType: 'attempt_resumed' })
      return res.json(payload)
    }
    const startedAt = new Date()
    const deadlineAt = new Date(startedAt.getTime() + exam.duration_minutes * 60 * 1000)
    const { rows } = await pool.query(
      `insert into exam_attempts
        (exam_id, student_id, started_at, deadline_at, last_seen_at, total_points)
       select $1,$2,$3,$4,$3,coalesce(sum(points),0)
       from exam_questions where exam_id = $1
       returning *`,
      [examId, req.session.user.id, startedAt, deadlineAt],
    )
    await logAudit({ examId, attemptId: rows[0].id, actorId: req.session.user.id, actorRole: 'siswa', eventType: 'attempt_started' })
    res.status(201).json(await buildAttemptPayload({ ...rows[0], title: exam.title, description: exam.description }))
  } catch (err) {
    console.error('siswa/exams start error', err)
    res.status(500).json({ error: 'Gagal membuka ujian.' })
  }
})

siswaRouter.get('/attempts/:attemptId', async (req, res) => {
  try {
    const attempt = await loadStudentAttempt(req, req.params.attemptId)
    if (!attempt) return res.status(404).json({ error: 'Sesi ujian tidak ditemukan.' })
    await pool.query('update exam_attempts set last_seen_at = now() where id = $1', [attempt.id])
    res.json(await buildAttemptPayload(attempt))
  } catch (err) {
    console.error('siswa/exam attempt GET error', err)
    res.status(500).json({ error: 'Gagal memulihkan sesi ujian.' })
  }
})

siswaRouter.post('/attempts/:attemptId/events', async (req, res) => {
  try {
    const attempt = await loadStudentAttempt(req, req.params.attemptId)
    if (!attempt) return res.status(404).json({ error: 'Sesi ujian tidak ditemukan.' })
    const eventType = [
      'background',
      'reload_or_exit',
      'reconnect',
      'fullscreen_exit',
      'copy_attempt',
      'cut_attempt',
      'paste_attempt',
      'contextmenu_attempt',
      'shortcut_attempt',
      'strict_violation',
    ].includes(req.body?.eventType)
      ? req.body.eventType
      : 'client_event'
    await logAudit({
      examId: attempt.exam_id,
      attemptId: attempt.id,
      actorId: req.session.user.id,
      actorRole: 'siswa',
      eventType,
      metadata: {
        online: req.body?.online ?? null,
        strict: req.body?.metadata?.strict === true,
        violationCount: Number.isFinite(Number(req.body?.metadata?.violationCount))
          ? Number(req.body.metadata.violationCount)
          : null,
      },
    })
    await pool.query('update exam_attempts set last_seen_at = now() where id = $1', [attempt.id])
    const { rows: violationRows } = await pool.query(
      `select count(*)::int as count
       from exam_audit_logs
       where attempt_id = $1
         and event_type in (
           'background', 'reload_or_exit', 'fullscreen_exit',
           'copy_attempt', 'cut_attempt', 'paste_attempt',
           'contextmenu_attempt', 'shortcut_attempt', 'strict_violation'
         )`,
      [attempt.id],
    )
    res.json({ ok: true, strictViolationCount: violationRows[0]?.count || 0 })
  } catch (err) {
    console.error('siswa/exam event error', err)
    res.status(500).json({ error: 'Aktivitas belum tercatat.' })
  }
})

siswaRouter.patch('/attempts/:attemptId/answers', async (req, res) => {
  const client = await pool.connect()
  try {
    const attempt = await loadStudentAttempt(req, req.params.attemptId)
    if (!attempt) return res.status(404).json({ error: 'Sesi ujian tidak ditemukan.' })
    if (attempt.status !== 'in_progress') return res.status(409).json({ error: 'Sesi ujian sudah tidak aktif.', status: attempt.status })
    if (new Date(attempt.deadline_at) <= new Date()) {
      await pool.query(`update exam_attempts set status = 'expired' where id = $1 and status = 'in_progress'`, [attempt.id])
      return res.status(409).json({ error: 'Waktu ujian sudah habis.', status: 'expired' })
    }
    const questionId = Number.parseInt(req.body?.questionId, 10)
    const answer = req.body?.answer === null || req.body?.answer === undefined ? null : cleanText(req.body.answer, 1000)
    const clientEventId = cleanText(req.body?.clientEventId, 100)
    const { rows: questionRows } = await pool.query(
      'select id from exam_questions where id = $1 and exam_id = $2',
      [questionId, attempt.exam_id],
    )
    if (!questionRows[0]) return res.status(400).json({ error: 'Soal tidak valid.' })
    await client.query('begin')
    const { rows: oldRows } = await client.query(
      'select answer, revision from exam_answers where attempt_id = $1 and question_id = $2 for update',
      [attempt.id, questionId],
    )
    const old = oldRows[0]
    const revision = (old?.revision || 0) + 1
    await client.query(
      `insert into exam_answers (attempt_id, question_id, answer, revision, saved_at)
       values ($1,$2,$3::jsonb,$4,now())
       on conflict (attempt_id, question_id) do update
       set answer = excluded.answer, revision = excluded.revision, saved_at = now()`,
      [attempt.id, questionId, JSON.stringify(answer), revision],
    )
    await client.query(
      `insert into exam_answer_events
        (attempt_id, question_id, event_type, previous_answer, answer, client_event_id)
       values ($1,$2,'answer_saved',$3::jsonb,$4::jsonb,$5)`,
      [attempt.id, questionId, old ? JSON.stringify(old.answer) : null, JSON.stringify(answer), clientEventId || null],
    )
    await client.query('update exam_attempts set last_seen_at = now() where id = $1', [attempt.id])
    await client.query('commit')
    res.json({ ok: true, questionId, revision, savedAt: new Date().toISOString() })
  } catch (err) {
    await client.query('rollback').catch(() => {})
    console.error('siswa/exam answer save error', err)
    res.status(500).json({ error: 'Jawaban belum tersimpan. Coba lagi.' })
  } finally {
    client.release()
  }
})

siswaRouter.post('/attempts/:attemptId/submit', async (req, res) => {
  const client = await pool.connect()
  try {
    const attempt = await loadStudentAttempt(req, req.params.attemptId)
    if (!attempt) return res.status(404).json({ error: 'Sesi ujian tidak ditemukan.' })
    if (attempt.status === 'submitted') return res.json({ attempt: { id: attempt.id, status: attempt.status, score: attempt.score, correctCount: attempt.correct_count } })
    const { rows: questions } = await pool.query('select * from exam_questions where exam_id = $1 order by position', [attempt.exam_id])
    const { rows: answers } = await pool.query('select question_id, answer from exam_answers where attempt_id = $1', [attempt.id])
    const answerMap = new Map(answers.map(row => [row.question_id, row.answer]))
    const totalPoints = questions.reduce((sum, question) => sum + question.points, 0) || 1
    const correctCount = questions.reduce((sum, question) => sum + (answerIsCorrect(answerMap.get(question.id), question) ? 1 : 0), 0)
    const earnedPoints = questions.reduce((sum, question) => sum + (answerIsCorrect(answerMap.get(question.id), question) ? question.points : 0), 0)
    const score = Math.round((earnedPoints / totalPoints) * 100)
    const expired = new Date(attempt.deadline_at) <= new Date()
    await client.query('begin')
    const { rows } = await client.query(
      `update exam_attempts
       set status = $1, submitted_at = now(), last_seen_at = now(),
           score = $2, correct_count = $3, total_points = $4
       where id = $5 and status = 'in_progress'
       returning *`,
      [expired ? 'expired' : 'submitted', score, correctCount, totalPoints, attempt.id],
    )
    await client.query(
      `insert into exam_answer_events (attempt_id, event_type, answer)
       values ($1,'submit',$2::jsonb)`,
      [attempt.id, JSON.stringify({ answered: answers.length, expired })],
    )
    await client.query('insert into exam_audit_logs (exam_id, attempt_id, actor_id, actor_role, event_type, metadata) values ($1,$2,$3,$4,$5,$6::jsonb)',
      [attempt.exam_id, attempt.id, req.session.user.id, 'siswa', expired ? 'attempt_expired' : 'attempt_submitted', JSON.stringify({ score })])
    await client.query('commit')
    const result = rows[0] || { ...attempt, status: expired ? 'expired' : 'submitted', score, correct_count: correctCount }
    res.json({ attempt: { id: result.id, status: result.status, score: result.score, correctCount: result.correct_count, submittedAt: result.submitted_at } })
    void notifyUser({
      userId: attempt.guru_id,
      role: 'guru',
      type: 'exam_submitted',
      title: 'Siswa mengumpulkan ujian',
      body: `${req.session.user.name || req.session.user.username || 'Siswa'} mengumpulkan ${attempt.title}.`,
      metadata: { examId: attempt.exam_id, attemptId: attempt.id, score },
    })
  } catch (err) {
    await client.query('rollback').catch(() => {})
    console.error('siswa/exam submit error', err)
    res.status(500).json({ error: 'Gagal mengumpulkan ujian.' })
  } finally {
    client.release()
  }
})

export { guruRouter as examGuruRouter, siswaRouter as examSiswaRouter }