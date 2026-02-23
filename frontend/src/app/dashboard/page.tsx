'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import HealthGauge from '@/components/HealthGauge';
import AlertBanner from '@/components/AlertBanner';
import AlertTimeline from '@/components/AlertTimeline';
import RescueModal from '@/components/RescueModal';
import { useReactiveAlerts } from '@/hooks/useReactiveAlerts';

// Demo position data
const INITIAL_POSITION = {
  collateralAmount: '1.0000',
  borrowedAmount: '1200.00',
  collateralValue: '2000.00',
  healthFactor: 1.33,
  ethPrice: 2000,
};

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { connected, alerts, latestAlert, demoMode, setDemoMode, startDemoSimulation, clearAlerts } = useReactiveAlerts(address);

  const [position, setPosition] = useState(INITIAL_POSITION);
  const [showRescueModal, setShowRescueModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Update position when demo alerts arrive
  useEffect(() => {
    if (latestAlert) {
      const hf = parseFloat(latestAlert.healthFactor);
      const cv = parseFloat(latestAlert.collateralValue);
      const ba = parseFloat(latestAlert.borrowedAmount);

      setPosition((prev) => ({
        ...prev,
        healthFactor: hf,
        collateralValue: cv.toFixed(2),
        borrowedAmount: ba.toFixed(2),
        ethPrice: cv, // simplified
      }));
    }
  }, [latestAlert]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 bg-grid relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Alert Banner */}
      <AlertBanner
        alert={latestAlert}
        onRescue={() => setShowRescueModal(true)}
      />

      {/* Rescue Modal */}
      <RescueModal
        isOpen={showRescueModal}
        onClose={() => setShowRescueModal(false)}
        requiredTopUp={latestAlert?.requiredTopUp || '0.25'}
        currentHF={position.healthFactor.toString()}
        collateralValue={position.collateralValue}
        borrowedAmount={position.borrowedAmount}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-lg">🛡️</span>
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">ReactiveGuard</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Somnia Reactivity</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs text-slate-400">
                {demoMode ? 'Demo Mode' : connected ? 'Reactive Link Active' : 'Disconnected'}
              </span>
            </div>

            {/* Network badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-xs text-indigo-400 font-medium">Somnia Testnet</span>
            </div>

            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted: btnMounted }) => {
                const ready = btnMounted;
                const walletConnected = ready && account && chain;

                return (
                  <div>
                    {!walletConnected ? (
                      <button
                        onClick={openConnectModal}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-sm font-semibold
                                   hover:from-indigo-500 hover:to-purple-500 transition-all duration-200
                                   shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
                                   hover:scale-105 active:scale-95"
                      >
                        Connect Wallet
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={openChainModal}
                          className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          {chain.hasIcon && chain.iconUrl && (
                            <img src={chain.iconUrl} alt={chain.name || ''} className="w-5 h-5 rounded" />
                          )}
                        </button>
                        <button
                          onClick={openAccountModal}
                          className="px-4 py-2 bg-white/5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors border border-white/10"
                        >
                          {account.displayName}
                        </button>
                      </div>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Demo Controls */}
        <div className="mb-6 glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <span className="text-lg">⚡</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Somnia Reactivity Demo</p>
              <p className="text-xs text-slate-400">Simulate price drops to see real-time reactive alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-slate-400">Demo Mode</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={(e) => setDemoMode(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${demoMode ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 translate-y-0.5 ${demoMode ? 'translate-x-5.5 ml-1' : 'translate-x-0.5'}`} />
                </div>
              </div>
            </label>
            <button
              onClick={() => {
                setPosition(INITIAL_POSITION);
                startDemoSimulation();
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-sm font-semibold
                         hover:from-red-500 hover:to-orange-500 transition-all shadow-lg shadow-red-500/20
                         hover:scale-105 active:scale-95"
            >
              🔥 Simulate Price Drop
            </button>
            <button
              onClick={() => {
                setPosition(INITIAL_POSITION);
                clearAlerts();
              }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium
                         hover:bg-white/10 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Health Gauge + Position Stats */}
          <div className="lg:col-span-5 space-y-6">
            {/* Health Gauge Card */}
            <div className="glass-card glass-card-hover p-6 animate-glow">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Health Factor Monitor
              </h2>
              <div className="flex justify-center">
                <HealthGauge healthFactor={position.healthFactor} size={280} />
              </div>
            </div>

            {/* Position Stats */}
            <div className="glass-card glass-card-hover p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Position Details
              </h2>
              <div className="space-y-4">
                <StatRow
                  label="Collateral Deposited"
                  value={`${position.collateralAmount} ETH`}
                  subValue={`$${position.collateralValue}`}
                  icon="💎"
                />
                <StatRow
                  label="Amount Borrowed"
                  value={`${position.borrowedAmount} RUSD`}
                  icon="💰"
                />
                <StatRow
                  label="ETH/USD Price"
                  value={`$${position.ethPrice.toFixed(2)}`}
                  icon="📈"
                />
                <StatRow
                  label="Liquidation Price"
                  value={`$${(parseFloat(position.borrowedAmount) / (parseFloat(position.collateralAmount) * 0.8)).toFixed(2)}`}
                  icon="⚠️"
                  danger={position.healthFactor < 1.25}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card glass-card-hover p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowRescueModal(true)}
                  className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20
                             hover:border-green-500/40 transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform inline-block">⬆️</span>
                  <p className="text-xs font-semibold text-green-400 mt-2">Add Collateral</p>
                </button>
                <button
                  onClick={() => setShowRescueModal(true)}
                  className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20
                             hover:border-blue-500/40 transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform inline-block">💸</span>
                  <p className="text-xs font-semibold text-blue-400 mt-2">Repay Debt</p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Alert Feed + Info */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Alert Feed */}
            <div className="glass-card glass-card-hover p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  Live Alert Feed
                </h2>
                <span className="text-xs text-slate-500 font-mono">{alerts.length} events</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto pr-1">
                <AlertTimeline alerts={alerts} />
              </div>
            </div>

            {/* Reactivity Info */}
            <div className="glass-card p-6 border border-indigo-500/10">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                How Somnia Reactivity Works
              </h2>
              <div className="space-y-3">
                <FlowStep number={1} title="Price Oracle Updates" desc="ETH/USD price changes on-chain" active />
                <FlowStep number={2} title="Health Factor Recalculates" desc="ReactiveGuardian checks thresholds" />
                <FlowStep number={3} title="Reactive Event Emits" desc="Somnia protocol propagates in <1s" highlight />
                <FlowStep number={4} title="Dashboard Updates" desc="WebSocket delivers alert instantly" />
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold gradient-text">&lt; 1s</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Detection</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-400">100%</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">On-Chain</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-400">0</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Polling</div>
                </div>
              </div>
            </div>

            {/* Threshold Settings */}
            <div className="glass-card glass-card-hover p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                Alert Thresholds
              </h2>
              <div className="space-y-4">
                <ThresholdSlider label="Warning Threshold" value={1.25} color="yellow" />
                <ThresholdSlider label="Critical Threshold" value={1.05} color="red" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/5 pt-8 pb-12 text-center">
          <p className="text-sm text-slate-500">
            <span className="gradient-text font-semibold">ReactiveGuard</span>
            {' — '}Built with{' '}
            <a href="https://docs.somnia.network/developer/reactivity" target="_blank" rel="noopener" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Somnia Reactivity SDK
            </a>
            {' '}for the Somnia Mini Hackathon 2026
          </p>
          <p className="text-xs text-slate-600 mt-2">Real-time. Trustless. Fully On-Chain.</p>
        </footer>
      </main>
    </div>
  );
}

// ──────────────── Sub-components ────────────────

function StatRow({ label, value, subValue, icon, danger }: {
  label: string; value: string; subValue?: string; icon: string; danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <div className="text-right">
        <span className={`text-sm font-mono font-semibold ${danger ? 'text-red-400' : 'text-white'}`}>
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-slate-500 ml-2">{subValue}</span>
        )}
      </div>
    </div>
  );
}

function FlowStep({ number, title, desc, active, highlight }: {
  number: number; title: string; desc: string; active?: boolean; highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${highlight ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-white/5'} transition-colors`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
        ${highlight ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400'}`}>
        {number}
      </div>
      <div>
        <p className={`text-sm font-medium ${highlight ? 'text-indigo-300' : 'text-slate-300'}`}>{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function ThresholdSlider({ label, value, color }: {
  label: string; value: number; color: 'yellow' | 'red';
}) {
  const colorClass = color === 'yellow' ? 'text-yellow-400' : 'text-red-400';
  const bgClass = color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <span className={`text-sm font-mono font-bold ${colorClass}`}>{value.toFixed(2)}</span>
      </div>
      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full ${bgClass} rounded-full transition-all`}
          style={{ width: `${(value / 2) * 100}%` }}
        />
      </div>
    </div>
  );
}
