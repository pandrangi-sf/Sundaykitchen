-- Phase 1 schema. Run this in BOTH your UAT and production Supabase projects.
-- PRIVATE app: every user can read/write ONLY their own rows (RLS below).
-- Never store the service_role key in the client; the anon key + RLS is enough.

-- =========================================================
-- profiles: core onboarding answers (non-health)
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  goal text,
  sex text,
  dob date,
  units text default 'metric',
  height_cm numeric,
  weight_kg numeric,
  target_weight_kg numeric,
  activity text,
  diet text,
  allergies text[] default '{}',
  allergies_other text,
  avoid_foods text,
  cuisines text[] default '{}',
  meals_per_day int default 4,
  training_days int default 4,
  training_place text default 'gym',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================
-- health_profile: health data kept SEPARATE (data minimization)
-- meds_note is stored/flagged but NEVER used in any calculation.
-- =========================================================
create table if not exists public.health_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  health_flags text[] default '{}',
  health_other text,
  meds_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================
-- targets: the computed plan numbers (deterministic engine output)
-- =========================================================
create table if not exists public.targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calories int,
  protein_g int,
  carbs_g int,
  fat_g int,
  water_l numeric,
  meal_split jsonb,
  lever_tags text[] default '{}',
  escalated boolean default false,
  engine jsonb,
  created_at timestamptz default now()
);
create index if not exists targets_user_idx on public.targets(user_id);

-- =========================================================
-- consents: granular, versioned consent log (one row per acceptance)
-- =========================================================
create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_key text not null,   -- terms | privacy | health_processing | not_medical_advice
  version text not null,
  accepted boolean not null default true,
  created_at timestamptz default now()
);
create index if not exists consents_user_idx on public.consents(user_id);

-- =========================================================
-- Row Level Security: each user sees ONLY their own rows.
-- =========================================================
alter table public.profiles       enable row level security;
alter table public.health_profile enable row level security;
alter table public.targets        enable row level security;
alter table public.consents       enable row level security;

-- profiles (id == auth.uid())
create policy own_p_sel on public.profiles for select using (auth.uid() = id);
create policy own_p_ins on public.profiles for insert with check (auth.uid() = id);
create policy own_p_upd on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- health_profile (user_id == auth.uid())
create policy own_h_all on public.health_profile for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- targets
create policy own_t_all on public.targets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- consents
create policy own_c_all on public.consents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
