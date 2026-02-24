create table benchmark_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  chain text not null default 'eth-mainnet',
  wallet_address text not null,
  iterations int not null default 5,
  concurrency int not null default 3,
  trigger_type text not null default 'manual' check (trigger_type in ('manual', 'scheduled')),
  status text not null default 'running' check (status in ('running', 'completed', 'error'))
);

create table benchmark_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references benchmark_runs(id) on delete cascade,
  provider text not null,
  display_name text not null,
  color text not null,
  latency_avg float,
  latency_min float,
  latency_max float,
  latency_p95 float,
  completeness_score float,
  completeness_fields_total int,
  completeness_fields_present int,
  completeness_tokens_returned int,
  reliability_success_rate float,
  reliability_total int,
  reliability_successful int,
  reliability_failed int,
  throughput_rps float,
  throughput_concurrent int,
  throughput_completed int,
  throughput_window_ms float,
  errors text[] default '{}',
  raw_json jsonb
);

create index idx_benchmark_results_run on benchmark_results(run_id);

create table pricing_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  chain text not null default 'eth-mainnet',
  trigger_type text not null default 'manual' check (trigger_type in ('manual', 'scheduled')),
  status text not null default 'running' check (status in ('running', 'completed', 'error'))
);

create table pricing_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references pricing_runs(id) on delete cascade,
  provider text not null,
  display_name text not null,
  color text not null,
  coverage_pct float,
  avg_deviation float,
  max_deviation float,
  latency_ms float,
  category_breakdown jsonb,
  token_results jsonb
);

create index idx_pricing_results_run on pricing_results(run_id);

-- Enable Row Level Security (open for now — tighten later with auth)
alter table benchmark_runs enable row level security;
alter table benchmark_results enable row level security;
alter table pricing_runs enable row level security;
alter table pricing_results enable row level security;
-- Allow all operations via anon key (internal tool, no auth yet)
create policy "Allow all" on benchmark_runs for all using (true) with check (true);
create policy "Allow all" on benchmark_results for all using (true) with check (true);
create policy "Allow all" on pricing_runs for all using (true) with check (true);
create policy "Allow all" on pricing_results for all using (true) with check (true);
