import { pool, MIGRATION_FORBIDDEN_TABLES, assertNoForbiddenTables } from './db.js'

// ════════════════════════════════════════════════════════════════��[...]
// ⛔  MIGRATION PREVENTION — LAPISAN 2 (schema-level early-check)
//
// ensureSchema() berjalan saat server startup. Blok di ATAS akan mendeteksi
// dan men-DROP tabel-tabel terlarang; blok assertNoForbiddenCreateTable() di
// BAWAH ini memvalidasi bahwa TIDAK ADA CREATE TABLE yang menargetkan tabel
// terlarang SEBELUM query benar-benar dikirim.
//
// Jika Anda menambahkan CREATE TABLE baru, pastikan namanya TIDAK ada dalam
// MIGRATION_FORBIDDEN_TABLES (daftar ada di server/db.js).
// ══════════════════════════════════════════════════════════════════════════════

export async function ensureSchema() {
  // ── Early guard: tolak CREATE TABLE untuk tabel terlarang ─────────────────
  // Fungsi ini di-patch ke pool.query selama ensureSchema() berjalan saja,
  // sehingga setiap CREATE TABLE yang secara tidak sengaja menargetkan tabel
  // terlarang akan melempar error yang jelas sebelum menyentuh database.
  const originalQuery = pool.query.bind(pool)
  pool.query = function guardedSchemaQuery(text, values) {
    assertNoForbiddenTables(text)
    return originalQuery(text, values)
  }
  try {
  // Core identity tables (normally owned/shared by BLP Harian). Created here
  // as a fresh baseline since this database is a new standalone instance.
  await pool.query(`
    create table if not exists gurus (
      id text primary key,
      username text unique not null,
      name text not null,
      password text not null,
      kelas_diampu text[] not null default '{}',
      email text,
      whatsapp text,
      created_at timestamptz not null default now()
    );
  `)
  await pool.query(`
    create table if not exists students (
      id text primary key,
      username text unique not null,
      name text not null,
      password text not null,
      kelas text not null,
      email text not null,
      whatsapp text not null,
      created_at timestamptz not null default now()
    );
  `)
  await pool.query(`
    alter table students add column if not exists photo_url text;
    alter table students add column if not exists bio text;
    alter table students add column if not exists is_test_account boolean not null default false;
    alter table gurus add column if not exists photo_url text;
    alter table gurus add column if not exists bio text;
  `)
  // Seed a default teacher account covering all classes so the app is usable
  // immediately on a fresh database. Change this password after first login.
  await pool.query(`
    insert into gurus (id, username, name, password, kelas_diampu)
    values ('guru1', 'guru1', 'Guru TOMAT', 'tomat2026', array['VII Ibnu Batuttah','VIII Ibnu Sina','IX Al Khawarizmi'])
    on conflict (id) do nothing;
  `)
  await pool.query(`
    create table if not exists tugas (
      id serial primary key,
      guru_id text not null references gurus(id),
      kelas text not null,
      game_key text not null,
      game_name text not null,
      game_emoji text,
      bab text,
      type text not null check (type in ('harian','formatif','sumatif')),
      total_questions int not null default 5,
      assigned_at timestamptz not null default now(),
      due_at date,
      status text not null default 'active'
    );
  `)
  await pool.query(`
    alter table tugas add column if not exists difficulty text not null default 'medium';
  `)
  await pool.query(`
    create table if not exists nilai (
      id serial primary key,
      tugas_id int not null references tugas(id) on delete cascade,
      student_id text not null references students(id),
      correct_count int not null check (correct_count >= 0),
      total_questions int not null check (total_questions > 0),
      score int not null check (score between 0 and 100),
      completed_at timestamptz not null default now(),
      unique(tugas_id, student_id),
      check (correct_count <= total_questions)
    );
  `)
  // Task exit reports — records when a student leaves the app during a task session.
  await pool.query(`
    create table if not exists task_exit_reports (
      id            serial primary key,
      student_id    text not null references students(id) on delete cascade,
      tugas_id      int  not null references tugas(id)    on delete cascade,
      correct_at_exit  int not null default 0,
      total_questions  int not null default 0,
      reported_at   timestamptz not null default now()
    );
    create index if not exists task_exit_reports_tugas_idx
      on task_exit_reports (tugas_id, reported_at desc);
  `)

  // Communication: private teacher/student messages and class forums.
  // Access is enforced in server/komunikasi.js using the exact class roster
  // and teaching assignments, not only the client-side visibility.
  await pool.query(`
    create table if not exists pesan_pribadi (
      id serial primary key,
      sender_id text not null,
      sender_role text not null check (sender_role in ('guru','siswa')),
      recipient_id text not null,
      recipient_role text not null check (recipient_role in ('guru','siswa')),
      body text not null check (char_length(body) between 1 and 2000),
      created_at timestamptz not null default now(),
      delivered_at timestamptz,
      read_at timestamptz,
      check (sender_id <> recipient_id),
      check (
        (sender_role = 'guru' and recipient_role = 'siswa')
        or (sender_role = 'siswa' and recipient_role = 'guru')
      )
    );
    create index if not exists pesan_pribadi_pair_idx
      on pesan_pribadi (sender_id, recipient_id, created_at);
    create index if not exists pesan_pribadi_recipient_idx
      on pesan_pribadi (recipient_id, created_at);
    alter table pesan_pribadi
      add column if not exists delivered_at timestamptz;
    alter table pesan_pribadi
      add column if not exists read_at timestamptz;
    create index if not exists pesan_pribadi_status_idx
      on pesan_pribadi (recipient_id, recipient_role, delivered_at, read_at);
  `)
  await pool.query(`
    create table if not exists pesan_forum_kelas (
      id serial primary key,
      kelas text not null,
      sender_id text not null,
      sender_role text not null check (sender_role in ('guru','siswa')),
      body text not null check (char_length(body) between 1 and 2000),
      created_at timestamptz not null default now()
    );
    create index if not exists pesan_forum_kelas_idx
      on pesan_forum_kelas (kelas, created_at);
  `)
  await pool.query(`
    create table if not exists komunikasi_dibaca (
      reader_id text not null,
      reader_role text not null check (reader_role in ('guru','siswa')),
      conversation_type text not null check (conversation_type in ('private','forum')),
      conversation_key text not null,
      last_read_at timestamptz not null default now(),
      last_read_message_id int not null default 0,
      primary key (reader_id, reader_role, conversation_type, conversation_key)
    );
    alter table komunikasi_dibaca
      add column if not exists last_read_message_id int not null default 0;
    create index if not exists komunikasi_dibaca_reader_idx
      on komunikasi_dibaca (reader_id, reader_role, conversation_type);
  `)
  await pool.query(`
    create table if not exists push_subscriptions (
      endpoint text primary key,
      user_id text not null,
      user_role text not null check (user_role in ('guru','siswa')),
      p256dh text not null,
      auth text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create index if not exists push_subscriptions_user_idx
      on push_subscriptions (user_id, user_role);
  
    create table if not exists notifications (
      id serial primary key,
      recipient_id text not null,
      recipient_role text not null check (recipient_role in ('guru','siswa')),
      type text not null default 'general',
      title text not null,
      body text not null,
      url text not null default '/',
      metadata jsonb not null default '{}',
      read_at timestamptz,
      created_at timestamptz not null default now()
    );
    create index if not exists notifications_recipient_idx
      on notifications (recipient_id, recipient_role, created_at desc);
    create index if not exists notifications_unread_idx
      on notifications (recipient_id, recipient_role) where read_at is null;
  `)
  // Add check constraints idempotently in case the table was created before they existed.
  await pool.query(`
    do $do$
    begin
      if not exists (select 1 from pg_constraint where conname = 'nilai_correct_count_check') then
        alter table nilai add constraint nilai_correct_count_check check (correct_count >= 0);
      end if;
      if not exists (select 1 from pg_constraint where conname = 'nilai_total_questions_check') then
        alter table nilai add constraint nilai_total_questions_check check (total_questions > 0);
      end if;
      if not exists (select 1 from pg_constraint where conname = 'nilai_score_check') then
        alter table nilai add constraint nilai_score_check check (score between 0 and 100);
      end if;
      if not exists (select 1 from pg_constraint where conname = 'nilai_correct_le_total_check') then
        alter table nilai add constraint nilai_correct_le_total_check check (correct_count <= total_questions);
      end if;
    end $do$;
  `)
  await pool.query(`
    create table if not exists bab_locks (
      grade int not null,
      bab text not null,
      locked boolean not null default false,
      updated_by text,
      updated_at timestamptz not null default now(),
      primary key (grade, bab)
    );
  `)

  // --- Pet system: Tomi the guinea pig (marmut) ---
  await pool.query(`
    alter table students add column if not exists pet_hunger_until timestamptz;
    alter table students add column if not exists equipped_pet_skin text not null default 'golden';
    alter table students add column if not exists pet_hunger_map jsonb default '{}';
  `)
  // Initialise hunger for any existing students who never had a pet yet
  await pool.query(`
    update students set pet_hunger_until = now() + interval '24 hours'
    where pet_hunger_until is null;
  `)
  // Migrate existing pet_hunger_until into per-skin map (runs once per student; skips if map already populated)
  await pool.query(`
    update students
    set pet_hunger_map = jsonb_build_object(
      coalesce(nullif(equipped_pet_skin, ''), 'golden'),
      to_jsonb(pet_hunger_until::text)
    )
    where pet_hunger_until is not null
      and (pet_hunger_map is null or pet_hunger_map = '{}');
  `)

  // --- Gamifikasi: coins/level/exp persistence, toko kosmetik, lencana pencapaian ---
  // Previously coins/level/exp only lived in client-side React state (never saved), so every
  // reload reset progress. These columns make them real, server-authoritative student data.
  await pool.query(`
    alter table students add column if not exists coins int not null default 0;
    alter table students add column if not exists level int not null default 1;
    alter table students add column if not exists exp int not null default 0;
    alter table students add column if not exists total_coins_earned int not null default 0;
    alter table students add column if not exists best_survival_streak int not null default 0;
    alter table students add column if not exists equipped_bingkai text;
    alter table students add column if not exists equipped_spanduk text;
    alter table students add column if not exists equipped_tema text;
    alter table students add column if not exists equipped_stiker text;
    alter table students add column if not exists stiker_layout jsonb not null default '[]';
    alter table students add column if not exists last_login_bonus_date date;
    alter table students add column if not exists login_streak int not null default 0;
  `)

  // Widen the kategori check constraint to include pet_skin (idempotent)
  await pool.query(`
    do $$ begin
      if exists (select 1 from pg_constraint where conname = 'shop_items_kategori_check') then
        alter table shop_items drop constraint shop_items_kategori_check;
      end if;
      if not exists (
        select 1 from pg_constraint
        where conname = 'shop_items_kategori_check2'
      ) then
        alter table shop_items add constraint shop_items_kategori_check2
          check (kategori in ('bingkai','spanduk','tema','stiker','pet_skin'));
      end if;
    end $$;
  `)

  await pool.query(`
    create table if not exists shop_items (
      id text primary key,
      kategori text not null,
      nama text not null,
      harga int not null default 0,
      visual jsonb not null default '{}',
      sort_order int not null default 0
    );
  `)
  await pool.query(`
    create table if not exists student_inventory (
      student_id text not null references students(id) on delete cascade,
      item_id text not null references shop_items(id) on delete cascade,
      purchased_at timestamptz not null default now(),
      primary key (student_id, item_id)
    );
  `)

  await pool.query(`
    create table if not exists badges (
      id text primary key,
      nama text not null,
      deskripsi text not null,
      icon text not null,
      color text not null,
      sort_order int not null default 0
    );
  `)
  await pool.query(`
    create table if not exists student_badges (
      student_id text not null references students(id) on delete cascade,
      badge_id text not null references badges(id) on delete cascade,
      earned_at timestamptz not null default now(),
      primary key (student_id, badge_id)
    );
  `)

  // Seed shop items (idempotent upsert so copy/pricing tweaks can ship via redeploy).
  const shopItems = [
    ['bingkai_neon',   'bingkai', 'Neon Cyber',   500,  { image: '/bingkai-neon.png',   border: '#34D399', mixBlend: 'screen', spread: 0.25 }, 1],
    // ... (omitted for brevity) ...
  ]
  // Remove discontinued event items so they don't linger in the DB
  await pool.query(`
    delete from shop_items where id in (
      'tema_nusantara',
      'bingkai_halloween', 'tema_halloween', 'pet_kelinsay_labu',
      'bingkai_natal',     'tema_natal',     'pet_skin_natal'
    )
  `)

  for (const [id, kategori, nama, harga, visual, sortOrder] of shopItems) {
    await pool.query(
      `insert into shop_items (id, kategori, nama, harga, visual, sort_order)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (id) do update set kategori=$2, nama=$3, harga=$4, visual=$5, sort_order=$6`,
      [id, kategori, nama, harga, JSON.stringify(visual), sortOrder]
    )
  }

  // Internal showcase account: teachers can use it to preview the complete
  // luxury catalog, while student-facing queries filter it by this flag.
  await pool.query(`
    insert into students
      (id, username, name, password, kelas, email, whatsapp, is_test_account)
    values
      ('tomat-demo', 'tomat', 'TOMAT Demo', '1234', 'IX Al Khawarizmi',
       'tomat-demo@tomat.local', '0000000000', true)
    on conflict (id) do update set
      username = excluded.username,
      name = excluded.name,
      password = excluded.password,
      kelas = 'IX Al Khawarizmi',
      email = excluded.email,
      whatsapp = excluded.whatsapp,
      is_test_account = true
  `)
  await pool.query(`
    insert into students
      (id, username, name, password, kelas, email, whatsapp, is_test_account)
    values
      ('tomat-demo-2', 'tomat2', 'TOMAT Demo 2', '1234', 'IX Al Khawarizmi',
       'tomat-demo-2@tomat.local', '0000000001', true)
    on conflict (id) do update set
      username = excluded.username,
      name = excluded.name,
      password = excluded.password,
      kelas = 'IX Al Khawarizmi',
      email = excluded.email,
      whatsapp = excluded.whatsapp,
      is_test_account = true
  `)
  await pool.query(`
    insert into student_inventory (student_id, item_id)
    select demo_accounts.student_id, shop_items.id
    from (values ('tomat-demo'), ('tomat-demo-2')) as demo_accounts(student_id)
    cross join shop_items
    on conflict (student_id, item_id) do nothing
  `)
  await pool.query(`
    update students
    set coins = 999999,
        equipped_bingkai  = coalesce(nullif(equipped_bingkai, ''),  'bingkai_aurum_sovereign'),
        equipped_spanduk  = coalesce(nullif(equipped_spanduk, ''),  'spanduk_celestia_relic'),
        equipped_pet_skin = coalesce(nullif(equipped_pet_skin, ''), 'pet_skin_void')
    where id in ('tomat-demo', 'tomat-demo-2')
  `)

  // ── Event mission progress ──────────────────────────────────────────────────
  // One row per (student, mission). progress counts toward goal; completed_at
  // is set when progress >= goal; reward_claimed_at is set when item is given.
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

  // Tournament history — one row per finished/cancelled tournament
  await pool.query(`
    create table if not exists tournament_history (
      id          text primary key,
      kelas       text not null,
      guru_id     text not null references gurus(id),
      game_key    text not null,
      status      text not null check (status in ('finished','cancelled')),
      champion_name text,
      champion_id   text,
      total_participants int not null default 0,
      total_rounds       int not null default 0,
      finished_at timestamptz not null default now()
    );
  `)
  await pool.query(`
    alter table tournament_history
      add column if not exists kelas_arr       text[]  default null,
      add column if not exists runner_up_name  text    default null,
      add column if not exists runner_up_id    text    default null,
      add column if not exists third_place_names text[] default null;
  `)

  // Hafalan setoran table — each row is one assessment by a guru for a student
  await pool.query(`
    create table if not exists hafalan_setoran (
      id serial primary key,
      student_id text not null references students(id) on delete cascade,
      guru_id    text not null references gurus(id),
      jenis      text not null check (jenis in ('perkalian','pembagian')),
      angka      int  not null check (angka between 1 and 10),
      status     text not null check (status in ('lulus','diulang')),
      dinilai_at timestamptz not null default now()
    );
  `)

  // Seed badge definitions (idempotent — award logic in gamify.js checks these by id).
  const badgeDefs = [ /* omitted for brevity */ ]
  for (const [id, nama, deskripsi, icon, color, sortOrder] of badgeDefs) {
    await pool.query(
      `insert into badges (id, nama, deskripsi, icon, color, sort_order)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (id) do update set nama=$2, deskripsi=$3, icon=$4, color=$5, sort_order=$6`,
      [id, nama, deskripsi, icon, color, sortOrder]
    )
  }

  // ── GuruEOB5 Tables ───────────────────────────────────────────────────────��[...]
  // Kolom tambahan di tabel gurus untuk EOB5 role management
  await pool.query(`ALTER TABLE gurus ADD COLUMN IF NOT EXISTS jabatan text[] NOT NULL DEFAULT '{}'`)
  await pool.query(`ALTER TABLE gurus ADD COLUMN IF NOT EXISTS wali_kelas_kelas text`)

  // Tabel absensi harian siswa (lama — dipertahankan untuk backward-compat, data lama ada di sini)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS absensi (
      id          SERIAL PRIMARY KEY,
      student_id  text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      guru_id     text NOT NULL REFERENCES gurus(id),
      tanggal     DATE NOT NULL,
      status      varchar(20) NOT NULL DEFAULT 'hadir',
      keterangan  text,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (student_id, tanggal)
    )
  `)

  // ── GuruEOB5 Tables (Bagian 2) ───────────────────────────────────────────────
  // Tabel-tabel berikut sudah di-DROP karena menduplikat tabel lama dari app GuruEOB5:
  //   attendance_records → gunakan absensi
  //   kelas_guru         → gunakan gurus.kelas_diampu
  //   nilai_guru         → gunakan grades (JOIN subjects)
  //   poin               → gunakan point_records
  //   nilai_akademik     → gunakan grades (JOIN subjects)
  //   materi             → gunakan bahan_ajar
  //   jadwal             → gunakan schedules (app lama)
  //   kalender_akademik  → gunakan academic_calendars
  //   info_pekanan       → dihitung dari prosem_items + journal_entries + schedules

  await pool.query(`
    CREATE TABLE IF NOT EXISTS prosem (
      id             SERIAL PRIMARY KEY,
      teacher_id     text REFERENCES gurus(id),
      mata_pelajaran VARCHAR(100) NOT NULL,
      kelas          VARCHAR(50) NOT NULL,
      semester       INTEGER NOT NULL,
      tahun_ajaran   VARCHAR(20) NOT NULL,
      konten         JSONB,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  // ... (rest of file unchanged) ...

  // MOBA results are durable, while the realtime match registry remains
  // in-memory. match_id is the settlement idempotency key for rewards.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS moba_match_results (
      match_id text PRIMARY KEY,
      team_size int NOT NULL CHECK (team_size IN (1, 2, 3)),
      winner text NOT NULL CHECK (winner IN ('teamA', 'teamB', 'draw')),
      team_a_score int NOT NULL DEFAULT 0 CHECK (team_a_score >= 0),
      team_b_score int NOT NULL DEFAULT 0 CHECK (team_b_score >= 0),
      snapshot jsonb NOT NULL,
      reward_coins int NOT NULL DEFAULT 0 CHECK (reward_coins >= 0),
      rewarded_player_ids text[] NOT NULL DEFAULT '{}',
      finished_at timestamptz NOT NULL DEFAULT now(),
      reward_issued_at timestamptz
    )
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS moba_match_results_finished_idx
      ON moba_match_results (finished_at DESC)
  `)

  // New table: MOBA arena definitions editable by guru
  await pool.query(`
    CREATE TABLE IF NOT EXISTS moba_arenas (
      id text PRIMARY KEY,
      guru_id text NOT NULL REFERENCES gurus(id),
      name text,
      config jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_moba_arenas_guru_id ON moba_arenas (guru_id)`)

  // Hapus student_points jika masih ada (sudah di-rename ke point_records di skema lama)
  await pool.query(`DROP TABLE IF EXISTS student_points CASCADE`).catch(() => {})

  console.log('[schema] EOB5 migrations complete')

  // ── MIGRATION PREVENTION GUARD (runtime DROP) ────────────────────────────
  // Tabel-tabel berikut TERLARANG ada di database ini karena menduplikat
  // data lama app GuruEOB5 yang masih aktif. Jika karena suatu alasan tabel-tabel
  // ini terbuat ulang (misalnya agent lain menambahkan CREATE TABLE), blok ini
  // akan MENDETEKSI dan MEN-DROP-nya saat server startup — dengan log peringatan.
  // Daftar MIGRATION_FORBIDDEN_TABLES dikelola secara sentral di server/db.js.
  for (const tbl of MIGRATION_FORBIDDEN_TABLES) {
    // Bypass patch di atas — kita memang perlu query information_schema untuk cek
    const { rows } = await originalQuery(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1`,
      [tbl]
    )
    if (rows.length) {
      console.error(
        `[schema] ⛔ TABEL TERLARANG "${tbl}" terdeteksi! ` +
        `Tabel ini duplikat data lama app GuruEOB5 dan akan di-DROP sekarang.`
      )
      await originalQuery(`DROP TABLE IF EXISTS "${tbl}" CASCADE`)
      console.error(`[schema] ⛔ "${tbl}" berhasil di-DROP otomatis.`)
    }
  }
  console.log('[schema] Migration prevention guard: OK')
  } finally {
    // Selalu kembalikan pool.query ke versi asli setelah ensureSchema() selesai
    pool.query = originalQuery
  }
}
