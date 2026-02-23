'use client';

import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { defineChain } from 'viem';
import '@rainbow-me/rainbowkit/styles.css';

// Define Somnia Shannon Testnet
export const somniaTestnet = defineChain({
    id: 50312,
    name: 'Somnia Testnet',
    nativeCurrency: {
        name: 'Somnia Test Token',
        symbol: 'STT',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://dream-rpc.somnia.network/'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Somnia Explorer',
            url: 'https://shannon-explorer.somnia.network',
        },
    },
    testnet: true,
});

const config = getDefaultConfig({
    appName: 'ReactiveGuard',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'demo-project-id',
    chains: [somniaTestnet],
    ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#6366f1',
                        accentColorForeground: 'white',
                        borderRadius: 'medium',
                        fontStack: 'system',
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
