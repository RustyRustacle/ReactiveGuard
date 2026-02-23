'use client';

import { useEffect, useRef, useState } from 'react';

interface HealthGaugeProps {
    healthFactor: number;
    size?: number;
    className?: string;
}

export default function HealthGauge({ healthFactor, size = 280, className = '' }: HealthGaugeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [displayValue, setDisplayValue] = useState(healthFactor);
    const animRef = useRef<number | null>(null);

    // Animate health factor changes
    useEffect(() => {
        const start = displayValue;
        const end = healthFactor;
        const duration = 800;
        const startTime = performance.now();

        const animate = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setDisplayValue(start + (end - start) * eased);

            if (progress < 1) {
                animRef.current = requestAnimationFrame(animate);
            }
        };

        animRef.current = requestAnimationFrame(animate);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [healthFactor]);

    // Get color based on health factor
    const getColor = (hf: number) => {
        if (hf >= 1.25) return { main: '#22c55e', glow: '#22c55e40', label: 'SAFE' };
        if (hf >= 1.05) return { main: '#eab308', glow: '#eab30840', label: 'WARNING' };
        if (hf >= 1.0) return { main: '#ef4444', glow: '#ef444440', label: 'CRITICAL' };
        return { main: '#dc2626', glow: '#dc262640', label: 'LIQUIDATABLE' };
    };

    const color = getColor(displayValue);

    // Draw gauge on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 30;

        // Clear
        ctx.clearRect(0, 0, size, size);

        // Background arc
        const startAngle = 0.75 * Math.PI;
        const endAngle = 2.25 * Math.PI;
        const totalRange = endAngle - startAngle;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Value arc
        const clampedHF = Math.max(0, Math.min(displayValue, 2.0));
        const fillRatio = clampedHF / 2.0;
        const fillEnd = startAngle + totalRange * fillRatio;

        // Gradient for the arc
        const gradient = ctx.createLinearGradient(0, size, size, 0);
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(0.4, '#eab308');
        gradient.addColorStop(0.65, '#22c55e');
        gradient.addColorStop(1, '#10b981');

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, fillEnd);
        ctx.strokeStyle = color.main;
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.shadowColor = color.glow;
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Tick marks
        for (let i = 0; i <= 8; i++) {
            const tickAngle = startAngle + (totalRange * i) / 8;
            const innerR = radius - 24;
            const outerR = radius - 16;
            const x1 = centerX + Math.cos(tickAngle) * innerR;
            const y1 = centerY + Math.sin(tickAngle) * innerR;
            const x2 = centerX + Math.cos(tickAngle) * outerR;
            const y2 = centerY + Math.sin(tickAngle) * outerR;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Threshold lines
        const drawThreshold = (value: number, lineColor: string) => {
            const angle = startAngle + totalRange * (value / 2.0);
            const inner = radius + 12;
            const outer = radius - 12;
            const x1 = centerX + Math.cos(angle) * inner;
            const y1 = centerY + Math.sin(angle) * inner;
            const x2 = centerX + Math.cos(angle) * outer;
            const y2 = centerY + Math.sin(angle) * outer;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        };

        drawThreshold(1.0, '#ef444480');
        drawThreshold(1.05, '#eab30880');
        drawThreshold(1.25, '#22c55e80');

        // Center text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // HF value
        ctx.font = `bold ${size * 0.16}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = color.main;
        ctx.fillText(displayValue.toFixed(2), centerX, centerY - 10);

        // Label
        ctx.font = `600 ${size * 0.055}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Health Factor', centerX, centerY + 20);

        // Status
        ctx.font = `bold ${size * 0.05}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = color.main;
        ctx.fillText(color.label, centerX, centerY + 42);

    }, [displayValue, size, color]);

    const isPulsing = displayValue <= 1.05;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            {/* Pulse ring for critical */}
            {isPulsing && (
                <div
                    className="absolute rounded-full animate-ping"
                    style={{
                        width: size - 20,
                        height: size - 20,
                        backgroundColor: `${color.main}10`,
                        border: `2px solid ${color.main}30`,
                    }}
                />
            )}
            <canvas
                ref={canvasRef}
                style={{ width: size, height: size }}
                className="drop-shadow-2xl"
            />
        </div>
    );
}
