import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { createPublicClient, http, defineChain, Hex } from 'viem';
import { SDK, SubscriptionCallback } from '@somnia-chain/reactivity';
import { createSocketServer, broadcastAlert } from './socketServer';
import { decodeEvent, AlertData } from './eventDecoder';

// ──────────────────────── Config ────────────────────────
const SOMNIA_TESTNET_RPC = process.env.SOMNIA_TESTNET_RPC || 'https://dream-rpc.somnia.network/';
const GUARDIAN_ADDRESS = process.env.GUARDIAN_ADDRESS as `0x${string}` | undefined;

// Define Somnia Shannon Testnet chain
const somniaTestnet = defineChain({
    id: 50312,
    name: 'Somnia Shannon Testnet',
    nativeCurrency: {
        name: 'Somnia Test Token',
        symbol: 'STT',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: [SOMNIA_TESTNET_RPC],
            webSocket: [SOMNIA_TESTNET_RPC.replace('https://', 'wss://')],
        },
    },
    blockExplorers: {
        default: {
            name: 'Somnia Explorer',
            url: 'https://shannon-explorer.somnia.network',
        },
    },
});

// ──────────────────────── Main ────────────────────────
async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('       ReactiveGuard — Reactivity Subscriber          ');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`RPC: ${SOMNIA_TESTNET_RPC}`);
    console.log(`Guardian: ${GUARDIAN_ADDRESS || 'Not configured'}`);
    console.log('');

    // 1. Start WebSocket server for frontend connections
    const socketServer = createSocketServer();
    console.log('✅ Socket.io server started');

    // 2. Initialize viem public client
    const publicClient = createPublicClient({
        chain: somniaTestnet,
        transport: http(SOMNIA_TESTNET_RPC),
    });

    const blockNumber = await publicClient.getBlockNumber();
    console.log(`✅ Connected to Somnia Testnet | Block: ${blockNumber}`);

    // 3. Initialize Somnia Reactivity SDK
    const sdk = new SDK({
        public: publicClient,
    });
    console.log('✅ Somnia Reactivity SDK initialized');

    // 4. Subscribe to reactive events from ReactiveGuardian
    console.log('📡 Setting up Reactivity subscription...');

    const subscription = await sdk.subscribe({
        // Watch events from the ReactiveGuardian contract
        eventContractSources: GUARDIAN_ADDRESS ? [GUARDIAN_ADDRESS] : undefined,

        // Empty ethCalls — we just need the event data
        ethCalls: [],

        // Callback when reactive event arrives (< 1 second from emission)
        onData: (data: SubscriptionCallback) => {
            console.log('\n⚡ REACTIVE EVENT RECEIVED!');
            console.log(`   Topics: ${data.result.topics.length}`);

            const alert = decodeEvent(
                data.result.topics as Hex[],
                data.result.data as Hex
            );

            if (alert) {
                broadcastAlert(alert);
            } else {
                console.log('   ⚠️ Could not decode event');
            }
        },

        onError: (error: Error) => {
            console.error('❌ Reactivity subscription error:', error.message);
        },
    });

    console.log('✅ Reactivity subscription active — listening for guardian events');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Waiting for health factor alerts from chain...      ');
    console.log('  Update MockPriceOracle to trigger alerts.           ');
    console.log('═══════════════════════════════════════════════════════');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
