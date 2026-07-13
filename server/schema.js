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
}
