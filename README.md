<p align="center">
  <img src="frontend/img/ReactiveGuard.png" alt="ReactiveGuard" width="120" />
</p>

<h1 align="center">ReactiveGuard</h1>

<p align="center">
  <strong>On-Chain Liquidation Guardian · Powered by Somnia Reactivity</strong>
</p>

<p align="center">
  <a href="https://reactiveguard.vercel.app">
    <img src="https://img.shields.io/badge/Live_Demo-reactiveguard.vercel.app-8b5cf6?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Somnia-Testnet-6366f1?style=flat-square" alt="Somnia" />
  <img src="https://img.shields.io/badge/Solidity-0.8.20-363636?style=flat-square&logo=solidity" alt="Solidity" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT" />
</p>

<p align="center">
  <em>Sub-second detection · 100% on-chain · Zero polling</em>
</p>

---

## The Problem

> Every year, DeFi users lose **$100M+** to preventable liquidations because off-chain monitoring bots poll every 3–15 seconds — creating a fatal delay window.

ReactiveGuard eliminates that window entirely using **Somnia's native sub-second reactivity**.

| | Traditional Bots | ReactiveGuard |
|---|---|---|
| **Detection** | 3–15s polling | **< 1s** reactive push |
| **Architecture** | Centralized indexers | **100% on-chain** |
| **Trust Model** | Trust the bot operator | **Trustless**, verified on-chain |
| **Missed Events** | Possible under load | **Zero** — protocol-native |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SOMNIA TESTNET                          │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ MockPrice    │───▶│ Simple       │───▶│ Reactive     │  │
│  │ Oracle       │    │ Lending      │    │ Guardian     │  │
│  │              │    │              │    │              │  │
│  │ ETH/USD Feed │    │ Health Factor│    │ Event Emit   │  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘  │
│                                                  │          │
│                              ┌────────────────┐  │          │
│                              │ Guardian       │  │          │
│                              │ Automation     │  │          │
│                              │ (Auto Rescue)  │  │          │
│                              └────────────────┘  │          │
└──────────────────────────────────────────────────┼──────────┘
                                                   │
                          Somnia Reactivity (<1s)   │
                                                   ▼
                                    ┌──────────────────────┐
                                    │   Subscriber         │
                                    │   @somnia-chain/     │
                                    │   reactivity SDK     │
                                    └──────────┬───────────┘
                                               │ Socket.io
                                               ▼
                                    ┌──────────────────────┐
                                    │   Frontend           │
                                    │   Next.js Dashboard  │
                                    │   Real-time Alerts   │
                                    └──────────────────────┘
```

---

## Smart Contracts

> All contracts deployed and verified on **Somnia Testnet** (Chain ID: 50312)

| Contract | Address | Role |
|----------|---------|------|
| **MockPriceOracle** | [`0xa644...58eb`](https://shannon-explorer.somnia.network/address/0xa6446C060e93A91b00dA94135d784704F27558eb) | ETH/USD price feed for demo |
| **SimpleLending** | [`0xa3c7...4160`](https://shannon-explorer.somnia.network/address/0xa3c740c8F64eB59c21743792c10aA7E6e1734160) | Deposit ETH, borrow RUSD, health factor |
| **ReactiveGuardian** | [`0x4F74...7AD2`](https://shannon-explorer.somnia.network/address/0x4F74fE087c53b7db2e01C5Ce4491A037D8007AD2) | Health monitoring + reactive events |
| **GuardianAutomation** | [`0xf5ed...e813`](https://shannon-explorer.somnia.network/address/0xf5eded7E428FF0b74BDE1E2Af848816CfA15e813) | Auto top-up when position is in danger |

---

## How Reactivity Works

ReactiveGuard harnesses Somnia's **protocol-native reactivity** — events propagate at the consensus layer, not through external indexers.

### Step 1 — Price Oracle Updates
ETH/USD price changes on-chain via `MockPriceOracle`. In production, this connects to Chainlink or any price feed.

### Step 2 — Health Factor Recalculates
```
Health Factor = (Collateral Value × 0.80) / Total Borrowed

HF > 1.25     →  SAFE
1.05 < HF ≤ 1.25  →  WARNING   → emits HealthFactorAlert
HF ≤ 1.05     →  CRITICAL  → emits LiquidationImminent
HF < 1.00     →  LIQUIDATABLE
```

### Step 3 — Reactive Event Emission

```solidity
// ReactiveGuardian.sol — Events that Somnia Reactivity watches
event HealthFactorAlert(
    address indexed user,
    uint256 healthFactor,
    uint256 collateralValue,
    uint256 borrowedAmount,
    uint256 timestamp
);

event LiquidationImminent(
    address indexed user,
    uint256 healthFactor,
    uint256 collateralValue,
    uint256 borrowedAmount,
    uint256 requiredTopUp,
    uint256 timestamp
);
```

### Step 4 — Subscriber Receives via SDK

```typescript
import { SDK, SubscriptionCallback } from '@somnia-chain/reactivity';

const sdk = new SDK({ public: publicClient });

await sdk.subscribe({
  eventContractSources: [GUARDIAN_ADDRESS],
  ethCalls: [],
  onData: (data: SubscriptionCallback) => {
    // Arrives < 1 second after on-chain emission
    const alert = decodeEvent(data.result.topics, data.result.data);
    broadcastAlert(alert); // → Socket.io → Frontend
  },
});
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Sub-Second Alerts** | Somnia Reactivity propagates events < 1s — no polling, no delays |
| **Fully On-Chain** | All logic in smart contracts. No indexers, no centralized servers |
| **One-Click Rescue** | Add collateral or repay debt instantly from the dashboard |
| **Auto Top-Up** | Pre-fund a rescue wallet, `GuardianAutomation` saves you automatically |
| **Live Health Gauge** | Canvas-based animated gauge with color-coded danger zones |
| **Event Timeline** | Full history of reactive events — warnings, alerts, and recoveries |
| **Demo Mode** | Built-in simulation, no wallet or testnet tokens needed |

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask (for Somnia Testnet)
- STT tokens from [Somnia Faucet](https://testnet.somnia.network/)

### Setup

```bash
# Clone
git clone https://github.com/RustyRustacle/ReactiveGuard.git
cd ReactiveGuard

# Install all dependencies
npm install                           # Root (contracts)
cd subscriber && npm install && cd .. # Subscriber
cd frontend && npm install && cd ..   # Frontend

# Configure
cp .env.example .env
# Edit .env with your private key
```

### Deploy

```bash
# Compile contracts
npx hardhat compile

# Deploy to Somnia Testnet
npx hardhat run scripts/deploy.ts --network somniaTestnet

# Copy printed addresses into .env
```

### Run

```bash
# Terminal 1 — Subscriber
cd subscriber && npm start

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Landing page  
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) → Dashboard

### Simulate Price Drop

```bash
# From project root — triggers reactive events
npx hardhat run scripts/update-price.ts --network somniaTestnet
```

---

## Demo Mode

> No wallet needed. No testnet tokens required.

1. Open [**reactiveguard.vercel.app/dashboard**](https://reactiveguard.vercel.app/dashboard)
2. Ensure **Demo Mode** toggle is ON (enabled by default)
3. Click **Simulate Price Drop**
4. Watch: health gauge animates → alert appears → rescue button activates

---

## Project Structure

```
ReactiveGuard/
│
├── contracts/                    # Layer 1 — Solidity
│   ├── MockPriceOracle.sol       # Price feed
│   ├── SimpleLending.sol         # Lending protocol
│   ├── ReactiveGuardian.sol      # Health monitor + events
│   └── GuardianAutomation.sol    # Auto rescue
│
├── scripts/
│   ├── deploy.ts                 # Hardhat deployment
│   └── update-price.ts           # Price simulation
│
├── subscriber/                   # Layer 2 — Node.js
│   ├── index.ts                  # Reactivity SDK subscription
│   ├── socketServer.ts           # Socket.io WebSocket server
│   └── eventDecoder.ts           # ABI event decoder
│
├── frontend/                     # Layer 3 — Next.js
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # Landing page
│       │   └── dashboard/
│       │       └── page.tsx      # Dashboard
│       ├── components/
│       │   ├── HealthGauge.tsx    # Canvas health gauge
│       │   ├── AlertBanner.tsx    # Real-time alert bar
│       │   ├── AlertTimeline.tsx  # Event history feed
│       │   ├── RescueModal.tsx    # One-click rescue
│       │   ├── Web3Provider.tsx   # Wagmi + RainbowKit
│       │   └── ClientProviders.tsx
│       └── hooks/
│           └── useReactiveAlerts.ts  # Socket.io + demo
│
├── test/
│   └── ReactiveGuard.test.ts     # Hardhat tests
│
├── hardhat.config.ts
├── .env.example
└── README.md
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Contracts | **Solidity 0.8.20** · Hardhat · Ethers.js v6 | Lending protocol + guardian logic |
| Reactivity | **@somnia-chain/reactivity** SDK | Protocol-native event subscription |
| Subscriber | **Node.js** · TypeScript · Socket.io | Event relay via WebSocket |
| Frontend | **Next.js 16** · TailwindCSS v4 | Landing page + real-time dashboard |
| Wallet | **RainbowKit** · Wagmi · viem | Somnia Testnet wallet integration |
| Network | **Somnia Testnet** (Chain 50312) | All smart contracts deployed |

---

## Hackathon Alignment

| Criterion | Implementation |
|-----------|----------------|
| **Technical Excellence** | Full SDK integration — Solidity event emission + TypeScript reactive subscription |
| **Real-Time UX** | Live health gauge, instant alerts, activity feed — all updating < 1s |
| **Somnia Integration** | Architecturally depends on Somnia Reactivity. All contracts on Somnia Testnet |
| **Potential Impact** | Solves $100M+ annual liquidation problem in DeFi |

---

## License

MIT

---

<p align="center">
  <img src="frontend/img/ReactiveGuard.png" alt="ReactiveGuard" width="32" />
  <br />
  <strong>ReactiveGuard</strong> — Somnia Reactivity Mini Hackathon 2026
  <br />
  <em>Real-time · Trustless · Fully On-Chain</em>
</p>
