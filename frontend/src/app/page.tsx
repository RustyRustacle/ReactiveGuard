'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/* ══════════════════════════════════════════════════════════════
   STAR FIELD CANVAS — animated background particles + orbits
   ══════════════════════════════════════════════════════════════ */
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * 3 * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Create stars
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 3,
      size: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.3 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Create orbital rings (centered)
    const orbits = [
      { radius: 200, speed: 0.0003, opacity: 0.04, dash: [3, 12] },
      { radius: 340, speed: -0.0002, opacity: 0.03, dash: [5, 15] },
      { radius: 500, speed: 0.00015, opacity: 0.025, dash: [2, 20] },
    ];

    let time = 0;

    const animate = () => {
      if (!canvas || !ctx) return;
      const w = window.innerWidth;
      const h = window.innerHeight * 3;

      ctx.clearRect(0, 0, w, h);
      time += 1;

      // Draw orbital rings in hero area
      const cx = w / 2;
      const cy = window.innerHeight * 0.45;
      orbits.forEach((orbit) => {
        ctx.beginPath();
        ctx.setLineDash(orbit.dash);
        ctx.arc(cx, cy, orbit.radius, orbit.speed * time, orbit.speed * time + Math.PI * 1.8);
        ctx.strokeStyle = `rgba(139, 92, 246, ${orbit.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw & animate stars
      stars.forEach((star) => {
        star.pulse += 0.02;
        const flicker = Math.sin(star.pulse) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 180, 255, ${star.opacity * flicker})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '300vh' }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════
   SVG ICON COMPONENTS — replacing emojis
   ══════════════════════════════════════════════════════════════ */
function IconBolt({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}
function IconShield({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
function IconLink({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}
function IconCursor({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
    </svg>
  );
}
function IconCog({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.645-7.045l-1.288.737M5.933 17.307l-1.288.738M17.068 17.307l1.288.738M5.933 4.955l-1.288-.738M12 3.75V2.25m0 19.5V20.25" />
    </svg>
  );
}
function IconChart({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}
function IconClock({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   LANDING PAGE
   ══════════════════════════════════════════════════════════════ */
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
    <div className="min-h-screen bg-[#0a0118] text-white overflow-x-hidden relative">
      {/* Animated star field + orbits */}
      <StarField />

      {/* Deep purple ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[900px] h-[900px] bg-purple-600/[0.07] rounded-full blur-[200px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/[0.05] rounded-full blur-[150px]" />
        <div className="absolute top-[60%] right-[10%] w-[400px] h-[400px] bg-violet-500/[0.04] rounded-full blur-[130px]" />
      </div>

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 60 ? 'bg-[#0a0118]/80 backdrop-blur-2xl border-b border-purple-500/10' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="ReactiveGuard" width={36} height={36} className="drop-shadow-lg" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-300 to-indigo-400 bg-clip-text text-transparent">
              ReactiveGuard
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-full px-2 py-1.5">
            <a href="#features" className="px-4 py-1.5 text-sm text-slate-400 hover:text-white rounded-full hover:bg-white/[0.06] transition-all">Features</a>
            <a href="#how-it-works" className="px-4 py-1.5 text-sm text-slate-400 hover:text-white rounded-full hover:bg-white/[0.06] transition-all">How It Works</a>
            <a href="#architecture" className="px-4 py-1.5 text-sm text-slate-400 hover:text-white rounded-full hover:bg-white/[0.06] transition-all">Architecture</a>
          </div>

          <Link
            href="/dashboard"
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-sm font-semibold
                       hover:from-purple-500 hover:to-indigo-500 transition-all duration-300
                       shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/[0.08] border border-purple-500/20 mb-8 animate-fadeIn">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-medium text-purple-300/90 uppercase tracking-widest">Powered by Somnia Reactivity</span>
          </div>

          {/* Logo above heading */}
          <div className="flex justify-center mb-8 animate-fadeIn">
            <Image src="/logo.png" alt="ReactiveGuard" width={100} height={100} className="drop-shadow-[0_0_40px_rgba(139,92,246,0.3)]" />
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.95] tracking-tight mb-6">
            <span className="block text-white/90">Protect Your</span>
            <span className="block bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">DeFi Positions</span>
            <span className="block text-white/90">In Real-Time</span>
          </h1>

          <p className="text-base md:text-lg text-slate-400/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            ReactiveGuard uses Somnia&apos;s native reactivity to detect liquidation risks in{' '}
            <span className="text-purple-300 font-semibold">under 1 second</span> — fully on-chain,
            zero polling, zero trust assumptions.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/dashboard"
              className="group px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-sm font-bold
                         hover:from-purple-500 hover:to-indigo-500 transition-all duration-300
                         shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40
                         hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Launch App
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a href="#how-it-works" className="px-8 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-full text-sm font-semibold hover:bg-white/[0.08] transition-all hover:border-white/[0.15]">
              How It Works
            </a>
          </div>

          {/* Hero stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <StatDisplay value="<1s" label="Detection" />
            <StatDisplay value="100%" label="On-Chain" />
            <StatDisplay value="0" label="Polling" />
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent" />
        </div>
      </section>

      {/* ═══════════ PROBLEM ═══════════ */}
      <section className="py-28 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-red-500/30 via-transparent to-orange-500/20">
            <div className="bg-[#0e0520]/90 backdrop-blur-xl rounded-3xl p-8 md:p-12">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    The <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">$100M+ Problem</span>
                  </h2>
                  <p className="text-slate-400 text-base leading-relaxed mb-6">
                    Every year, DeFi users lose over <strong className="text-white">$100 million</strong> to preventable liquidations.
                    Traditional protocols rely on off-chain bots that poll every few seconds — creating a fatal delay window.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <MetricCard value="3-15s" label="Traditional detection delay" color="red" />
                    <MetricCard value="$2.7B" label="Total DeFi liquidations" color="red" />
                    <MetricCard value="87%" label="Preventable with faster alerts" color="red" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="py-28 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeader badge="Core Features" title="Built for" highlight="Speed & Safety" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            <FeatureCard icon={<IconBolt className="w-5 h-5" />} title="Sub-Second Alerts" description="Somnia Reactivity propagates events in under 1 second — no polling, no delays, no missed liquidations." color="purple" />
            <FeatureCard icon={<IconLink className="w-5 h-5" />} title="Fully On-Chain" description="All monitoring logic lives in smart contracts. No external indexers, no centralized servers needed." color="indigo" />
            <FeatureCard icon={<IconShield className="w-5 h-5" />} title="One-Click Rescue" description="When danger is detected, instantly add collateral or repay debt with a single click from the dashboard." color="blue" />
            <FeatureCard icon={<IconCog className="w-5 h-5" />} title="Auto Top-Up" description="Pre-fund a rescue wallet and let GuardianAutomation automatically save your position when health drops." color="violet" />
            <FeatureCard icon={<IconChart className="w-5 h-5" />} title="Live Health Gauge" description="Animated canvas gauge tracks your health factor in real-time with color-coded danger zones." color="pink" />
            <FeatureCard icon={<IconClock className="w-5 h-5" />} title="Event Timeline" description="Full chronological history of all reactive events — warnings, critical alerts, and recovery actions." color="fuchsia" />
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="py-28 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeader badge="The Flow" title="How" highlight="Reactivity" suffix="Works" />
          <p className="text-center text-slate-400/80 mt-4 mb-14 max-w-2xl mx-auto">
            From price change to dashboard update — all reactive, all on-chain, all in under one second.
          </p>

          <div className="space-y-0">
            <StepCard step={1} title="Price Oracle Updates" description="ETH/USD price changes on-chain via MockPriceOracle. In production, this connects to Chainlink or any price feed." />
            <StepConnector />
            <StepCard step={2} title="Health Factor Recalculates" description="SimpleLending recomputes (Collateral × LT) / Borrowed. ReactiveGuardian checks against WARNING (1.25) and CRITICAL (1.05) thresholds." />
            <StepConnector />
            <StepCard step={3} title="Reactive Event Emits" description="ReactiveGuardian emits HealthFactorAlert or LiquidationImminent. Somnia's native reactivity layer propagates in sub-second time." highlight />
            <StepConnector />
            <StepCard step={4} title="Dashboard Updates Instantly" description="The Reactivity SDK subscriber receives the event on arrival and broadcasts to the frontend via WebSocket — zero polling." />
          </div>
        </div>
      </section>

      {/* ═══════════ ARCHITECTURE ═══════════ */}
      <section id="architecture" className="py-28 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeader badge="Architecture" title="Three-Layer" highlight="Stack" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14">
            <LayerCard number="01" title="Smart Contracts" subtitle="Solidity · Hardhat" items={['MockPriceOracle', 'SimpleLending', 'ReactiveGuardian', 'GuardianAutomation']} />
            <LayerCard number="02" title="Subscriber" subtitle="Node.js · Reactivity SDK" items={['Event Subscription', 'ABI Decoding', 'WebSocket Relay', 'Alert Routing']} />
            <LayerCard number="03" title="Frontend" subtitle="Next.js · TailwindCSS" items={['Health Gauge', 'Alert Feed', 'Rescue Modal', 'Demo Mode']} />
          </div>

          {/* Contract addresses */}
          <div className="mt-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Deployed Contracts — Somnia Testnet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ContractAddr name="MockPriceOracle" addr="0xa6446C060e93A91b00dA94135d784704F27558eb" />
              <ContractAddr name="SimpleLending" addr="0xa3c740c8F64eB59c21743792c10aA7E6e1734160" />
              <ContractAddr name="ReactiveGuardian" addr="0x4F74fE087c53b7db2e01C5Ce4491A037D8007AD2" />
              <ContractAddr name="GuardianAutomation" addr="0xf5eded7E428FF0b74BDE1E2Af848816CfA15e813" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TECH STACK ═══════════ */}
      <section className="py-28 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeader badge="Tech Stack" title="Built With" highlight="Modern Tools" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-14">
            <TechBadge name="Solidity" detail="0.8.20" />
            <TechBadge name="Hardhat" detail="v2" />
            <TechBadge name="Somnia SDK" detail="Reactivity" accent />
            <TechBadge name="Next.js" detail="16" />
            <TechBadge name="TailwindCSS" detail="v4" />
            <TechBadge name="Wagmi" detail="Latest" />
            <TechBadge name="RainbowKit" detail="Latest" />
            <TechBadge name="Socket.io" detail="v4" />
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-32 relative z-10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Image src="/logo.png" alt="ReactiveGuard" width={64} height={64} className="mx-auto mb-6 drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Ready to <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Guard</span> Your Positions?
          </h2>
          <p className="text-base text-slate-400/80 mb-10">
            Try the live demo with simulated price drops. No wallet needed for demo mode.
          </p>
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-base font-bold
                       hover:from-purple-500 hover:to-indigo-500 transition-all duration-300
                       shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
          >
            Launch App
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/[0.04] py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="ReactiveGuard" width={24} height={24} />
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-300 to-indigo-400 bg-clip-text text-transparent">ReactiveGuard</span>
          </div>
          <p className="text-xs text-slate-500">
            Built with{' '}
            <a href="https://docs.somnia.network/developer/reactivity" target="_blank" rel="noopener" className="text-purple-400/80 hover:text-purple-300 transition-colors">
              Somnia Reactivity SDK
            </a>
            {' '}· Somnia Mini Hackathon 2026
          </p>
          <a href="https://github.com/RustyRustacle/ReactiveGuard" target="_blank" rel="noopener" className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════ */

function StatDisplay({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-black bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">{value}</div>
      <div className="text-[10px] text-slate-500/80 uppercase tracking-[0.2em] mt-1.5">{label}</div>
    </div>
  );
}

function MetricCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
      <div className={`text-xl font-bold ${color === 'red' ? 'text-red-400' : 'text-white'}`}>{value}</div>
      <div className="text-[10px] text-slate-500 mt-1 leading-tight">{label}</div>
    </div>
  );
}

function SectionHeader({ badge, title, highlight, suffix }: { badge: string; title: string; highlight: string; suffix?: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-500/[0.08] border border-purple-500/15 mb-5">
        <span className="text-[10px] font-semibold text-purple-400/90 uppercase tracking-[0.2em]">{badge}</span>
      </div>
      <h2 className="text-3xl md:text-5xl font-bold text-white">
        {title}{' '}
        <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">{highlight}</span>
        {suffix && <> {suffix}</>}
      </h2>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode; title: string; description: string; color: string;
}) {
  return (
    <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/[0.06] to-transparent hover:from-purple-500/20 hover:to-indigo-500/10 transition-all duration-500">
      <div className="bg-[#0e0520]/80 backdrop-blur-sm rounded-2xl p-6 h-full">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center mb-4 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all">
          {icon}
        </div>
        <h3 className="text-base font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400/80 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StepCard({ step, title, description, highlight }: {
  step: number; title: string; description: string; highlight?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl p-[1px] ${highlight ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30' : 'bg-gradient-to-r from-white/[0.05] to-transparent'}`}>
      <div className={`bg-[#0e0520]/90 backdrop-blur-sm rounded-2xl p-6 ${highlight ? 'shadow-[0_0_40px_rgba(139,92,246,0.08)]' : ''}`}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold
            ${highlight ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'}`}>
            {String(step).padStart(2, '0')}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-base font-bold text-white">{title}</h3>
              {highlight && (
                <span className="px-2 py-0.5 bg-purple-500/15 text-purple-300 text-[10px] font-semibold rounded-full uppercase tracking-wider border border-purple-500/20">
                  Somnia Reactivity
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400/80 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepConnector() {
  return (
    <div className="flex justify-center py-1">
      <div className="w-px h-8 bg-gradient-to-b from-purple-500/30 to-purple-500/10" />
    </div>
  );
}

function LayerCard({ number, title, subtitle, items }: {
  number: string; title: string; subtitle: string; items: string[];
}) {
  return (
    <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-white/[0.06] to-transparent hover:from-purple-500/20 transition-all duration-500">
      <div className="bg-[#0e0520]/80 backdrop-blur-sm rounded-2xl p-6 h-full">
        <div className="text-4xl font-black bg-gradient-to-b from-purple-500/20 to-transparent bg-clip-text text-transparent mb-3">{number}</div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">{subtitle}</p>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/[0.04] border border-purple-500/[0.06]">
              <div className="w-1 h-1 rounded-full bg-purple-400/60" />
              <span className="text-sm text-slate-300/80">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContractAddr({ name, addr }: { name: string; addr: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <span className="text-xs font-medium text-slate-400">{name}</span>
      <a
        href={`https://shannon-explorer.somnia.network/address/${addr}`}
        target="_blank"
        rel="noopener"
        className="text-xs font-mono text-purple-400/70 hover:text-purple-300 transition-colors"
      >
        {addr.slice(0, 6)}...{addr.slice(-4)}
      </a>
    </div>
  );
}

function TechBadge({ name, detail, accent }: { name: string; detail: string; accent?: boolean }) {
  return (
    <div className={`group rounded-xl p-4 text-center border transition-all duration-300 hover:border-purple-500/20 hover:bg-purple-500/[0.03]
      ${accent ? 'bg-purple-500/[0.05] border-purple-500/15' : 'bg-white/[0.02] border-white/[0.04]'}`}>
      <div className="text-sm font-bold text-white">{name}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{detail}</div>
    </div>
  );
}
