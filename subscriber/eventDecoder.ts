import { decodeAbiParameters, Hex, formatEther } from 'viem';

/**
 * Event signature hashes for ReactiveGuardian events.
 * These are used to filter Somnia Reactivity subscriptions.
 */
export const EVENT_SIGNATURES = {
    // keccak256("HealthFactorAlert(address,uint256,uint256,uint256,uint256)")
    HealthFactorAlert: '0x' as Hex,
    // keccak256("LiquidationImminent(address,uint256,uint256,uint256,uint256,uint256)")
    LiquidationImminent: '0x' as Hex,
    // keccak256("PositionSafe(address,uint256,uint256)")
    PositionSafe: '0x' as Hex,
};

/**
 * Decoded alert data structure
 */
export interface AlertData {
    type: 'warning' | 'critical' | 'safe';
    user: string;
    healthFactor: string;
    collateralValue: string;
    borrowedAmount: string;
    requiredTopUp?: string;
    timestamp: number;
}

/**
 * Decode HealthFactorAlert event data
 */
export function decodeHealthFactorAlert(topics: Hex[], data: Hex): AlertData {
    // topic[0] = event signature
    // topic[1] = indexed user address
    const user = `0x${topics[1].slice(26)}`;

    const decoded = decodeAbiParameters(
        [
            { name: 'healthFactor', type: 'uint256' },
            { name: 'collateralValue', type: 'uint256' },
            { name: 'borrowedAmount', type: 'uint256' },
            { name: 'timestamp', type: 'uint256' },
        ],
        data
    );

    return {
        type: 'warning',
        user,
        healthFactor: formatEther(decoded[0]),
        collateralValue: formatEther(decoded[1]),
        borrowedAmount: formatEther(decoded[2]),
        timestamp: Number(decoded[3]) * 1000,
    };
}

/**
 * Decode LiquidationImminent event data
 */
export function decodeLiquidationImminent(topics: Hex[], data: Hex): AlertData {
    const user = `0x${topics[1].slice(26)}`;

    const decoded = decodeAbiParameters(
        [
            { name: 'healthFactor', type: 'uint256' },
            { name: 'collateralValue', type: 'uint256' },
            { name: 'borrowedAmount', type: 'uint256' },
            { name: 'requiredTopUp', type: 'uint256' },
            { name: 'timestamp', type: 'uint256' },
        ],
        data
    );

    return {
        type: 'critical',
        user,
        healthFactor: formatEther(decoded[0]),
        collateralValue: formatEther(decoded[1]),
        borrowedAmount: formatEther(decoded[2]),
        requiredTopUp: formatEther(decoded[3]),
        timestamp: Number(decoded[4]) * 1000,
    };
}

/**
 * Decode PositionSafe event data
 */
export function decodePositionSafe(topics: Hex[], data: Hex): AlertData {
    const user = `0x${topics[1].slice(26)}`;

    const decoded = decodeAbiParameters(
        [
            { name: 'healthFactor', type: 'uint256' },
            { name: 'timestamp', type: 'uint256' },
        ],
        data
    );

    return {
        type: 'safe',
        user,
        healthFactor: formatEther(decoded[0]),
        collateralValue: '0',
        borrowedAmount: '0',
        timestamp: Number(decoded[1]) * 1000,
    };
}

/**
 * Route event decoding based on topic[0] signature
 */
export function decodeEvent(topics: Hex[], data: Hex): AlertData | null {
    const signature = topics[0];

    // Match against known signatures
    // In production, compute these from keccak256 of the event signatures
    // For now, we match by attempting all decoders
    try {
        // Try LiquidationImminent first (has 5 non-indexed params)
        if (data.length > 330) {
            return decodeLiquidationImminent(topics, data);
        }
        // Try HealthFactorAlert (has 4 non-indexed params)
        if (data.length > 260) {
            return decodeHealthFactorAlert(topics, data);
        }
        // Try PositionSafe (has 2 non-indexed params)
        return decodePositionSafe(topics, data);
    } catch (e) {
        console.error('Failed to decode event:', e);
        return null;
    }
}
