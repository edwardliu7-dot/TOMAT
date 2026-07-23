import express from 'express'
import { pool } from './db.js'
import { requireAuth } from './auth.js'

const router = express.Router()
router.use(requireAuth)

function currentUser(req) {
  return req.session.user
}

function cleanBody(value) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, 2000)
}

async function getGuruClasses(guruId) {
  const { rows } = await pool.query('select kelas_diampu from gurus where id = $1', [guruId])
  return rows[0]?.kelas_diampu || []
}

async function getStudentClass(studentId) {
  const { rows } = await pool.query('select kelas from students where id = $1', [studentId])
  return rows[0]?.kelas || null
}

async function canPrivateChat(user, otherId, otherRole) {
  if (otherRole !== 'guru' && otherRole !== 'siswa') return false
  if (user.role === otherRole || user.id === otherId) return false

  if (user.role === 'guru') {
    const classes = await getGuruClasses(user.id)
    const { rows } = await pool.query(
      'select id from students where id = $1 and kelas = any($2::text[])',
      [otherId, classes]
    )
    return rows.length > 0
  }

  const kelas = await getStudentClass(user.id)
  if (!kelas) return false
  const { rows } = await pool.query(
    'select id from gurus where id = $1 and $2 = any(kelas_diampu)',
    [otherId, kelas]
  )
  return rows.length > 0
}

async function canUseClassForum(user, kelas) {
  if (!kelas || typeof kelas !== 'string') return false
  if (user.role === 'guru') {
    const classes = await getGuruClasses(user.id)
    return classes.includes(kelas)
  }
  return (await getStudentClass(user.id)) === kelas
}

// GET /api/komunikasi/contacts — people this user is allowed to message privately.
router.get('/contacts', async (req, res) => {
  try {
    const user = currentUser(req)
    if (user.role === 'guru') {
      const classes = await getGuruClasses(user.id)
      const { rows } = await pool.query(
        `select id, name, username, kelas
         from students
         where kelas = any($1::text[])
         order by kelas, name`,
        [classes]
      )
      return res.json({ contacts: rows.map(row => ({ ...row, role: 'siswa' })) })
    }

    const kelas = await getStudentClass(user.id)
    if (!kelas) return res.json({ contacts: [] })
    const { rows } = await pool.query(
      `select id, name, username
       from gurus
       where $1 = any(kelas_diampu)
       order by name`,
      [kelas]
    )
    res.json({ contacts: rows.map(row => ({ ...row, role: 'guru', kelas })) })
  } catch (err) {
    console.error('komunikasi/contacts error', err)
    res.status(500).json({ error: 'Gagal memuat daftar kontak.' })
  }
})

// GET /api/komunikasi/classes — forums available to this user.
router.get('/classes', async (req, res) => {
  try {
    const user = currentUser(req)
    const classes = user.role === 'guru'
      ? await getGuruClasses(user.id)
      : [await getStudentClass(user.id)]
    res.json({ classes: classes.filter(Boolean) })
  } catch (err) {
    console.error('komunikasi/classes error', err)
    res.status(500).json({ error: 'Gagal memuat forum kelas.' })
  }
})

// GET /api/komunikasi/private/:otherRole/:otherId/messages
router.get('/private/:otherRole/:otherId/messages', async (req, res) => {
  try {
    const user = currentUser(req)
    const { otherRole, otherId } = req.params
    if (!(await canPrivateChat(user, otherId, otherRole))) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke percakapan ini.' })
    }
    const { rows } = await pool.query(
      `select id, sender_id, sender_role, recipient_id, recipient_role, body, created_at
       from pesan_pribadi
       where (sender_id = $1 and recipient_id = $2)
          or (sender_id = $2 and recipient_id = $1)
       order by created_at asc
       limit 200`,
      [user.id, otherId]
    )
    res.json({ messages: rows })
  } catch (err) {
    console.error('komunikasi/private get error', err)
    res.status(500).json({ error: 'Gagal memuat percakapan.' })
  }
})

// POST /api/komunikasi/private/:otherRole/:otherId/messages
router.post('/private/:otherRole/:otherId/messages', async (req, res) => {
  try {
    const user = currentUser(req)
    const { otherRole, otherId } = req.params
    const body = cleanBody(req.body?.body)
    if (!body) return res.status(400).json({ error: 'Pesan tidak boleh kosong.' })
    if (!(await canPrivateChat(user, otherId, otherRole))) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke percakapan ini.' })
    }
    const { rows } = await pool.query(
      `insert into pesan_pribadi
         (sender_id, sender_role, recipient_id, recipient_role, body)
       values ($1,$2,$3,$4,$5)
       returning id, sender_id, sender_role, recipient_id, recipient_role, body, created_at`,
      [user.id, user.role, otherId, otherRole, body]
    )
    res.status(201).json({ message: rows[0] })
  } catch (err) {
    console.error('komunikasi/private post error', err)
    res.status(500).json({ error: 'Gagal mengirim pesan.' })
  }
})

// GET /api/komunikasi/forum/:kelas/messages
router.get('/forum/:kelas/messages', async (req, res) => {
  try {
    const user = currentUser(req)
    const kelas = decodeURIComponent(req.params.kelas)
    if (!(await canUseClassForum(user, kelas))) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke forum kelas ini.' })
    }
    const { rows } = await pool.query(
      `select f.id, f.kelas, f.sender_id, f.sender_role, f.body, f.created_at,
         case when f.sender_role = 'guru'
           then (select name from gurus where id = f.sender_id)
           else (select name from students where id = f.sender_id)
         end as sender_name
       from pesan_forum_kelas f
       where f.kelas = $1
       order by f.created_at asc
       limit 300`,
      [kelas]
    )
    res.json({ messages: rows })
  } catch (err) {
    console.error('komunikasi/forum get error', err)
    res.status(500).json({ error: 'Gagal memuat forum kelas.' })
  }
})

// POST /api/komunikasi/forum/:kelas/messages
router.post('/forum/:kelas/messages', async (req, res) => {
  try {
    const user = currentUser(req)
    const kelas = decodeURIComponent(req.params.kelas)
    const body = cleanBody(req.body?.body)
    if (!body) return res.status(400).json({ error: 'Pesan tidak boleh kosong.' })
    if (!(await canUseClassForum(user, kelas))) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke forum kelas ini.' })
    }
    const { rows } = await pool.query(
      `insert into pesan_forum_kelas (kelas, sender_id, sender_role, body)
       values ($1,$2,$3,$4)
       returning id, kelas, sender_id, sender_role, body, created_at`,
      [kelas, user.id, user.role, body]
    )
    res.status(201).json({ message: rows[0] })
  } catch (err) {
    console.error('komunikasi/forum post error', err)
    res.status(500).json({ error: 'Gagal mengirim pesan forum.' })
  }
})

export default router