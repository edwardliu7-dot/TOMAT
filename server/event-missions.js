/**
 * Event mission system — definitions + DB helpers.
 * Each mission tracks one numeric progress counter (progress / goal).
 * Adding a new event's missions: just push to EVENT_MISSIONS below.
 */

import { pool } from './db.js'
import { isEventActive, SEASONAL_EVENTS } from './seasonal-events.js'

/**
 * Idempotent table bootstrap — runs once when this module is first imported.
 * Ensures the table exists even if the server was deployed before ensureSchema()
 * added this block.  Safe to call multiple times.
 */
async function _ensureTable() {
  try {
    await pool.query(`
      create table if not exists event_mission_progress (
        student_id        text not null references students(id) on delete cascade,
        mission_id        text not null,
        progress          int  not null default 0,
        completed_at      timestamptz,
        reward_claimed_at timestamptz,
        primary key (student_id, mission_id)
      );
      create index if not exists event_mission_progress_student_idx
        on event_mission_progress (student_id);
    `)
  } catch (err) {
    console.error('[event-missions] table bootstrap error:', err.message)
  }
}
_ensureTable()

export const EVENT_MISSIONS = [
  {
    id: 'kemerdekaan_1',
    eventSlug: 'kemerdekaan',
    nama: 'Lomba 17-an',
    deskripsi: 'Jawab 17 soal benar dari game apapun selama event berlangsung.',
    emoji: '🎯',
    accent: '#E11D48',
    goal: 17,
    unit: 'jawaban benar',
    rewardItemId: 'bingkai_kemerdekaan',
    requires: [],
  },
  {
    id: 'kemerdekaan_2',
    eventSlug: 'kemerdekaan',
    nama: 'Pasukan Merah Putih',
    deskripsi: 'Menangkan 8 duel selama event berlangsung.',
    emoji: '⚔️',
    accent: '#E11D48',
    goal: 8,
    unit: 'kemenangan duel',
    rewardItemId: 'spanduk_kemerdekaan',
    requires: [],
  },
  {
    id: 'kemerdekaan_3',
    eventSlug: 'kemerdekaan',
    nama: 'Garuda Matematika',
    deskripsi: 'Selesaikan Misi 1 & 2 kemerdekaan untuk meraih hadiah utama!',
    emoji: '🦅',
    accent: '#F59E0B',
    goal: 2,
    unit: 'misi selesai',
    rewardItemId: 'pet_kelinsay_merahputih',
    requires: ['kemerdekaan_1', 'kemerdekaan_2'],
  },
]

export function getMissionsForEvent(eventSlug) {
  return EVENT_MISSIONS.filter(m => m.eventSlug === eventSlug)
}

/**
 * Increment mission progress for a student.
 * - Only works while the event is active.
 * - Will not exceed the goal.
 * - Sets completed_at on first completion.
 * - Auto-completes dependent missions (requires[]) when prerequisites are met.
 * Fire-and-forget safe — errors are logged, never thrown.
 */
/**
 * Increment mission progress for a student.
 * Returns { progress, goal, justCompleted, autoCompleted: string[] }
 * or null if: mission already complete, event not active, or error.
 * Fire-and-forget safe — errors are caught and logged, never thrown.
 */
export async function incrementMissionProgress(studentId, missionId, delta = 1) {
  try {
    const mission = EVENT_MISSIONS.find(m => m.id === missionId)
    if (!mission) return null
    const ev = SEASONAL_EVENTS.find(e => e.slug === mission.eventSlug)
    if (!ev || !isEventActive(ev)) return null

    const { rows } = await pool.query(`
      insert into event_mission_progress (student_id, mission_id, progress)
      values ($1, $2, least($3, $4))
      on conflict (student_id, mission_id) do update
        set
          progress = least(event_mission_progress.progress + $3, $4),
          completed_at = case
            when event_mission_progress.completed_at is null
                 and least(event_mission_progress.progress + $3, $4) >= $4
            then now()
            else event_mission_progress.completed_at
          end
        where event_mission_progress.completed_at is null
      returning progress, completed_at
    `, [studentId, missionId, delta, mission.goal])

    // No rows returned → mission was already completed (WHERE clause blocked the update)
    if (rows.length === 0) return null

    const row = rows[0]
    const justCompleted = row.completed_at !== null

    const autoCompleted = await _autoCompleteRequires(studentId, mission.eventSlug)

    return { progress: row.progress, goal: mission.goal, justCompleted, autoCompleted }
  } catch (err) {
    console.error('incrementMissionProgress error', err)
    return null
  }
}

/**
 * Auto-complete missions whose `requires` list is fully satisfied.
 * Returns array of mission IDs that were NEWLY auto-completed this call.
 */
async function _autoCompleteRequires(studentId, eventSlug) {
  const autoMissions = EVENT_MISSIONS.filter(
    m => m.eventSlug === eventSlug && m.requires.length > 0
  )
  if (autoMissions.length === 0) return []

  const allIds = EVENT_MISSIONS.filter(m => m.eventSlug === eventSlug).map(m => m.id)
  const { rows } = await pool.query(`
    select mission_id from event_mission_progress
    where student_id = $1 and mission_id = any($2::text[]) and completed_at is not null
  `, [studentId, allIds])

  const done = new Set(rows.map(r => r.mission_id))
  const newlyCompleted = []
  for (const mission of autoMissions) {
    if (done.has(mission.id)) continue
    if (!mission.requires.every(id => done.has(id))) continue
    const { rowCount } = await pool.query(`
      insert into event_mission_progress (student_id, mission_id, progress, completed_at)
      values ($1, $2, $3, now())
      on conflict (student_id, mission_id) do update
        set progress = $3,
            completed_at = coalesce(event_mission_progress.completed_at, now())
        where event_mission_progress.completed_at is null
    `, [studentId, mission.id, mission.goal])
    if (rowCount > 0) newlyCompleted.push(mission.id)
  }
  return newlyCompleted
}

/**
 * Returns all mission progress rows for a student + event, merged with mission metadata.
 */
export async function getMissionProgress(studentId, eventSlug) {
  const missions = getMissionsForEvent(eventSlug)
  if (missions.length === 0) return []

  const { rows } = await pool.query(`
    select mission_id, progress, completed_at, reward_claimed_at
    from event_mission_progress
    where student_id = $1 and mission_id = any($2::text[])
  `, [studentId, missions.map(m => m.id)])

  const map = Object.fromEntries(rows.map(r => [r.mission_id, r]))
  return missions.map(m => {
    const r = map[m.id] || {}
    return {
      ...m,
      progress:  r.progress || 0,
      completed: !!r.completed_at,
      claimed:   !!r.reward_claimed_at,
    }
  })
}

/**
 * Claim a mission reward — give the item + mark reward_claimed_at.
 * Throws user-facing Error on failure.
 */
export async function claimMissionReward(studentId, missionId) {
  const mission = EVENT_MISSIONS.find(m => m.id === missionId)
  if (!mission) throw new Error('Misi tidak ditemukan.')
  const ev = SEASONAL_EVENTS.find(e => e.slug === mission.eventSlug)
  if (!ev || !isEventActive(ev)) throw new Error('Event sudah berakhir.')

  const client = await pool.connect()
  try {
    await client.query('begin')

    const { rows: prog } = await client.query(`
      select completed_at, reward_claimed_at
      from event_mission_progress
      where student_id = $1 and mission_id = $2
      for update
    `, [studentId, missionId])

    const row = prog[0]
    if (!row || !row.completed_at)    throw new Error('Misi belum selesai.')
    if (row.reward_claimed_at)         throw new Error('Hadiah sudah diambil sebelumnya.')

    const { rows: itemRows } = await client.query(
      'select id from shop_items where id = $1', [mission.rewardItemId]
    )
    if (itemRows.length === 0) throw new Error('Item hadiah tidak ditemukan di katalog.')

    await client.query(`
      insert into student_inventory (student_id, item_id)
      values ($1, $2)
      on conflict (student_id, item_id) do nothing
    `, [studentId, mission.rewardItemId])

    await client.query(`
      update event_mission_progress
      set reward_claimed_at = now()
      where student_id = $1 and mission_id = $2
    `, [studentId, missionId])

    await client.query('commit')
    return { ok: true, itemId: mission.rewardItemId }
  } catch (err) {
    await client.query('rollback').catch(() => {})
    throw err
  } finally {
    client.release()
  }
}
