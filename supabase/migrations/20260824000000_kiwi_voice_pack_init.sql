-- Kiwi Voice Pack MVP tables. Prefixed "kiwi_" to stay clearly separate from
-- the Research Agents project's existing interview-chatbot tables/data.

create table if not exists kiwi_testers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  framing text not null check (framing in ('real_estate', 'small_business', 'tradie', 'general')),
  consent_given_at timestamptz,
  retention_answer text check (retention_answer in ('not_at_all', 'a_little', 'quite_a_bit', 'would_be_annoyed')),
  created_at timestamptz not null default now()
);

create table if not exists kiwi_messages (
  id uuid primary key default gen_random_uuid(),
  tester_id uuid not null references kiwi_testers(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists kiwi_messages_tester_id_idx on kiwi_messages(tester_id);

alter table kiwi_testers enable row level security;
alter table kiwi_messages enable row level security;

-- No public policies: all access goes through the edge function using the
-- service role key server-side. Testers never talk to the DB directly.
