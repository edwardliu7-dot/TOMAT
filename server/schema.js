import { pool } from './db.js'

export async function ensureSchema() {
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
    alter table gurus add column if not exists photo_url text;
    alter table gurus add column if not exists bio text;
  `)
  // Seed a default teacher account covering all classes so the app is usable
  // immediately on a fresh database. Change this password after first login.
  await pool.query(`
    insert into gurus (id, username, name, password, kelas_diampu)
    values ('guru1', 'guru1', 'Guru TOMAT', 'tomat2026', array['VII Ibnu Batutah','VIII Ibnu Sina','IX Al Khawarizmi'])
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
  `)

  await pool.query(`
    create table if not exists shop_items (
      id text primary key,
      kategori text not null check (kategori in ('bingkai','spanduk','tema','stiker')),
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
    ['bingkai_neon', 'bingkai', 'Neon Cyber', 500, { border: '#34D399', style: 'dashed' }, 1],
    ['bingkai_api', 'bingkai', 'Api Abadi', 800, { border: '#F87171', style: 'double' }, 2],
    ['bingkai_es', 'bingkai', 'Ice Crystal', 1200, { border: '#67E8F9', style: 'solid' }, 3],
    ['bingkai_sakura', 'bingkai', 'Sakura Petal', 950, { border: '#F9A8D4', style: 'dotted' }, 4],
    ['bingkai_emas', 'bingkai', 'Golden Halo', 2000, { border: '#EAB308', style: 'solid', glow: true }, 5],
    ['bingkai_void', 'bingkai', 'Void King', 3000, { border: '#A855F7', style: 'solid', glow: true }, 6],
    ['spanduk_galaksi', 'spanduk', 'Galaksi', 1000, { gradient: 'linear-gradient(90deg,#312e81,#581c87,#000)' }, 1],
    ['spanduk_hutan', 'spanduk', 'Hutan Ajaib', 1200, { gradient: 'linear-gradient(90deg,#064e3b,#134e4a)' }, 2],
    ['spanduk_retro', 'spanduk', 'Retro 8-bit', 2500, { gradient: 'linear-gradient(90deg,#374151,#111827)' }, 3],
  ]
  for (const [id, kategori, nama, harga, visual, sortOrder] of shopItems) {
    await pool.query(
      `insert into shop_items (id, kategori, nama, harga, visual, sort_order)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (id) do update set kategori=$2, nama=$3, harga=$4, visual=$5, sort_order=$6`,
      [id, kategori, nama, harga, JSON.stringify(visual), sortOrder]
    )
  }

  // Seed badge definitions (idempotent — award logic in gamify.js checks these by id).
  const badgeDefs = [
    ['pemula_tangguh', 'Pemula Tangguh', 'Mencapai Level 5', '⚡', '#EAB308', 1],
    ['jawara_tangguh', 'Jawara Tangguh', 'Mencapai Level 10', '🛡️', '#F97316', 2],
    ['legenda_tomat', 'Legenda TOMAT', 'Mencapai Level 20', '👑', '#818CF8', 3],
    ['pakar_survival', 'Pakar Survival', '15 soal beruntun (Survival)', '🔥', '#F87171', 4],
    ['raja_survival', 'Raja Survival', '30 soal beruntun (Survival)', '🏆', '#FBBF24', 5],
    ['nilai_sempurna', 'Sempurna', 'Dapat nilai 100 di sebuah Tugas', '⭐', '#A78BFA', 6],
    ['rajin_berlatih', 'Rajin Berlatih', 'Selesaikan 10 tugas', '📚', '#34D399', 7],
    ['kolektor_emas', 'Kolektor Emas', 'Kumpulkan total 2.000 koin', '💰', '#EAB308', 8],
    ['juara_kelas', 'Juara Kelas', 'Peringkat #1 EXP di kelasmu', '🥇', '#FDE047', 9],
    ['penjelajah_lengkap', 'Penjelajah Lengkap', 'Selesaikan tugas Harian, Formatif & Sumatif', '🗺️', '#67E8F9', 10],
  ]
  for (const [id, nama, deskripsi, icon, color, sortOrder] of badgeDefs) {
    await pool.query(
      `insert into badges (id, nama, deskripsi, icon, color, sort_order)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (id) do update set nama=$2, deskripsi=$3, icon=$4, color=$5, sort_order=$6`,
      [id, nama, deskripsi, icon, color, sortOrder]
    )
  }
}
