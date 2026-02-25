# Covalent API Benchmark Dashboard

Benchmark and compare blockchain data API providers (Covalent GoldRush, Alchemy, Moralis, Mobula) across speed, uptime, throughput, pricing accuracy, and NFT coverage.

## Run Locally

### 1. Prerequisites

- Node.js 18 or later
- [npm](https://www.npmjs.com/) (or yarn, pnpm, bun)

### 2. Clone and install

```bash
git clone <repository-url>
cd covalent-dashboard
npm install
```

### 3. Get API keys

You need at least one provider API key to run benchmarks:

| Provider | URL                                                |
| -------- | -------------------------------------------------- |
| Covalent | https://www.covalenthq.com/platform/auth/register/ |
| Alchemy  | https://dashboard.alchemy.com/                     |
| Moralis  | https://admin.moralis.io/register                  |
| Mobula   | https://mobula.io/                                 |

### 4. Configure environment

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your keys. At minimum, set one provider:

```env
# At least one required
COVALENT_API_KEY=your_key_here
ALCHEMY_API_KEY=
MORALIS_API_KEY=
MOBULA_API_KEY=

# Optional: for history and trends
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Optional: for scheduled runs
CRON_SECRET=
```

Keys in `.env.local` are used server-side only and are not exposed to the browser.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Run a benchmark

1. Go to **Run Benchmark**
2. Choose scenarios (Token Balances, Pricing Accuracy, NFT Balances)
3. Optionally change the wallet address and network
4. Click **Run Benchmark**
5. View results in the tabs

## Scheduled runs (cron)

For better accuracy, benchmarks can run automatically every 30 minutes via a cron job. This keeps data fresh and surfaces trends over time. Configure `CRON_SECRET` in your environment and trigger the `/api/cron` endpoint (e.g. with GitHub Actions or cron-job.org). See `.github/workflows/scheduled-benchmark.yml` for an example.

## Optional: History and persistence

To persist benchmark runs and view history:

1. Create a [Supabase](https://supabase.com) project
2. Run the SQL in `supabase-schema.sql` in the Supabase SQL Editor
3. Add to `.env.local`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   ```

## Build for production

```bash
npm run build
npm run start
```

## License

MIT
