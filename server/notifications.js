import webpush from 'web-push'
import { pool } from './db.js'

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@tomat.app'
let pushEnabled = Boolean(vapidPublicKey && vapidPrivateKey)

if (pushEnabled) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
  } catch (err) {
    console.warn('Web Push disabled: VAPID key validation failed —', err.message)
    pushEnabled = false
  }
}

export function getPushConfig() {
  return { enabled: pushEnabled, publicKey: pushEnabled ? vapidPublicKey : null }
}

async function sendPush(userId, role, payload) {
  if (!pushEnabled) return
  const { rows } = await pool.query(
    `select endpoint, p256dh, auth
     from push_subscriptions
     where user_id = $1 and user_role = $2`,
    [userId, role]
  )

  await Promise.allSettled(rows.map(async subscription => {
    try {
      await webpush.sendNotification({
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      }, JSON.stringify(payload), { TTL: 60 * 60 * 24 })
    } catch (err) {
      // Browsers return 404/410 when a subscription has expired or was revoked.
      // Removing it keeps future sends fast and avoids retaining device data forever.
      if (err.statusCode === 404 || err.statusCode === 410) {
        await pool.query('delete from push_subscriptions where endpoint = $1', [subscription.endpoint])
      } else {
        console.error('push notification delivery error', err.message || err)
      }
    }
  }))
}

export async function notifyUser({
  userId, role, type, title, body, url = '/', metadata = {},
}) {
  if (!userId || !['guru', 'siswa'].includes(role) || !title || !body) return null
  try {
    const { rows } = await pool.query(
      `insert into notifications
         (recipient_id, recipient_role, type, title, body, url, metadata)
       values ($1,$2,$3,$4,$5,$6,$7)
       returning id, recipient_id, recipient_role, type, title, body, url, metadata, created_at`,
      [userId, role, String(type || 'general').slice(0, 40), String(title).slice(0, 160),
        String(body).slice(0, 500), String(url).slice(0, 300), JSON.stringify(metadata || {})]
    )
    const notification = rows[0]
    await sendPush(userId, role, {
      title: notification.title,
      body: notification.body,
      url: notification.url,
      notificationId: notification.id,
      type: notification.type,
    })
    return notification
  } catch (err) {
    console.error('notification persistence error', err.message || err)
    return null
  }
}

export async function notifyUsers(users, payload) {
  await Promise.allSettled(users.map(user => notifyUser({ ...payload, userId: user.id, role: user.role })))
}

export async function notifyClassMembers(kelas, sender, payload) {
  if (!kelas) return
  try {
    const { rows } = await pool.query(
      `select id, 'siswa' as role from students where kelas = $1
       and not is_test_account
       union all
       select id, 'guru' as role from gurus where $1 = any(kelas_diampu)`,
      [kelas]
    )
    const recipients = rows.filter(user => !(sender && user.id === sender.id && user.role === sender.role))
    await notifyUsers(recipients, payload)
  } catch (err) {
    console.error('class notification lookup error', err.message || err)
  }
}

export async function notifyClassStudents(kelas, payload) {
  if (!kelas) return
  try {
    const { rows } = await pool.query(
      `select id, 'siswa' as role from students where kelas = $1
       and not is_test_account`,
      [kelas]
    )
    await notifyUsers(rows, payload)
  } catch (err) {
    console.error('class student notification lookup error', err.message || err)
  }
}
