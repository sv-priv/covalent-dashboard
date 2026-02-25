# Covalent API Benchmark Dashboard

Benchmark and compare blockchain data API providers (Covalent GoldRush, Alchemy, Moralis, Mobula) across speed, data completeness, uptime, throughput, and pricing accuracy.

> **Note:** This is a basic version of the project. It runs as a single-page app with Token Balances and Pricing Accuracy benchmarks only. History is stored in the browser. For the full version with NFT benchmarks, database persistence, scheduled runs, and multi-page layout, see the `with-database` branch.

## Run Locally

### 1. Prerequisites

- Node.js 18 or later
- npm (or yarn, pnpm, bun)

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

Copy `.env.example` to `.env.local` and add your keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in at least one provider key. Leave others blank if you don't have them:

```env
COVALENT_API_KEY=your_key_here
ALCHEMY_API_KEY=
MORALIS_API_KEY=
MOBULA_API_KEY=
```

Keys in `.env.local` are used server-side only and are not exposed to the browser.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Run a benchmark

1. Click **API Keys** to add or verify your keys
2. Choose scenarios: **Token Balances** and/or **Pricing Accuracy**
3. Set wallet address (default: Vitalik's), network, iterations, and concurrency
4. Click **Run Benchmark**
5. View results in the tabs (Overview, Speed, Completeness, Uptime, Capacity, Pricing)

Recent runs are stored in the browser (localStorage) and shown in the history section.

## Build for production

```bash
npm run build
npm run start
```

## License

MIT
