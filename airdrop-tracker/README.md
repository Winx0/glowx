# GlowX Airdrop Tracker

Cek airdrop & token yang belum di-claim di semua jaringan blockchain.

## Fitur

- **Multi-Chain Support** - Ethereum, Arbitrum, Optimism, Base, Polygon, BSC, Avalanche, zkSync, Linea, Scroll, Solana, SUI, Aptos, Cosmos, Starknet
- **Auto-Detect Address** - Otomatis mendeteksi tipe wallet (EVM, Solana, SUI, Aptos, Cosmos)
- **Real-time Check** - Cek eligibility airdrop secara real-time
- **Drops.bot Integration** - Integrasi dengan Drops.bot API untuk data airdrop terlengkap
- **Responsive UI** - Tampilan modern yang mobile-friendly

## Tech Stack

- React + Vite
- TailwindCSS v4
- Drops.bot API

## Getting Started

```bash
cd airdrop-tracker
npm install
npm run dev
```

## API Key (Optional)

Untuk hasil yang lebih lengkap, tambahkan API key dari [Drops.bot](https://drops.bot/airdrops-api):

1. Buka app di browser
2. Buka Console → `localStorage.setItem('drops_api_key', 'YOUR_KEY')`
3. Refresh halaman

## Supported Chains

| Chain | Type | Status |
|-------|------|--------|
| Ethereum | EVM | ✅ |
| Arbitrum | EVM L2 | ✅ |
| Optimism | EVM L2 | ✅ |
| Base | EVM L2 | ✅ |
| Polygon | EVM | ✅ |
| BSC | EVM | ✅ |
| Avalanche | EVM | ✅ |
| zkSync | EVM L2 | ✅ |
| Linea | EVM L2 | ✅ |
| Scroll | EVM L2 | ✅ |
| Solana | Non-EVM | ✅ |
| SUI | Non-EVM | ✅ |
| Aptos | Non-EVM | ✅ |
| Cosmos | Non-EVM | ✅ |
| Starknet | Non-EVM | ✅ |
