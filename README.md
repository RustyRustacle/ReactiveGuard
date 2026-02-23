<p align="center">
  <h1 align="center">🛡️ ReactiveGuard</h1>
  <p align="center"><strong>On-Chain Liquidation Guardian Powered by Somnia Reactivity</strong></p>
  <p align="center"><em>Real-time. Trustless. Fully On-Chain.</em></p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Somnia-Testnet-6366f1?style=for-the-badge" alt="Somnia Testnet" />
  <img src="https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge" alt="Solidity" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge" alt="Next.js" />
  <img src="https://img.shields.io/badge/Hackathon-Somnia%20Mini%202026-a78bfa?style=for-the-badge" alt="Hackathon" />
</p>

---

## 📋 Overview

ReactiveGuard is a real-time, fully on-chain DeFi position protection system built on **Somnia's Native Reactivity** infrastructure. It monitors collateral health factors across user positions in a lending protocol and triggers instant protective actions — alerts, auto top-up, and emergency withdrawals — the moment a position enters a danger zone.

**The core proposition:** In traditional DeFi, users lose funds to liquidation because detection is slow. ReactiveGuard eliminates that latency window using Somnia Reactivity's sub-second event propagation.

| Metric | Value |
|--------|-------|
| Detection Latency | **< 1 second** (sub-second reactive propagation) |
| Architecture | **100% on-chain**, no external indexers |
| Polling | **Zero** — pure push-based model |

---

## 🏗️ Architecture

```
Price Oracle Update
       ↓
SimpleLending.sol recalculates health factor
       ↓
Health factor < threshold
       ↓
ReactiveGuardian.sol emits EVM event
       ↓
Somnia Reactivity propagates event (< 1 second)
       ↓
Subscriber receives via @somnia-chain/reactivity SDK
       ↓
Socket.io broadcasts to frontend WebSocket
       ↓
Dashboard updates in real-time — zero polling
```

### Layer 1 — Smart Contracts (Solidity)

| Contract | Description |
|----------|-------------|
| `MockPriceOracle.sol` | Owner-updatable ETH/USD price feed for demo |
| `SimpleLending.sol` | Deposit ETH, borrow RUSD, health factor tracking |
| `ReactiveGuardian.sol` | Health monitoring + reactive event emission |
| `GuardianAutomation.sol` | Auto top-up when user pre-approves rescue |

### Layer 2 — Reactivity Subscriber (Node.js)

Lightweight service using `@somnia-chain/reactivity` SDK to subscribe to on-chain events and relay them via Socket.io WebSocket to the frontend.

### Layer 3 — Frontend (Next.js)

Premium dark-themed dashboard with:
- 🔮 Animated health factor gauge (canvas-based)
- ⚡ Live alert feed with real-time updates
- 🚨 One-click rescue modal
- 📊 Position stats and threshold settings
- 🎮 Demo mode for offline demonstration

---

## 🔗 How Somnia Reactivity Is Used

### Contract-Side: Standard EVM Events

ReactiveGuardian emits standard Solidity events that Somnia's reactive infrastructure watches:

```solidity
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

### Client-Side: Reactive Subscription

The subscriber uses the Somnia Reactivity SDK for protocol-native event delivery:

```typescript
import { SDK, SubscriptionCallback } from '@somnia-chain/reactivity';

const sdk = new SDK({ public: publicClient });

await sdk.subscribe({
  eventContractSources: [GUARDIAN_ADDRESS],
  ethCalls: [],
  onData: (data: SubscriptionCallback) => {
    // Event arrives < 1 second after on-chain emission
    const alert = decodeEvent(data.result.topics, data.result.data);
    broadcastAlert(alert); // → Socket.io → Frontend
  },
});
```

---

## 📊 Health Factor Formula

```
Health Factor = (Collateral Value × Liquidation Threshold) / Total Borrowed

Where Liquidation Threshold = 80%

HF > 1.25  →  🟢 SAFE
1.05 < HF ≤ 1.25  →  🟡 WARNING (ReactiveGuard emits HealthFactorAlert)
HF ≤ 1.05  →  🔴 CRITICAL (ReactiveGuard emits LiquidationImminent)
HF < 1.00  →  ⚫ LIQUIDATABLE
```

---

## 🚀 Local Setup

### Prerequisites

- Node.js 18+ and npm
- MetaMask wallet (for Somnia Testnet interaction)
- STT tokens from [Somnia Faucet](https://testnet.somnia.network/)

### 1. Clone and Install

```bash
git clone https://github.com/RustyRustacle/ReactiveGuard.git
cd ReactiveGuard

# Install root dependencies (Smart Contracts)
npm install

# Install subscriber dependencies
cd subscriber && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your private key
```

### 3. Compile Contracts

```bash
npx hardhat compile
```

### 4. Deploy to Somnia Testnet

```bash
npx hardhat run scripts/deploy.ts --network somniaTestnet
```

Copy the deployed addresses into your `.env` file.

### 5. Start Subscriber

```bash
cd subscriber
npm start
```

### 6. Start Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Demo: Simulate Price Drop

```bash
npx hardhat run scripts/update-price.ts --network somniaTestnet
```

Watch the dashboard update in real-time! 🎉

---

## 🎮 Demo Mode

The frontend includes a built-in **Demo Mode** that simulates the full reactive flow without needing testnet deployment:

1. Open the dashboard at `http://localhost:3000`
2. Ensure "Demo Mode" toggle is ON (default)
3. Click **🔥 Simulate Price Drop**
4. Watch the health factor gauge animate, alerts appear, and the rescue button activate

---

## 📁 Project Structure

```
ReactiveGuard/
├── contracts/                    # Solidity smart contracts
│   ├── SimpleLending.sol
│   ├── ReactiveGuardian.sol
│   ├── MockPriceOracle.sol
│   └── GuardianAutomation.sol
├── scripts/                      # Hardhat deployment scripts
│   ├── deploy.ts
│   └── update-price.ts
├── subscriber/                   # Node.js Reactivity subscriber
│   ├── index.ts
│   ├── socketServer.ts
│   └── eventDecoder.ts
├── frontend/                     # Next.js application
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── components/
│       │   ├── HealthGauge.tsx
│       │   ├── AlertBanner.tsx
│       │   ├── RescueModal.tsx
│       │   ├── AlertTimeline.tsx
│       │   ├── Web3Provider.tsx
│       │   └── ClientProviders.tsx
│       └── hooks/
│           └── useReactiveAlerts.ts
├── test/                         # Hardhat test suite
│   └── ReactiveGuard.test.ts
├── hardhat.config.ts
├── .env.example
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Smart Contracts | Solidity 0.8.20 + Hardhat | Lending protocol, guardian logic |
| Reactivity SDK | `@somnia-chain/reactivity` | On-chain event subscription |
| Backend | Node.js + TypeScript + Socket.io | Reactivity subscriber, WebSocket relay |
| Frontend | Next.js 16 + TailwindCSS v4 | Dashboard, real-time UI |
| Wallet | RainbowKit + Wagmi + viem | MetaMask integration on Somnia Testnet |
| Deployment | Somnia Testnet (Chain ID 50312) | All contracts |

---

## 🏆 Hackathon Alignment

| Criterion | Implementation |
|-----------|---------------|
| **Technical Excellence** | Full SDK integration with both event emission (Solidity) and reactive subscription (TypeScript) |
| **Real-Time UX** | Live health gauge, instant alert banner, activity feed — all updating < 1s |
| **Somnia Integration** | All contracts on Somnia Testnet, project architecturally depends on Somnia Reactivity |
| **Potential Impact** | Solves the $100M+ annual liquidation problem in DeFi |

---

## 📜 Contract Addresses (Somnia Testnet)

> ⚠️ Deploy contracts and update these after deployment

| Contract | Address |
|----------|---------|
| MockPriceOracle | `TBD` |
| SimpleLending | `TBD` |
| ReactiveGuardian | `TBD` |
| GuardianAutomation | `TBD` |

---

## 📄 License

MIT

---

<p align="center">
  <strong>ReactiveGuard</strong> — Somnia Reactivity Mini Hackathon 2026<br/>
  <em>Real-time. Trustless. Fully On-Chain.</em>
</p>
