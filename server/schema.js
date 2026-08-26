import { pool, MIGRATION_FORBIDDEN_TABLES, assertNoForbiddenTables } from './db.js'
import { CHAMPION_SKIN_ID, CHAMPION_SKIN_PRICE, FREE_CHAMPION_ACCOUNT_KEYS } from './champion-skin.js'

// ══════════════════════════════════════════════════════════════════════════════
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
    create table if not exists pesan_global (
      id serial primary key,
      sender_id text not null,
      sender_role text not null check (sender_role in ('guru','siswa')),
      body text not null check (char_length(body) between 1 and 2000),
      created_at timestamptz not null default now()
    );
    create index if not exists pesan_global_created_idx on pesan_global (created_at);
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
    ['bingkai_api',    'bingkai', 'Api Abadi',    800,  { image: '/bingkai-api.png',    border: '#F87171', mixBlend: 'screen', spread: 0.30 }, 2],
    ['bingkai_es',     'bingkai', 'Ice Crystal',  1200, { image: '/bingkai-es.png',     border: '#67E8F9', mixBlend: 'screen', spread: 0.30 }, 3],
    ['bingkai_sakura', 'bingkai', 'Sakura Petal', 950,  { image: '/bingkai-sakura.png', border: '#F9A8D4', mixBlend: 'screen', spread: 0.38 }, 4],
    ['bingkai_emas', 'bingkai', 'Golden Halo', 2000, { image: '/bingkai-emas.png', border: '#EAB308', mixBlend: 'screen', spread: 0.32, glow: true }, 5],
    ['bingkai_void', 'bingkai', 'Void King', 3000, { image: '/bingkai-void-king.png', border: '#A855F7', mixBlend: 'screen', spread: 0.30, glow: true }, 6],
    ['bingkai_aurum_sovereign', 'bingkai', 'Aurum Sovereign', 12000, {
      image: '/bingkai-aurum-sovereign.png', border: '#D4AF37', mixBlend: 'screen', spread: 0.30, glow: true, limited: true, edition: '01 / 25',
      description: 'Warisan mahkota bagi penguasa rasio.', luxury: 'aurum'
    }, 7],
    ['bingkai_void_monarch', 'bingkai', 'Void Monarch', 18000, {
      image: '/bingkai-void-monarch.png', border: '#6366F1', mixBlend: 'screen', spread: 0.30, glow: true, limited: true, edition: '03 / 13',
      description: 'Akuisisi langka dari singgasana kehampaan.', luxury: 'void'
    }, 8],
    ['bingkai_petal_rose', 'bingkai', 'Petal Rose', 600, {
      image: '/petal-rose.png', border: '#F9A8D4', style: 'solid',
      description: 'Mahkota kelopak mawar yang lembut dan elegan.'
    }, 9],
    ['bingkai_garuda', 'bingkai', 'Garuda Agung', 4500, {
      image: '/garuda.gif', border: '#F59E0B', style: 'solid', glow: true,
      description: 'Bingkai animasi Garuda — simbol keagungan dan semangat juang.'
    }, 10],
    ['spanduk_galaksi', 'spanduk', 'Galaksi', 1000, { gradient: 'linear-gradient(90deg,#312e81,#581c87,#000)' }, 1],
    ['spanduk_hutan', 'spanduk', 'Hutan Ajaib', 1200, { gradient: 'linear-gradient(90deg,#064e3b,#134e4a)' }, 2],
    ['spanduk_retro', 'spanduk', 'Retro 8-bit', 2500, { gradient: 'linear-gradient(90deg,#374151,#111827)' }, 3],
    ['spanduk_celestia_relic', 'spanduk', 'Celestia Relic', 22000, {
      gradient: 'linear-gradient(115deg,#020617,#172554 48%,#e0f2fe)', limited: true, edition: '07 / 12',
      description: 'Artefak kosmik untuk kolektor yang tak tersentuh.', luxury: 'celestia'
    }, 4],
    ['spanduk_royal_mathematician', 'spanduk', 'Royal Mathematician', 15000, {
      gradient: 'linear-gradient(115deg,#17120c,#45351b 48%,#d4af37)', limited: true, edition: '02 / 20',
      description: 'Dekrit mahaguru bagi penakluk anatomi angka.', luxury: 'royal'
    }, 5],
    // Pet skins — purchasable once, stored in student_inventory
    ['pet_skin_silver', 'pet_skin', 'Silver Fluff',   800,  { tier: 'premium',   desc: 'Bulu perak berkilau. Menunjukkan siswa aktif dan rajin mengumpulkan koin.' }, 1],
    ['pet_skin_cosmic', 'pet_skin', 'Cosmic Fluff',  3500,  { tier: 'langka', desc: 'Bulu ungu-biru galaksi dengan bintang berkelip di rosette.' }, 2],
    ['pet_skin_void',   'pet_skin', 'Void Emperor', 11000,  { tier: 'epic',   desc: 'Bulu hitam pekat berpendar emas, jubah dan mahkota kerajaan. Dominasi leaderboard.' }, 3],
    // New animal pets — different base animal, not a Tomi skin
    ['pet_kelinsay', 'pet_skin', 'Kelinsay',  3000, { tier: 'umum',   baseAnimal: 'kelinci', desc: 'Kelinci putih lembut berhati hangat. Telinganya panjang, selalu mendengarkan.' }, 4],
    ['pet_monyong',  'pet_skin', 'Monyang',   6000, { tier: 'langka', baseAnimal: 'monyet',  desc: 'Monyet ceria penuh ekspresi. Ekornya selalu berayun dan senyumnya lebar!' }, 5],
    ['pet_komodih',  'pet_skin', 'KomoDIH',   7500, { tier: 'langka', baseAnimal: 'komodo',  desc: 'Komodo muda penjelajah dengan topi ekspedisi. Teliti membaca setiap jejak menuju jawaban.' }, 6],
    ['pet_nananaga', 'pet_skin', 'Nananaga', 15000, { tier: 'epic',   baseAnimal: 'naga',    desc: 'Naga abadi berkuasa. Matanya menyala, sayapnya menggelegar, api di mulutnya.' }, 7],
    // Animal skins — locked until the matching base pet is owned.
    ['pet_kelinsay_senja', 'pet_skin', 'Kelinsay Senja', 2000, {
      tier: 'umum+', baseAnimal: 'kelinci', prerequisitePetId: 'pet_kelinsay',
      desc: 'Bulu hangat warna senja. Muncul saat matahari terbenam, membawa ketenangan dan semangat belajar.'
    }, 8],
    ['pet_kelinsay_malam', 'pet_skin', 'Kelinsay Malam', 9000, {
      tier: 'epic', baseAnimal: 'kelinci', prerequisitePetId: 'pet_kelinsay',
      desc: 'Bulu malam bertabur bintang. Pendiam, elegan, dan selalu ditemani cahaya bulan.'
    }, 9],
    ['pet_monyong_raja', 'pet_skin', 'Monyang Raja', 9000, {
      tier: 'langka', baseAnimal: 'monyet', prerequisitePetId: 'pet_monyong',
      desc: 'Mahkota emas bertahta di kepalanya. Monyang Raja memerintah leaderboard dengan senyum lebarnya.'
    }, 10],
    ['pet_monyong_kosmik', 'pet_skin', 'Monyang Kosmik', 13000, {
      tier: 'epic', baseAnimal: 'monyet', prerequisitePetId: 'pet_monyong',
      desc: 'Monyet penjelajah galaksi dengan bulu nebula dan bintang-bintang yang berkilau di sekelilingnya.'
    }, 11],
    ['pet_nananaga_merah', 'pet_skin', 'Nananaga Merah', 18000, {
      tier: 'epic', baseAnimal: 'naga', prerequisitePetId: 'pet_nananaga',
      desc: 'Naga api merah menyala. Sisiknya membara dan napasnya meninggalkan jejak bara.'
    }, 12],
    ['pet_nananaga_es', 'pet_skin', 'Nananaga Es', 20000, {
      tier: 'epic', baseAnimal: 'naga', prerequisitePetId: 'pet_nananaga',
      desc: 'Naga es dari puncak gunung beku. Napasnya membekukan segalanya, matanya biru seperti samudra arktik.'
    }, 13],
    [CHAMPION_SKIN_ID, 'pet_skin', 'Nananaga Champion', CHAMPION_SKIN_PRICE, {
      tier: 'epic', baseAnimal: 'naga', prerequisitePetId: 'pet_nananaga',
      limited: true, edition: 'CHAMPION DESIGN',
      image: '/nananaga champion.png',
      desc: 'Skin edisi juara 1 kompetisi desain skin TOMAT.'
    }, 14],
    // Tema — shifts the game screen color palette + particle overlay
    ['tema_space', 'tema', 'Luar Angkasa', 1500, { accent: '#22d3ee', gradient: 'linear-gradient(135deg,#020610,#0a0f1e)', swatches: ['#020610','#0a0f1e','#22d3ee','#6366f1'], description: 'Background galaxy gelap, aksen cyan, partikel bintang.' }, 1],
    ['tema_hutan', 'tema', 'Hutan Mistis',  2000, { accent: '#4ade80', gradient: 'linear-gradient(135deg,#021408,#04230e)', swatches: ['#021408','#04230e','#4ade80','#2dd4bf'], description: 'Gradien hijau tua, aksen hijau neon, partikel daun.' }, 2],
    ['tema_api',   'tema', 'Api Merah',     2500, { accent: '#f59e0b', gradient: 'linear-gradient(135deg,#150502,#2d0a04)', swatches: ['#150502','#2d0a04','#f59e0b','#ef4444'], description: 'Gradien merah-oranye, aksen amber, overlay nyala.' }, 3],
    ['tema_salju', 'tema', 'Salju',         2000, { accent: '#7dd3fc', gradient: 'linear-gradient(135deg,#0a1929,#0f2744)', swatches: ['#0a1929','#0f2744','#7dd3fc','#e0f2fe'], description: 'Biru muda + putih, aksen ice-blue, partikel salju.' }, 4],
    ['tema_void',  'tema', 'Void',          8000, { accent: '#a855f7', gradient: 'linear-gradient(135deg,#000000,#0d0014)', swatches: ['#000000','#0d0014','#a855f7','#ec4899'], glow: true, limited: true, edition: 'LIMITED', description: 'Hitam pekat, aksen ungu neon, partikel void.' }, 5],
    // ── Seasonal event items ───────────────────────────────────────────────────
    // Kemerdekaan RI (July 15 – Aug 31)
    ['bingkai_kemerdekaan', 'bingkai', 'Bingkai 17 Agustus', 0, {
      image: '/hutri81.png', border: '#E11D48', mixBlend: 'screen', spread: 0.30, glow: true,
      sparkle: 'merahputih', eventSlug: 'kemerdekaan', limited: true, edition: 'EVENT 2026',
      description: 'Bingkai merah-putih semangat kemerdekaan Indonesia.',
      missionOnly: true, missionId: 'kemerdekaan_1',
    }, 50],
    ['spanduk_kemerdekaan', 'spanduk', 'Spanduk 17 Agustus', 0, {
      image: '/81spanduk.png', gradient: 'linear-gradient(90deg,#1a0009,#7f0018,#2d0004)',
      eventSlug: 'kemerdekaan', limited: true, edition: 'EVENT 2026',
      description: 'Spanduk merah membara semangat kemerdekaan Indonesia.',
      missionOnly: true, missionId: 'kemerdekaan_2',
    }, 51],
    ['pet_kelinsay_merahputih', 'pet_skin', 'Kelinsay Merah Putih', 0, {
      tier: 'langka', baseAnimal: 'kelinci', prerequisitePetId: 'pet_kelinsay',
      eventSlug: 'kemerdekaan', limited: true, edition: 'EVENT 2026',
      desc: 'Kelinsay berbaju merah putih, bersemangat merayakan kemerdekaan!',
      missionOnly: true, missionId: 'kemerdekaan_3',
    }, 52],
    // Stiker — placed freely on banner canvas
    ['stiker_roket',   'stiker', 'Roket Belajar',  200,  { emoji: '🚀', tier: 'common' }, 1],
    ['stiker_api',     'stiker', 'Api Semangat',   200,  { emoji: '🔥', tier: 'common' }, 2],
    ['stiker_petir',   'stiker', 'Kilat Pintar',   200,  { emoji: '⚡', tier: 'common' }, 3],
    ['stiker_bintang', 'stiker', 'Bintang Lima',   200,  { emoji: '⭐', tier: 'common' }, 4],
    ['stiker_awan',    'stiker', 'Awan Cerah',     200,  { emoji: '☁️', tier: 'common' }, 5],
    ['stiker_hati',    'stiker', 'Hati Ungu',      200,  { emoji: '💜', tier: 'common' }, 6],
    ['stiker_otak',    'stiker', 'Brainiac',       600,  { emoji: '🧠', tier: 'rare'   }, 7],
    ['stiker_mahkota', 'stiker', 'Mahkota',        600,  { emoji: '👑', tier: 'rare'   }, 8],
    ['stiker_berlian', 'stiker', 'Berlian',        600,  { emoji: '💎', tier: 'rare'   }, 9],
    ['stiker_medali',  'stiker', 'Medali Emas',    600,  { emoji: '🏅', tier: 'rare'   }, 10],
    ['stiker_naga',    'stiker', 'Sang Naga',      1500, { emoji: '🐉', tier: 'epic'   }, 11],
    ['stiker_galaksi', 'stiker', 'Galaksi',        1500, { emoji: '🌌', tier: 'epic'   }, 12],
  ]
  // Remove discontinued event items so they don't linger in the DB
  await pool.query(`
    delete from shop_items where id in (
      'tema_nusantara',
      'bingkai_halloween', 'tema_halloween', 'pet_kelinsay_labu',
      'bingkai_natal',     'tema_natal',     'pet_skin_natal',
      'bingkai_ramadan',   'spanduk_ramadan','pet_skin_ramadan'
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

  // Grant the competition-winner skin to the named accounts on every startup.
  // The insert is idempotent and also covers accounts created in the shared BLP
  // database after the first TOMAT deployment.
  const championAccountKeys = [...FREE_CHAMPION_ACCOUNT_KEYS]
  await pool.query(
    `insert into student_inventory (student_id, item_id)
     select id, $1
     from students
     where lower(username) = any($2::text[])
        or lower(name) = any($2::text[])
        or lower(id) = any($2::text[])
     on conflict (student_id, item_id) do nothing`,
    [CHAMPION_SKIN_ID, championAccountKeys]
  )

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

  // ── Self-healing: re-grant mission reward items that were skipped ──────────
  // Earlier versions of claimMissionReward silently skipped the inventory
  // insert when the shop item wasn't seeded yet, but still set reward_claimed_at.
  // This migration finds affected rows and grants the missing items now.
  // Hardcoded to avoid a circular import (event-missions.js imports pool).
  const missionRewards = [
    { missionId: 'kemerdekaan_1', itemId: 'bingkai_kemerdekaan' },
    { missionId: 'kemerdekaan_2', itemId: 'spanduk_kemerdekaan' },
    { missionId: 'kemerdekaan_3', itemId: 'pet_kelinsay_merahputih' },
  ]
  for (const { missionId, itemId } of missionRewards) {
    const { rowCount } = await pool.query(`
      insert into student_inventory (student_id, item_id)
      select emp.student_id, $1
      from event_mission_progress emp
      where emp.mission_id = $2
        and emp.reward_claimed_at is not null
        and not exists (
          select 1 from student_inventory si
          where si.student_id = emp.student_id and si.item_id = $1
        )
      on conflict (student_id, item_id) do nothing
    `, [itemId, missionId])
    if (rowCount > 0) console.log(`[schema] mission reward repair: granted ${itemId} to ${rowCount} student(s)`)
  }

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
    // Hafalan badges — awarded by guru after setoran
    ['hafalan_kali_1',  'Hafal Perkalian 1',  'Lulus setoran hafalan perkalian 1',  '✖️', '#FBBF24', 101],
    ['hafalan_kali_2',  'Hafal Perkalian 2',  'Lulus setoran hafalan perkalian 2',  '✖️', '#FBBF24', 102],
    ['hafalan_kali_3',  'Hafal Perkalian 3',  'Lulus setoran hafalan perkalian 3',  '✖️', '#FBBF24', 103],
    ['hafalan_kali_4',  'Hafal Perkalian 4',  'Lulus setoran hafalan perkalian 4',  '✖️', '#FBBF24', 104],
    ['hafalan_kali_5',  'Hafal Perkalian 5',  'Lulus setoran hafalan perkalian 5',  '✖️', '#FBBF24', 105],
    ['hafalan_kali_6',  'Hafal Perkalian 6',  'Lulus setoran hafalan perkalian 6',  '✖️', '#FBBF24', 106],
    ['hafalan_kali_7',  'Hafal Perkalian 7',  'Lulus setoran hafalan perkalian 7',  '✖️', '#FBBF24', 107],
    ['hafalan_kali_8',  'Hafal Perkalian 8',  'Lulus setoran hafalan perkalian 8',  '✖️', '#FBBF24', 108],
    ['hafalan_kali_9',  'Hafal Perkalian 9',  'Lulus setoran hafalan perkalian 9',  '✖️', '#FBBF24', 109],
    ['hafalan_kali_10', 'Hafal Perkalian 10', 'Lulus setoran hafalan perkalian 10', '✖️', '#FBBF24', 110],
    ['hafalan_bagi_1',  'Hafal Pembagian 1',  'Lulus setoran hafalan pembagian 1',  '➗', '#60A5FA', 111],
    ['hafalan_bagi_2',  'Hafal Pembagian 2',  'Lulus setoran hafalan pembagian 2',  '➗', '#60A5FA', 112],
    ['hafalan_bagi_3',  'Hafal Pembagian 3',  'Lulus setoran hafalan pembagian 3',  '➗', '#60A5FA', 113],
    ['hafalan_bagi_4',  'Hafal Pembagian 4',  'Lulus setoran hafalan pembagian 4',  '➗', '#60A5FA', 114],
    ['hafalan_bagi_5',  'Hafal Pembagian 5',  'Lulus setoran hafalan pembagian 5',  '➗', '#60A5FA', 115],
    ['hafalan_bagi_6',  'Hafal Pembagian 6',  'Lulus setoran hafalan pembagian 6',  '➗', '#60A5FA', 116],
    ['hafalan_bagi_7',  'Hafal Pembagian 7',  'Lulus setoran hafalan pembagian 7',  '➗', '#60A5FA', 117],
    ['hafalan_bagi_8',  'Hafal Pembagian 8',  'Lulus setoran hafalan pembagian 8',  '➗', '#60A5FA', 118],
    ['hafalan_bagi_9',  'Hafal Pembagian 9',  'Lulus setoran hafalan pembagian 9',  '➗', '#60A5FA', 119],
    ['hafalan_bagi_10', 'Hafal Pembagian 10', 'Lulus setoran hafalan pembagian 10', '➗', '#60A5FA', 120],
  ]
  for (const [id, nama, deskripsi, icon, color, sortOrder] of badgeDefs) {
    await pool.query(
      `insert into badges (id, nama, deskripsi, icon, color, sort_order)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (id) do update set nama=$2, deskripsi=$3, icon=$4, color=$5, sort_order=$6`,
      [id, nama, deskripsi, icon, color, sortOrder]
    )
  }

  // ── GuruEOB5 Tables ──────────────────────────────────────────────────────────
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_soal_otomatis (
      id         SERIAL PRIMARY KEY,
      guru_id    text REFERENCES gurus(id),
      topik      VARCHAR(255),
      soal_json  JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  // inbox — dihapus (tabel baru SMARTISA, 0 data lama)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tujuan_pembelajaran (
      id             SERIAL PRIMARY KEY,
      teacher_id     text REFERENCES gurus(id),
      mata_pelajaran VARCHAR(100) NOT NULL,
      kelas          VARCHAR(50),
      description    TEXT NOT NULL,
      kode_tp        VARCHAR(50),
      created_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  // feedback_siswa — dihapus (tabel baru SMARTISA, 0 data lama)

  // ── GuruEOB5 Tables (Bagian 3 — router baru) ─────────────────────────────────

  // Kolom tambahan gurus
  await pool.query(`ALTER TABLE gurus ADD COLUMN IF NOT EXISTS school text`)
  await pool.query(`ALTER TABLE gurus ADD COLUMN IF NOT EXISTS mapel text[] NOT NULL DEFAULT '{}'`)

  // Mata pelajaran per guru (soft-delete)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subjects (
      id         SERIAL PRIMARY KEY,
      teacher_id text NOT NULL REFERENCES gurus(id) ON DELETE CASCADE,
      name       VARCHAR(255) NOT NULL,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (teacher_id, name)
    )
  `)

  // Jurnal mengajar
  await pool.query(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id              SERIAL PRIMARY KEY,
      teacher_id      text NOT NULL REFERENCES gurus(id) ON DELETE CASCADE,
      subject_id      int  REFERENCES subjects(id) ON DELETE SET NULL,
      tanggal         DATE NOT NULL,
      kelas           VARCHAR(50) NOT NULL,
      materi          TEXT NOT NULL,
      kd              TEXT,
      jp              NUMERIC(4,1),
      catatan         TEXT,
      prosem_item_id  int,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='journal_entries' AND column_name='teacher_id'
      ) THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='journal_guru_tanggal') THEN
          EXECUTE 'CREATE INDEX journal_guru_tanggal ON journal_entries (teacher_id, tanggal)';
        END IF;
      ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='journal_entries' AND column_name='guru_id'
      ) THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='journal_guru_tanggal') THEN
          EXECUTE 'CREATE INDEX journal_guru_tanggal ON journal_entries (guru_id, tanggal)';
        END IF;
      END IF;
    END $$
  `)

  // Nilai siswa (formatif / sumatif_lm / sumatif_tengah / sumatif_akhir)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS grades (
      id              SERIAL PRIMARY KEY,
      student_id      text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      guru_id         text REFERENCES gurus(id),
      subject_id      int  REFERENCES subjects(id) ON DELETE SET NULL,
      calendar_id     int,
      jenis           VARCHAR(30) NOT NULL DEFAULT 'formatif'
                        CHECK (jenis IN ('formatif','sumatif_lm','sumatif_tengah','sumatif_akhir')),
      lingkup_materi  INT,
      nilai           NUMERIC(5,2),
      keterangan      TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // Poin perilaku siswa: rename student_points → point_records (idempotent)
  await pool.query(`ALTER TABLE IF EXISTS student_points RENAME TO point_records`).catch(() => {})
  await pool.query(`
    CREATE TABLE IF NOT EXISTS point_records (
      id         SERIAL PRIMARY KEY,
      student_id text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      guru_id    text REFERENCES gurus(id),
      jenis      VARCHAR(20) NOT NULL DEFAULT 'positif',
      poin       INT NOT NULL DEFAULT 1,
      keterangan TEXT,
      tanggal    DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // Kalender akademik
  await pool.query(`
    CREATE TABLE IF NOT EXISTS academic_calendars (
      id           SERIAL PRIMARY KEY,
      created_by   text NOT NULL REFERENCES gurus(id) ON DELETE CASCADE,
      nama         VARCHAR(255) NOT NULL,
      tahun_ajaran VARCHAR(20) NOT NULL,
      semester     INT NOT NULL DEFAULT 1,
      is_shared    BOOLEAN NOT NULL DEFAULT FALSE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // Pekan efektif per kalender
  await pool.query(`
    CREATE TABLE IF NOT EXISTS academic_weeks (
      id               SERIAL PRIMARY KEY,
      calendar_id      int NOT NULL REFERENCES academic_calendars(id) ON DELETE CASCADE,
      pekan_ke         INT NOT NULL,
      tanggal_mulai    DATE NOT NULL,
      tanggal_selesai  DATE NOT NULL,
      jenis            VARCHAR(30) NOT NULL DEFAULT 'efektif',
      UNIQUE (calendar_id, pekan_ke)
    )
  `)

  // Item-item prosem (materi per pekan)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS prosem_items (
      id         SERIAL PRIMARY KEY,
      prosem_id  int NOT NULL REFERENCES prosem(id) ON DELETE CASCADE,
      subject_id int REFERENCES subjects(id) ON DELETE SET NULL,
      kelas      VARCHAR(50),
      materi     TEXT NOT NULL,
      kd         TEXT,
      jp         NUMERIC(4,1),
      urutan     INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // Kolom tambahan tujuan_pembelajaran untuk mendukung fitur baru
  // Gunakan DO block — di production subjects.id mungkin UUID, di dev SERIAL/integer
  await pool.query(`
    DO $$
    DECLARE subj_type text;
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='tujuan_pembelajaran' AND column_name='subject_id'
      ) THEN
        SELECT data_type INTO subj_type
          FROM information_schema.columns
         WHERE table_name='subjects' AND column_name='id';
        IF subj_type = 'uuid' THEN
          EXECUTE 'ALTER TABLE tujuan_pembelajaran ADD COLUMN subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL';
        ELSE
          EXECUTE 'ALTER TABLE tujuan_pembelajaran ADD COLUMN subject_id INT REFERENCES subjects(id) ON DELETE SET NULL';
        END IF;
      END IF;
    END $$
  `)
  await pool.query(`ALTER TABLE tujuan_pembelajaran ADD COLUMN IF NOT EXISTS calendar_id int`)
  await pool.query(`ALTER TABLE tujuan_pembelajaran ADD COLUMN IF NOT EXISTS lingkup_materi INT`)
  await pool.query(`ALTER TABLE tujuan_pembelajaran ADD COLUMN IF NOT EXISTS tp_number INT`)

  // Dokumen per mata pelajaran (base64 di DB)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id          SERIAL PRIMARY KEY,
      subject_id  int NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      name        VARCHAR(255) NOT NULL,
      description TEXT,
      file_name   VARCHAR(255),
      file_type   VARCHAR(100),
      file_size   INT,
      file_data   TEXT,
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // Modul ajar yang di-generate oleh AI
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_modul_ajar (
      id            SERIAL PRIMARY KEY,
      guru_id       text NOT NULL REFERENCES gurus(id) ON DELETE CASCADE,
      subject_id    int REFERENCES subjects(id) ON DELETE SET NULL,
      materi        TEXT NOT NULL,
      alokasi_waktu VARCHAR(50) NOT NULL,
      kelas         VARCHAR(50),
      content       JSONB,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // Akun login siswa yang di-generate wali kelas
  // Kolom: username (BUKAN eob5_username), password (BUKAN password_plain)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS student_accounts (
      id              SERIAL PRIMARY KEY,
      student_id      text NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
      username        VARCHAR(100) NOT NULL UNIQUE,
      password        VARCHAR(100) NOT NULL,
      created_by      text REFERENCES gurus(id),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  // Migrasi: rename kolom lama jika tabel sudah ada dengan nama kolom lama
  await pool.query(`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='student_accounts' AND column_name='eob5_username'
      ) THEN
        ALTER TABLE student_accounts RENAME COLUMN eob5_username TO username;
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='student_accounts' AND column_name='password_plain'
      ) THEN
        ALTER TABLE student_accounts RENAME COLUMN password_plain TO password;
      END IF;
    END $$
  `)

  // Bahan ajar (PDF base64 atau link URL)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bahan_ajar (
      id              SERIAL PRIMARY KEY,
      judul           VARCHAR(255) NOT NULL,
      mata_pelajaran  VARCHAR(100),
      kelas           VARCHAR(50),
      deskripsi       TEXT,
      file_name       VARCHAR(255),
      file_type       VARCHAR(100),
      file_size       INT,
      file_data       TEXT,
      link_url        TEXT,
      created_by      text REFERENCES gurus(id),
      created_by_name VARCHAR(255),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // Video materi TOMAT — link YouTube per kelas, mapel, dan BAB.
  // Dipisah dari tabel GURU/BLP agar data TOMAT tidak mengubah modul eksternal.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tomat_video_materi (
      id               SERIAL PRIMARY KEY,
      guru_id          text NOT NULL REFERENCES gurus(id) ON DELETE CASCADE,
      kelas            VARCHAR(50) NOT NULL,
      grade            INT NOT NULL CHECK (grade IN (7, 8, 9)),
      subject          VARCHAR(20) NOT NULL CHECK (subject IN ('matematika', 'ipa')),
      bab              VARCHAR(10) NOT NULL,
      title            VARCHAR(255) NOT NULL,
      description      TEXT,
      youtube_url      TEXT NOT NULL,
      youtube_video_id VARCHAR(11) NOT NULL,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS tomat_video_materi_siswa_idx
      ON tomat_video_materi (kelas, grade, subject, bab, created_at DESC)
  `)

  // Feedback guru ke pengembang aplikasi
  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id                SERIAL PRIMARY KEY,
      guru_id           text NOT NULL REFERENCES gurus(id) ON DELETE CASCADE,
      guru_name         VARCHAR(255),
      kategori          VARCHAR(20) NOT NULL CHECK (kategori IN ('saran','kritik','bug')),
      pesan             TEXT NOT NULL,
      screenshot_base64 TEXT,
      page_url          VARCHAR(500),
      is_read           BOOLEAN NOT NULL DEFAULT FALSE,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // ── Kolom tambahan di tabel LAMA (tanpa prefix) untuk modul GURU ─────────────
  // Tabel-tabel lama ini dipakai oleh standalone GuruEOB5 app dan sudah berisi data.
  // Kolom baru ditambahkan agar modul GURU di SMARTISA bisa menggunakannya.

  // grades: tambah guru_id + keterangan
  await pool.query(`ALTER TABLE grades ADD COLUMN IF NOT EXISTS guru_id text`)
  await pool.query(`ALTER TABLE grades ADD COLUMN IF NOT EXISTS keterangan text`)

  // journal_entries: tambah kd + jp
  await pool.query(`ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS kd text`)
  await pool.query(`ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS jp NUMERIC(4,1)`)

  // tujuan_pembelajaran: tambah mata_pelajaran, kelas, kode_tp
  await pool.query(`ALTER TABLE tujuan_pembelajaran ADD COLUMN IF NOT EXISTS mata_pelajaran text`)
  await pool.query(`ALTER TABLE tujuan_pembelajaran ADD COLUMN IF NOT EXISTS kelas text`)
  await pool.query(`ALTER TABLE tujuan_pembelajaran ADD COLUMN IF NOT EXISTS kode_tp text`)

  // academic_calendars: tambah nama + is_shared
  await pool.query(`ALTER TABLE academic_calendars ADD COLUMN IF NOT EXISTS nama text`)
  await pool.query(`ALTER TABLE academic_calendars ADD COLUMN IF NOT EXISTS is_shared boolean NOT NULL DEFAULT false`)

  // prosem: tambah mata_pelajaran, semester, tahun_ajaran, konten
  await pool.query(`ALTER TABLE prosem ADD COLUMN IF NOT EXISTS mata_pelajaran text`)
  await pool.query(`ALTER TABLE prosem ADD COLUMN IF NOT EXISTS semester text`)
  await pool.query(`ALTER TABLE prosem ADD COLUMN IF NOT EXISTS tahun_ajaran text`)
  await pool.query(`ALTER TABLE prosem ADD COLUMN IF NOT EXISTS konten jsonb`)

  // prosem: tambah subject_id dan calendar_id untuk linkage relasional
  await pool.query(`
    DO $$
    DECLARE subj_type text;
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='prosem' AND column_name='subject_id'
      ) THEN
        SELECT data_type INTO subj_type
          FROM information_schema.columns
         WHERE table_name='subjects' AND column_name='id';
        IF subj_type = 'uuid' THEN
          EXECUTE 'ALTER TABLE prosem ADD COLUMN subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL';
        ELSE
          EXECUTE 'ALTER TABLE prosem ADD COLUMN subject_id INT REFERENCES subjects(id) ON DELETE SET NULL';
        END IF;
      END IF;
    END $$
  `)
  await pool.query(`ALTER TABLE prosem ADD COLUMN IF NOT EXISTS calendar_id int REFERENCES academic_calendars(id) ON DELETE SET NULL`)

  // prosem_items: tambah subject_id, kelas, urutan (tabel lama hanya punya week_id, kd, materi, jp, catatan)
  // Gunakan DO block — di production subjects.id mungkin UUID, di dev SERIAL/integer
  await pool.query(`
    DO $$
    DECLARE subj_type text;
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='prosem_items' AND column_name='subject_id'
      ) THEN
        SELECT data_type INTO subj_type
          FROM information_schema.columns
         WHERE table_name='subjects' AND column_name='id';
        IF subj_type = 'uuid' THEN
          EXECUTE 'ALTER TABLE prosem_items ADD COLUMN subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL';
        ELSE
          EXECUTE 'ALTER TABLE prosem_items ADD COLUMN subject_id INT REFERENCES subjects(id) ON DELETE SET NULL';
        END IF;
      END IF;
    END $$
  `)
  await pool.query(`ALTER TABLE prosem_items ADD COLUMN IF NOT EXISTS kelas VARCHAR(50)`)
  await pool.query(`ALTER TABLE prosem_items ADD COLUMN IF NOT EXISTS urutan INT NOT NULL DEFAULT 0`)

  // ai_modul_ajar: tambah kelas
  await pool.query(`ALTER TABLE ai_modul_ajar ADD COLUMN IF NOT EXISTS kelas text`)

  // ai_soal_otomatis: tambah topik
  await pool.query(`ALTER TABLE ai_soal_otomatis ADD COLUMN IF NOT EXISTS topik text`)

  // student_accounts: tambah created_by; pastikan ada UNIQUE pada student_id
  await pool.query(`ALTER TABLE student_accounts ADD COLUMN IF NOT EXISTS created_by text`)
  await pool.query(`
    DO $$ BEGIN
      ALTER TABLE student_accounts ADD CONSTRAINT student_accounts_student_id_unique UNIQUE (student_id);
    EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL;
    END $$
  `)

  // ── BLP Harian Tables ────────────────────────────────────────────────────────
  // Tabel-tabel ini sudah ada di Neon (dipakai BLP app yang berjalan terpisah).
  // CREATE TABLE IF NOT EXISTS memastikan idempoten — tidak merusak data yang ada.

  // Kolom tambahan di tabel shared students (BLP-specific fields)
  await pool.query(`
    ALTER TABLE students ADD COLUMN IF NOT EXISTS jenis_kelamin text
      CHECK (jenis_kelamin IN ('L', 'P'))
  `)
  await pool.query(`
    ALTER TABLE students ADD COLUMN IF NOT EXISTS quran_bookmark jsonb
  `)

  // Checklist harian BLP per siswa per tanggal
  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_records (
      student_id          text        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      record_date         date        NOT NULL,
      completed_activities text[]     NOT NULL DEFAULT '{}',
      score               integer,
      submissions         jsonb       NOT NULL DEFAULT '{}',
      updated_at          timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (student_id, record_date)
    )
  `)

  // Rentang hari aktif BLP per kelas per bulan (diatur guru wali kelas)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS blp_periods (
      kelas      text        NOT NULL,
      year       integer     NOT NULL,
      month      integer     NOT NULL,
      start_day  integer     NOT NULL,
      end_day    integer     NOT NULL,
      updated_by text,
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (kelas, year, month)
    )
  `)

  // Pelacakan periode haid untuk siswa perempuan
  await pool.query(`
    CREATE TABLE IF NOT EXISTS haid_periods (
      id         serial      PRIMARY KEY,
      student_id text        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      start_date date        NOT NULL,
      end_date   date,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `)

  // Index untuk performa query daily_records per siswa per tanggal
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_daily_records_student_date
      ON daily_records (student_id, record_date)
  `)

  // Index pada students(kelas) — dipakai oleh BLP dashboard (ILIKE filter per wali kelas)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_students_kelas
      ON students (kelas)
  `)

  // ── Migrasi ID aktivitas BLP ke ID kanonik GitHub ─────────────────────────
  // Idempoten: hanya update baris yang masih mengandung ID lama.
  // completed_activities bertipe text[] bukan jsonb — gunakan unnest/ARRAY.
  await pool.query(`
    UPDATE daily_records
    SET completed_activities = ARRAY(
      SELECT DISTINCT mapped
      FROM (
        SELECT
          CASE
            WHEN id = 'd_shalat5waktu' THEN 'd1'
            WHEN id = 'd_dzikir_bada'  THEN 'd2'
            WHEN id = 'd_sholawat'     THEN 'd3'
            WHEN id = 'd_dhuha'        THEN 'd4'
            WHEN id = 'd_baca_quran'   THEN 'd5'
            WHEN id = 'd_rawatib'      THEN 'd6'
            WHEN id = 'd_infaq'        THEN 'd7'
            WHEN id = 'd_doa_ortu'     THEN 'd8'
            WHEN id = 'r_tepat_waktu'    THEN 'r1'
            WHEN id = 'r_tanggung_jawab' THEN 'r2'
            WHEN id = 'r_tahajud'        THEN 'r3'
            WHEN id = 'r_olahraga'       THEN 'r4'
            WHEN id = 'rs_belajar'          THEN 'rs1'
            WHEN id = 'rs_hafal_quran'      THEN 'rs2'
            WHEN id = 'rs_internet_positif' THEN 'rs3'
            WHEN id = 'rs_hafal_hadits'     THEN 'rs4'
            WHEN id = 'rf_sholat_taubat' THEN 'rf1'
            WHEN id = 'rf_istighfar'     THEN 'rf2'
            WHEN id = 'rf_evaluasi_diri' THEN 'rf3'
            WHEN id = 'rc_siapkan' THEN 'rp1'
            WHEN id = 'rc_bantu'   THEN 'rp2'
            WHEN id = 'rc_kerja'   THEN 'rp3'
            WHEN id = 'rc_peka'    THEN 'rp4'
            WHEN id IN ('subuh','dzuhur','ashar','maghrib','isya') THEN 'd1'
            WHEN id = 'dhuha'    THEN 'd4'
            WHEN id = 'tahajud'  THEN 'r3'
            WHEN id = 'rawatib'  THEN 'd6'
            WHEN id = 'quran'    THEN 'd5'
            WHEN id IN ('dzikir_p','dzikir_s') THEN 'd2'
            WHEN id = 'hafalan'  THEN 'rs2'
            WHEN id = 'infaq'    THEN 'd7'
            ELSE id
          END AS mapped
        FROM unnest(completed_activities) AS id
      ) sub
    )
    WHERE array_length(completed_activities, 1) > 0
      AND array_to_string(completed_activities, ',') ~ '(d_|r_|rs_|rf_|rc_|subuh|dzuhur|ashar|maghrib|isya|dhuha|tahajud|rawatib|quran|dzikir|hafalan|infaq)'
  `)
  console.log('[schema] BLP activity ID migration complete')

  // ── EOB5 Schema Migrations ────────────────────────────────────────────────

  // 1. grades: DROP dan ADD CHECK constraint harus dua query terpisah (node-postgres)
  await pool.query(`ALTER TABLE grades DROP CONSTRAINT IF EXISTS grades_jenis_check`)
  await pool.query(`
    ALTER TABLE grades ADD CONSTRAINT grades_jenis_check
      CHECK (jenis IN ('formatif','sumatif_lm','sumatif_tengah','sumatif_akhir'))
  `)

  // 2. grades: 4 partial unique index (idempoten — IF NOT EXISTS)
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS grades_formatif_unique
      ON grades (student_id, subject_id, calendar_id, lingkup_materi, tp_number)
      WHERE jenis = 'formatif'
  `).catch(() => {}) // tp_number mungkin belum ada — skip
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS grades_sumatif_lm_unique
      ON grades (student_id, subject_id, calendar_id, lingkup_materi)
      WHERE jenis = 'sumatif_lm'
  `).catch(() => {})
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS grades_sumatif_tengah_unique
      ON grades (student_id, subject_id, calendar_id)
      WHERE jenis = 'sumatif_tengah'
  `).catch(() => {})
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS grades_sumatif_akhir_unique
      ON grades (student_id, subject_id, calendar_id)
      WHERE jenis = 'sumatif_akhir'
  `).catch(() => {})

  // 3. point_records: pastikan kolom guru_id ada (student_points punya, point_records tidak)
  await pool.query(`ALTER TABLE point_records ADD COLUMN IF NOT EXISTS guru_id text`)
  await pool.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'tomat'`)

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
