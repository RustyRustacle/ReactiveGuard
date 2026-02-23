'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled — WalletConnect/RainbowKit requires browser APIs (localStorage)
const Web3Provider = dynamic(
    () => import('@/components/Web3Provider').then((mod) => mod.Web3Provider),
    { ssr: false }
);

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return <Web3Provider>{children}</Web3Provider>;
}
