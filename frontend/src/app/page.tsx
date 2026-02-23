'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/5' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-lg">🛡️</span>
            </div>
            <div>
              <span className="text-lg font-bold gradient-text">ReactiveGuard</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How It Works</a>
            <a href="#architecture" className="text-sm text-slate-400 hover:text-white transition-colors">Architecture</a>
            <a href="#stats" className="text-sm text-slate-400 hover:text-white transition-colors">Stats</a>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-sm font-semibold
                       hover:from-indigo-500 hover:to-purple-500 transition-all duration-200
                       shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
                       hover:scale-105 active:scale-95"
          >
            Launch App →
          </Link>
        </div>
      </nav>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-[120px] animate-float" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[150px]" />

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-grid opacity-40" />

          {/* Orbiting particles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400/40"
                style={{
                  animation: `orbit ${8 + i * 2}s linear infinite`,
                  animationDelay: `${i * 1.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 animate-fadeIn">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Powered by Somnia Reactivity</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-6">
            <span className="block text-white">Protect Your</span>
            <span className="block gradient-text">DeFi Positions</span>
            <span className="block text-white">In Real-Time</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            ReactiveGuard uses Somnia&apos;s native reactivity to detect liquidation risks in
            <span className="text-indigo-400 font-semibold"> under 1 second</span> — fully on-chain, zero polling,
            zero trust assumptions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/dashboard"
              className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-base font-bold
                         hover:from-indigo-500 hover:to-purple-500 transition-all duration-300
                         shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40
                         hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>🚀 Launch App</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-base font-semibold
                         hover:bg-white/10 transition-all duration-200 hover:border-white/20"
            >
              Learn How It Works ↓
            </a>
          </div>

          {/* Hero stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black gradient-text">&lt;1s</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Detection</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-green-400">100%</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">On-Chain</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-black text-purple-400">0</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Polling</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ═══════════ PROBLEM STATEMENT ═══════════ */}
      <section className="py-24 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="glass-card p-8 md:p-12 border border-red-500/10">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">💀</span>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  The <span className="gradient-text-danger">$100M+ Problem</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Every year, DeFi users lose over <strong className="text-white">$100 million</strong> to preventable liquidations.
                  Traditional protocols rely on off-chain bots that poll every few seconds — creating a fatal delay window
                  where positions can be liquidated before users even know they&apos;re at risk.
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                    <div className="text-2xl font-bold text-red-400">3-15s</div>
                    <div className="text-xs text-slate-500 mt-1">Traditional detection delay</div>
                  </div>
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                    <div className="text-2xl font-bold text-red-400">$2.7B</div>
                    <div className="text-xs text-slate-500 mt-1">Total DeFi liquidations (2024)</div>
                  </div>
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                    <div className="text-2xl font-bold text-red-400">87%</div>
                    <div className="text-xs text-slate-500 mt-1">Preventable with faster alerts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Core Features</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Built for <span className="gradient-text">Speed & Safety</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="⚡"
              title="Sub-Second Alerts"
              description="Somnia Reactivity propagates events in under 1 second — no polling, no delays, no missed liquidations."
              gradient="from-indigo-500/10 to-purple-500/10"
              borderColor="border-indigo-500/20"
            />
            <FeatureCard
              icon="🔗"
              title="Fully On-Chain"
              description="All monitoring logic lives in smart contracts. No external indexers, no centralized servers, no trust assumptions."
              gradient="from-green-500/10 to-emerald-500/10"
              borderColor="border-green-500/20"
            />
            <FeatureCard
              icon="🛡️"
              title="One-Click Rescue"
              description="When danger is detected, instantly add collateral or repay debt with a single click. No manual calculations needed."
              gradient="from-blue-500/10 to-cyan-500/10"
              borderColor="border-blue-500/20"
            />
            <FeatureCard
              icon="🤖"
              title="Auto Top-Up"
              description="Pre-fund a rescue wallet and let GuardianAutomation automatically save your position when health drops."
              gradient="from-orange-500/10 to-yellow-500/10"
              borderColor="border-orange-500/20"
            />
            <FeatureCard
              icon="📊"
              title="Live Health Gauge"
              description="Beautiful animated gauge tracks your health factor in real-time with color-coded danger zones."
              gradient="from-pink-500/10 to-rose-500/10"
              borderColor="border-pink-500/20"
            />
            <FeatureCard
              icon="📡"
              title="Event Timeline"
              description="Full chronological history of all reactive events — warnings, critical alerts, and recovery actions."
              gradient="from-violet-500/10 to-purple-500/10"
              borderColor="border-violet-500/20"
            />
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-transparent" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">The Flow</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              How <span className="gradient-text">Reactivity</span> Works
            </h2>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
              From price change to dashboard update — all reactive, all on-chain, all in under one second.
            </p>
          </div>

          <div className="space-y-0">
            <FlowStep
              step={1}
              title="Price Oracle Updates"
              description="ETH/USD price changes on-chain via MockPriceOracle. In production this connects to Chainlink or any price feed."
              icon="📈"
              color="yellow"
            />
            <div className="flex justify-center">
              <div className="w-px h-12 bg-gradient-to-b from-yellow-500/50 to-indigo-500/50" />
            </div>
            <FlowStep
              step={2}
              title="Health Factor Recalculates"
              description="SimpleLending recalculates (Collateral × Threshold) / Borrowed for each position. ReactiveGuardian checks the result against WARNING (1.25) and CRITICAL (1.05) thresholds."
              icon="🧮"
              color="blue"
            />
            <div className="flex justify-center">
              <div className="w-px h-12 bg-gradient-to-b from-blue-500/50 to-indigo-500/50" />
            </div>
            <FlowStep
              step={3}
              title="Reactive Event Emits"
              description="ReactiveGuardian emits HealthFactorAlert or LiquidationImminent events. Somnia's native reactivity layer propagates these events in sub-second time."
              icon="⚡"
              color="indigo"
              highlight
            />
            <div className="flex justify-center">
              <div className="w-px h-12 bg-gradient-to-b from-indigo-500/50 to-green-500/50" />
            </div>
            <FlowStep
              step={4}
              title="Dashboard Updates Instantly"
              description="The Reactivity SDK subscriber receives the event and broadcasts via WebSocket. The dashboard updates the health gauge, alert feed, and rescue options — all in real-time."
              icon="🖥️"
              color="green"
            />
          </div>
        </div>
      </section>

      {/* ═══════════ ARCHITECTURE ═══════════ */}
      <section id="architecture" className="py-24 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
              <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Architecture</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Three-Layer <span className="gradient-text">Stack</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ArchLayer
              number="01"
              title="Smart Contracts"
              subtitle="Solidity • Hardhat"
              items={['MockPriceOracle', 'SimpleLending', 'ReactiveGuardian', 'GuardianAutomation']}
              color="indigo"
            />
            <ArchLayer
              number="02"
              title="Subscriber"
              subtitle="Node.js • Reactivity SDK"
              items={['Event Subscription', 'ABI Decoding', 'WebSocket Relay', 'Alert Routing']}
              color="purple"
            />
            <ArchLayer
              number="03"
              title="Frontend"
              subtitle="Next.js • TailwindCSS"
              items={['Health Gauge', 'Alert Feed', 'Rescue Modal', 'Demo Mode']}
              color="pink"
            />
          </div>
        </div>
      </section>

      {/* ═══════════ TECH STACK ═══════════ */}
      <section id="stats" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Tech Stack</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Built With <span className="gradient-text">Modern Tools</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TechBadge name="Solidity" version="0.8.20" icon="📝" />
            <TechBadge name="Hardhat" version="v2" icon="⛑️" />
            <TechBadge name="Somnia SDK" version="Reactivity" icon="⚡" />
            <TechBadge name="Next.js" version="16" icon="▲" />
            <TechBadge name="TailwindCSS" version="v4" icon="🎨" />
            <TechBadge name="Wagmi" version="Latest" icon="🔌" />
            <TechBadge name="RainbowKit" version="Latest" icon="🌈" />
            <TechBadge name="Socket.io" version="v4" icon="📡" />
          </div>
        </div>
      </section>

      {/* ═══════════ CTA SECTION ═══════════ */}
      <section className="py-32 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Ready to <span className="gradient-text">Guard</span> Your Positions?
          </h2>
          <p className="text-lg text-slate-400 mb-10">
            Try the live demo with simulated price drops. No wallet needed for demo mode.
          </p>
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-lg font-bold
                       hover:from-indigo-500 hover:to-purple-500 transition-all duration-300
                       shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50
                       hover:scale-105 active:scale-95"
          >
            <span>🚀 Launch App</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm">🛡️</span>
              </div>
              <span className="text-sm font-bold gradient-text">ReactiveGuard</span>
            </div>
            <p className="text-sm text-slate-500">
              Built with{' '}
              <a href="https://docs.somnia.network/developer/reactivity" target="_blank" rel="noopener" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Somnia Reactivity SDK
              </a>
              {' '}for Somnia Mini Hackathon 2026
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/RustyRustacle/ReactiveGuard" target="_blank" rel="noopener" className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ──────────────── Sub-components ────────────────

function FeatureCard({ icon, title, description, gradient, borderColor }: {
  icon: string; title: string; description: string; gradient: string; borderColor: string;
}) {
  return (
    <div className={`glass-card glass-card-hover p-6 group bg-gradient-to-br ${gradient} border ${borderColor}`}>
      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function FlowStep({ step, title, description, icon, color, highlight }: {
  step: number; title: string; description: string; icon: string; color: string; highlight?: boolean;
}) {
  const colorMap: Record<string, string> = {
    yellow: 'border-yellow-500/20 bg-yellow-500/5',
    blue: 'border-blue-500/20 bg-blue-500/5',
    indigo: 'border-indigo-500/30 bg-indigo-500/10',
    green: 'border-green-500/20 bg-green-500/5',
  };
  const textColorMap: Record<string, string> = {
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    indigo: 'text-indigo-400',
    green: 'text-green-400',
  };

  return (
    <div className={`glass-card p-6 border ${colorMap[color]} ${highlight ? 'animate-glow' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-indigo-500 shadow-lg shadow-indigo-500/25' : 'bg-white/5'}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xs font-bold uppercase tracking-widest ${textColorMap[color]}`}>Step {step}</span>
            {highlight && (
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full uppercase">Somnia Reactivity</span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ArchLayer({ number, title, subtitle, items, color }: {
  number: string; title: string; subtitle: string; items: string[]; color: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-400 border-indigo-500/20',
    purple: 'text-purple-400 border-purple-500/20',
    pink: 'text-pink-400 border-pink-500/20',
  };
  const bgMap: Record<string, string> = {
    indigo: 'bg-indigo-500/10',
    purple: 'bg-purple-500/10',
    pink: 'bg-pink-500/10',
  };

  return (
    <div className={`glass-card glass-card-hover p-6 border ${colorMap[color].split(' ')[1]}`}>
      <div className={`text-5xl font-black ${colorMap[color].split(' ')[0]} opacity-20 mb-2`}>{number}</div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">{subtitle}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bgMap[color]}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${colorMap[color].split(' ')[0].replace('text-', 'bg-')}`} />
            <span className="text-sm text-slate-300">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechBadge({ name, version, icon }: { name: string; version: string; icon: string }) {
  return (
    <div className="glass-card glass-card-hover p-4 text-center group">
      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform inline-block">{icon}</div>
      <div className="text-sm font-bold text-white">{name}</div>
      <div className="text-xs text-slate-500">{version}</div>
    </div>
  );
}
