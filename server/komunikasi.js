import express from 'express'
import { pool } from './db.js'
import { requireAuth } from './auth.js'
import { notifyUser, notifyClassMembers } from './notifications.js'

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

async function canViewProfile(user, otherId, otherRole) {
  if (otherRole !== 'guru' && otherRole !== 'siswa') return false
  if (user.id === otherId && user.role === otherRole) return true

  if (user.role === 'guru') {
    const classes = await getGuruClasses(user.id)
    if (otherRole === 'siswa') {
      const { rows } = await pool.query(
        'select id from students where id = $1 and kelas = any($2::text[])',
        [otherId, classes]
      )
      return rows.length > 0
    }
    return false
  }

  const kelas = await getStudentClass(user.id)
  if (!kelas) return false
  if (otherRole === 'guru') {
    const { rows } = await pool.query(
      'select id from gurus where id = $1 and $2 = any(kelas_diampu)',
      [otherId, kelas]
    )
    return rows.length > 0
  }

  const { rows } = await pool.query(
    'select id from students where id = $1 and kelas = $2',
    [otherId, kelas]
  )
  return rows.length > 0
}

// GET /api/komunikasi/contacts — people this user is allowed to message privately.
router.get('/contacts', async (req, res) => {
  try {
    const user = currentUser(req)
    if (user.role === 'guru') {
      const classes = await getGuruClasses(user.id)
      const { rows } = await pool.query(
        `select id, name, username, kelas, photo_url, equipped_bingkai
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
       `select id, name, username, photo_url
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

// GET /api/komunikasi/profile/:role/:id — public profile within the user's class circle.
router.get('/profile/:otherRole/:otherId', async (req, res) => {
  try {
    const user = currentUser(req)
    const { otherRole, otherId } = req.params
    if (!(await canViewProfile(user, otherId, otherRole))) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses ke profil ini.' })
    }

    const table = otherRole === 'guru' ? 'gurus' : 'students'
    const { rows } = await pool.query(
       `select id, name, photo_url, bio, ${otherRole === 'guru' ? 'null::text as equipped_bingkai, kelas_diampu' : 'equipped_bingkai, kelas'} as kelas
       from ${table}
       where id = $1
       limit 1`,
      [otherId]
    )
    const profile = rows[0]
    if (!profile) return res.status(404).json({ error: 'Profil tidak ditemukan.' })
    res.json({
      profile: {
        id: profile.id,
        name: profile.name,
        role: otherRole,
        photoUrl: profile.photo_url || null,
        equippedBingkai: profile.equipped_bingkai || null,
        bio: profile.bio || '',
        kelas: profile.kelas || [],
      },
    })
  } catch (err) {
    console.error('komunikasi/profile error', err)
    res.status(500).json({ error: 'Gagal memuat profil.' })
  }
})

// GET /api/komunikasi/unread — unread private and class-forum message counts.
router.get('/unread', async (req, res) => {
  try {
    const user = currentUser(req)
    // The recipient's active app polling this endpoint is the delivery
    // acknowledgement. Read status is intentionally handled separately by
    // POST /read when the conversation is opened.
    await pool.query(
      `update pesan_pribadi
       set delivered_at = coalesce(delivered_at, now())
       where recipient_id = $1 and recipient_role = $2
         and delivered_at is null`,
      [user.id, user.role]
    )
    const contacts = user.role === 'guru'
      ? (await (async () => {
        const classes = await getGuruClasses(user.id)
        const { rows } = await pool.query(
          'select id from students where kelas = any($1::text[])',
          [classes]
        )
        return rows.map(row => ({ id: row.id, role: 'siswa' }))
      })())
      : (await (async () => {
        const kelas = await getStudentClass(user.id)
        if (!kelas) return []
        const { rows } = await pool.query(
          'select id from gurus where $1 = any(kelas_diampu)',
          [kelas]
        )
        return rows.map(row => ({ id: row.id, role: 'guru' }))
      })())

    const privateReadParams = [user.id, user.role]
    const privateConditions = []
    contacts.forEach((contact, index) => {
      const keyIndex = privateReadParams.length + 1
      privateReadParams.push(contact.role, contact.id)
      privateConditions.push(`(
        p.sender_id = $${keyIndex + 1} and p.sender_role = $${keyIndex}
        and p.recipient_id = $1 and p.recipient_role = $2
        and p.id > coalesce((
           select d.last_read_message_id from komunikasi_dibaca d
          where d.reader_id = $1 and d.reader_role = $2
            and d.conversation_type = 'private'
            and d.conversation_key = $${keyIndex} || ':' || $${keyIndex + 1}
        ), 0)
      )`)
    })

    // The query above is intentionally built from server-authorized contacts,
    // so a client cannot ask for unread counts for another class.
    let privateCount = 0
    if (privateConditions.length > 0) {
      const { rows } = await pool.query(
        `select count(*)::int as count
         from pesan_pribadi p
         where ${privateConditions.join(' or ')}`,
        privateReadParams
      )
      privateCount = rows[0]?.count || 0
    }

    const classes = user.role === 'guru'
      ? await getGuruClasses(user.id)
      : [await getStudentClass(user.id)]
    const validClasses = classes.filter(Boolean)
    let forumCount = 0
    if (validClasses.length > 0) {
      const { rows } = await pool.query(
        `select count(*)::int as count
         from pesan_forum_kelas p
         where p.kelas = any($3::text[])
           and not (p.sender_id = $1 and p.sender_role = $2)
           and p.id > coalesce((
             select max(d.last_read_message_id)
             from komunikasi_dibaca d
             where d.reader_id = $1 and d.reader_role = $2
               and d.conversation_type = 'forum'
               and d.conversation_key = p.kelas
           ), 0)`,
        [user.id, user.role, validClasses]
      )
      forumCount = rows[0]?.count || 0
    }

    res.json({ total: privateCount + forumCount, privateCount, forumCount })
  } catch (err) {
    console.error('komunikasi/unread error', err)
    res.status(500).json({ error: 'Gagal memuat notifikasi pesan.' })
  }
})

// POST /api/komunikasi/read — record the newest message visible in a conversation.
router.post('/read', async (req, res) => {
  try {
    const user = currentUser(req)
    const type = req.body?.type
    if (!['private', 'forum'].includes(type)) {
      return res.status(400).json({ error: 'Data pembacaan pesan tidak valid.' })
    }

    let key
    let latestQuery
    let latestParams
    if (type === 'private') {
      const otherRole = req.body?.otherRole
      const otherId = req.body?.otherId
      if (!(await canPrivateChat(user, otherId, otherRole))) {
        return res.status(403).json({ error: 'Anda tidak memiliki akses ke percakapan ini.' })
      }
      key = `${otherRole}:${otherId}`
      latestQuery = `
        select max(id) as last_read_message_id
        from pesan_pribadi
        where (
          sender_id = $1 and sender_role = $2
          and recipient_id = $3 and recipient_role = $4
        ) or (
          sender_id = $3 and sender_role = $4
          and recipient_id = $1 and recipient_role = $2
        )`
      latestParams = [user.id, user.role, otherId, otherRole]
    } else {
      const kelas = req.body?.kelas
      if (!(await canUseClassForum(user, kelas))) {
        return res.status(403).json({ error: 'Anda tidak memiliki akses ke forum kelas ini.' })
      }
      key = kelas
      latestQuery = 'select max(id) as last_read_message_id from pesan_forum_kelas where kelas = $1'
      latestParams = [kelas]
    }

    const { rows: latestRows } = await pool.query(latestQuery, latestParams)
    const lastReadMessageId = latestRows[0]?.last_read_message_id
    if (!lastReadMessageId) {
      return res.json({ ok: true })
    }

    if (type === 'private') {
      await pool.query(
        `update pesan_pribadi
         set delivered_at = coalesce(delivered_at, now()),
             read_at = coalesce(read_at, now())
         where id <= $5
           and sender_id = $3 and sender_role = $4
           and recipient_id = $1 and recipient_role = $2`,
        [user.id, user.role, otherId, otherRole, lastReadMessageId]
      )
    }

    await pool.query(
      `insert into komunikasi_dibaca
         (reader_id, reader_role, conversation_type, conversation_key, last_read_at, last_read_message_id)
       values ($1,$2,$3,$4,now(),$5)
       on conflict (reader_id, reader_role, conversation_type, conversation_key)
       do update set
         last_read_at = now(),
         last_read_message_id = greatest(komunikasi_dibaca.last_read_message_id, $5)`,
      [user.id, user.role, type, key, lastReadMessageId]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('komunikasi/read error', err)
    res.status(500).json({ error: 'Gagal memperbarui status pesan.' })
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
    await pool.query(
      `update pesan_pribadi
       set delivered_at = coalesce(delivered_at, now())
       where sender_id = $2 and sender_role = $3
         and recipient_id = $1 and recipient_role = $4
         and delivered_at is null`,
      [user.id, otherId, otherRole, user.role]
    )
     const { rows } = await pool.query(
       `select id, sender_id, sender_role, recipient_id, recipient_role, body, created_at,
          delivered_at, read_at
       from pesan_pribadi
        where (
          sender_id = $1 and sender_role = $2
          and recipient_id = $3 and recipient_role = $4
        ) or (
          sender_id = $3 and sender_role = $4
          and recipient_id = $1 and recipient_role = $2
        )
        order by id asc
       limit 200`,
       [user.id, user.role, otherId, otherRole]
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
        returning id, sender_id, sender_role, recipient_id, recipient_role, body, created_at,
          delivered_at, read_at`,
      [user.id, user.role, otherId, otherRole, body]
    )
    const senderName = user.name || user.id
    await notifyUser({
      userId: otherId,
      role: otherRole,
      type: 'pesan_pribadi',
      title: `Pesan baru dari ${senderName}`,
      body,
      url: '/komunikasi',
      metadata: { conversationType: 'private', senderId: user.id, senderRole: user.role },
    })
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
          end as sender_name,
          case when f.sender_role = 'guru'
            then (select photo_url from gurus where id = f.sender_id)
            else (select photo_url from students where id = f.sender_id)
          end as sender_photo_url,
          case when f.sender_role = 'siswa'
            then (select equipped_bingkai from students where id = f.sender_id)
            else null
          end as sender_equipped_bingkai
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
    const senderName = user.name || user.id
    await notifyClassMembers(kelas, user, {
      type: 'pesan_forum',
      title: `Pesan baru di forum ${kelas}`,
      body: `${senderName}: ${body}`,
      url: '/komunikasi',
      metadata: { conversationType: 'forum', kelas },
    })
    res.status(201).json({ message: rows[0] })
  } catch (err) {
    console.error('komunikasi/forum post error', err)
    res.status(500).json({ error: 'Gagal mengirim pesan forum.' })
  }
})

export default router