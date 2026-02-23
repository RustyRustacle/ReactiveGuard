'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import HealthGauge from '@/components/HealthGauge';
import AlertBanner from '@/components/AlertBanner';
import AlertTimeline from '@/components/AlertTimeline';
import RescueModal from '@/components/RescueModal';
import { useReactiveAlerts } from '@/hooks/useReactiveAlerts';

/* ═══ SVG Icons ═══ */
function IconBolt({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>;
}
function IconDiamond({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V15m0 0l-2.25-1.313M3 16.5v-2.25m0 0l2.25 1.313M21 16.5v-2.25m0 0l-2.25 1.313m-13.5 0L12 15m0 0l4.5-2.625" /></svg>;
}
function IconCoin({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function IconChart({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
}
function IconWarn({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;
}
function IconArrowUp({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" /></svg>;
}
function IconBanknotes({ className = 'w-5 h-5' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>;
}

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
        ethPrice: cv,
      }));
    }
  }, [latestAlert]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0118] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-600/[0.06] rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-indigo-600/[0.05] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/[0.03] rounded-full blur-[180px]" />
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

      {/* ═══ Header ═══ */}
      <header className="relative z-10 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="ReactiveGuard" width={32} height={32} className="drop-shadow-lg" />
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-purple-300 to-indigo-400 bg-clip-text text-transparent">ReactiveGuard</h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em]">Somnia Reactivity</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Connection status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : demoMode ? 'bg-purple-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs text-slate-400">
                {demoMode ? 'Demo Mode' : connected ? 'Reactive Link Active' : 'Disconnected'}
              </span>
            </div>

            {/* Network badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/[0.08] border border-purple-500/15">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span className="text-xs text-purple-400/90 font-medium">Somnia Testnet</span>
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
                        className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-sm font-semibold
                                   hover:from-purple-500 hover:to-indigo-500 transition-all duration-300
                                   shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
                      >
                        Connect Wallet
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={openChainModal} className="p-2 bg-white/[0.04] rounded-full hover:bg-white/[0.08] transition-colors border border-white/[0.06]">
                          {chain.hasIcon && chain.iconUrl && <img src={chain.iconUrl} alt={chain.name || ''} className="w-4 h-4 rounded" />}
                        </button>
                        <button onClick={openAccountModal} className="px-4 py-2 bg-white/[0.04] rounded-full text-sm font-medium hover:bg-white/[0.08] transition-colors border border-white/[0.06]">
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

      {/* ═══ Main Content ═══ */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Demo Controls */}
        <div className="mb-6 relative rounded-2xl p-[1px] bg-gradient-to-r from-purple-500/20 via-transparent to-indigo-500/20">
          <div className="bg-[#0e0520]/90 backdrop-blur-sm rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center text-purple-400">
                <IconBolt className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Somnia Reactivity Demo</p>
                <p className="text-xs text-slate-500">Simulate price drops to see real-time reactive alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-slate-500">Demo Mode</span>
                <div className="relative">
                  <input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} className="sr-only" />
                  <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${demoMode ? 'bg-purple-600' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 translate-y-0.5 ${demoMode ? 'translate-x-5.5 ml-1' : 'translate-x-0.5'}`} />
                  </div>
                </div>
              </label>
              <button
                onClick={() => { setPosition(INITIAL_POSITION); startDemoSimulation(); }}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-full text-sm font-semibold
                           hover:from-red-500 hover:to-orange-500 transition-all shadow-lg shadow-red-500/15
                           hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>
                Simulate Price Drop
              </button>
              <button
                onClick={() => { setPosition(INITIAL_POSITION); clearAlerts(); }}
                className="px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-full text-sm font-medium hover:bg-white/[0.08] transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ═══ Left Panel ═══ */}
          <div className="lg:col-span-5 space-y-5">
            {/* Health Gauge */}
            <DashCard title="Health Factor Monitor" dotColor="purple">
              <div className="flex justify-center">
                <HealthGauge healthFactor={position.healthFactor} size={280} />
              </div>
            </DashCard>

            {/* Position Stats */}
            <DashCard title="Position Details" dotColor="indigo">
              <div className="space-y-1">
                <StatRow icon={<IconDiamond className="w-4 h-4" />} label="Collateral Deposited" value={`${position.collateralAmount} ETH`} sub={`$${position.collateralValue}`} />
                <StatRow icon={<IconCoin className="w-4 h-4" />} label="Amount Borrowed" value={`${position.borrowedAmount} RUSD`} />
                <StatRow icon={<IconChart className="w-4 h-4" />} label="ETH/USD Price" value={`$${position.ethPrice.toFixed(2)}`} />
                <StatRow icon={<IconWarn className="w-4 h-4" />} label="Liquidation Price" value={`$${(parseFloat(position.borrowedAmount) / (parseFloat(position.collateralAmount) * 0.8)).toFixed(2)}`} danger={position.healthFactor < 1.25} />
              </div>
            </DashCard>

            {/* Quick Actions */}
            <DashCard title="Quick Actions" dotColor="green">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowRescueModal(true)}
                  className="group p-4 rounded-xl bg-green-500/[0.04] border border-green-500/10 hover:border-green-500/25 hover:bg-green-500/[0.08] transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/15 flex items-center justify-center text-green-400 mx-auto mb-2 group-hover:bg-green-500/20 transition-all">
                    <IconArrowUp className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-green-400 text-center">Add Collateral</p>
                </button>
                <button
                  onClick={() => setShowRescueModal(true)}
                  className="group p-4 rounded-xl bg-blue-500/[0.04] border border-blue-500/10 hover:border-blue-500/25 hover:bg-blue-500/[0.08] transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-400 mx-auto mb-2 group-hover:bg-blue-500/20 transition-all">
                    <IconBanknotes className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-blue-400 text-center">Repay Debt</p>
                </button>
              </div>
            </DashCard>
          </div>

          {/* ═══ Right Panel ═══ */}
          <div className="lg:col-span-7 space-y-5">
            {/* Live Alert Feed */}
            <DashCard title="Live Alert Feed" dotColor="red" dotPulse extra={<span className="text-xs text-slate-500 font-mono">{alerts.length} events</span>}>
              <div className="max-h-[400px] overflow-y-auto pr-1">
                <AlertTimeline alerts={alerts} />
              </div>
            </DashCard>

            {/* Reactivity Info */}
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/15 via-transparent to-indigo-500/10">
              <div className="bg-[#0e0520]/90 backdrop-blur-sm rounded-2xl p-6">
                <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  How Somnia Reactivity Works
                </h2>
                <div className="space-y-2">
                  <FlowStep number={1} title="Price Oracle Updates" desc="ETH/USD price changes on-chain" />
                  <FlowStep number={2} title="Health Factor Recalculates" desc="ReactiveGuardian checks thresholds" />
                  <FlowStep number={3} title="Reactive Event Emits" desc="Somnia protocol propagates in <1s" highlight />
                  <FlowStep number={4} title="Dashboard Updates" desc="WebSocket delivers alert instantly" />
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.04] grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">&lt; 1s</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mt-1">Detection</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">100%</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mt-1">On-Chain</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold bg-gradient-to-b from-purple-400 to-purple-400/50 bg-clip-text text-transparent">0</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mt-1">Polling</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Threshold Settings */}
            <DashCard title="Alert Thresholds" dotColor="yellow">
              <div className="space-y-4">
                <ThresholdSlider label="Warning Threshold" value={1.25} color="yellow" />
                <ThresholdSlider label="Critical Threshold" value={1.05} color="red" />
              </div>
            </DashCard>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-14 border-t border-white/[0.04] pt-8 pb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image src="/logo.png" alt="ReactiveGuard" width={18} height={18} />
            <span className="text-sm bg-gradient-to-r from-purple-300 to-indigo-400 bg-clip-text text-transparent font-semibold">ReactiveGuard</span>
          </div>
          <p className="text-xs text-slate-500">
            Built with{' '}
            <a href="https://docs.somnia.network/developer/reactivity" target="_blank" rel="noopener" className="text-purple-400/70 hover:text-purple-300 transition-colors">
              Somnia Reactivity SDK
            </a>
            {' '}· Somnia Mini Hackathon 2026
          </p>
        </footer>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════ */

function DashCard({ title, dotColor, dotPulse, extra, children }: {
  title: string; dotColor: string; dotPulse?: boolean; extra?: React.ReactNode; children: React.ReactNode;
}) {
  const dotClasses: Record<string, string> = {
    purple: 'bg-purple-400',
    indigo: 'bg-indigo-400',
    green: 'bg-green-400',
    red: 'bg-red-400',
    yellow: 'bg-yellow-400',
  };
  return (
    <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-white/[0.05] to-transparent">
      <div className="bg-[#0e0520]/80 backdrop-blur-sm rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[dotColor] || 'bg-purple-400'} ${dotPulse ? 'animate-pulse' : ''}`} />
            {title}
          </h2>
          {extra}
        </div>
        {children}
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, sub, danger }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.03] last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="text-slate-500">{icon}</div>
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <div className="text-right">
        <span className={`text-sm font-mono font-semibold ${danger ? 'text-red-400' : 'text-white'}`}>
          {value}
        </span>
        {sub && <span className="text-xs text-slate-500 ml-2">{sub}</span>}
      </div>
    </div>
  );
}

function FlowStep({ number, title, desc, highlight }: {
  number: number; title: string; desc: string; highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${highlight ? 'bg-purple-500/[0.08] border border-purple-500/15' : 'hover:bg-white/[0.02]'}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
        ${highlight ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' : 'bg-white/[0.04] text-slate-500 border border-white/[0.06]'}`}>
        {number}
      </div>
      <div>
        <p className={`text-sm font-medium ${highlight ? 'text-purple-300' : 'text-slate-300'}`}>{title}</p>
        <p className="text-[11px] text-slate-500">{desc}</p>
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
      <div className="relative h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div className={`absolute left-0 top-0 h-full ${bgClass} rounded-full transition-all`} style={{ width: `${(value / 2) * 100}%` }} />
      </div>
    </div>
  );
}
