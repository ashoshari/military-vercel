'use client';

import React, { useMemo, useState, useCallback } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, ScatterChart, GraphChart, TreemapChart, HeatmapChart, RadarChart, GaugeChart } from 'echarts/charts';
import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    DataZoomComponent,
    ToolboxComponent,
    MarkLineComponent,
    VisualMapComponent,
    RadarComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { createPortal } from 'react-dom';

echarts.use([
    BarChart, LineChart, PieChart, ScatterChart, GraphChart, TreemapChart, HeatmapChart, RadarChart, GaugeChart,
    GridComponent, TooltipComponent, LegendComponent,
    DataZoomComponent, ToolboxComponent, MarkLineComponent, VisualMapComponent, RadarComponent,
    CanvasRenderer,
]);

interface ChartCardProps {
    title: string;
    subtitle?: string;
    option: Record<string, unknown>;
    height?: string;
    className?: string;
    onExpand?: () => void;
    delay?: number;
    aiPowered?: boolean;
}

export default function ChartCard({
    title,
    subtitle,
    option,
    height = '320px',
    className = '',
    onExpand,
    delay = 0,
    aiPowered = false,
}: ChartCardProps) {
    const mode = useThemeStore((s) => s.mode);
    const isDark = mode === 'dark';
    const [isFullscreen, setIsFullscreen] = useState(false);

    const openFullscreen = useCallback(() => {
        if (onExpand) {
            onExpand();
        } else {
            setIsFullscreen(true);
        }
    }, [onExpand]);

    const baseTheme = useMemo(() => ({
        backgroundColor: 'transparent',
        textStyle: {
            color: isDark ? '#94a3b8' : '#475569',
            fontFamily: "'Noto Sans Arabic', 'Inter', sans-serif",
        },
        legend: {
            textStyle: { color: isDark ? '#94a3b8' : '#475569', fontSize: 11 },
            icon: 'roundRect',
            itemWidth: 12,
            itemHeight: 8,
            top: 'auto',
            bottom: 8,
        },
        grid: {
            left: '3%', right: '4%', bottom: '18%', top: '10%',
            containLabel: true,
        },
        tooltip: {
            backgroundColor: isDark ? '#1a2035' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            textStyle: { color: isDark ? '#e2e8f0' : '#0f172a', fontSize: 12 },
            extraCssText: `box-shadow: ${isDark ? '0 8px 30px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.12)'}; border-radius: 8px;`,
        },
        xAxis: {
            axisLine: { lineStyle: { color: isDark ? '#1e293b' : '#e2e8f0' } },
            axisTick: { lineStyle: { color: isDark ? '#1e293b' : '#e2e8f0' } },
            axisLabel: { color: isDark ? '#64748b' : '#64748b', fontSize: 11 },
            splitLine: { show: false },
        },
        yAxis: {
            axisLine: { lineStyle: { color: isDark ? '#1e293b' : '#e2e8f0' } },
            axisTick: { show: false },
            axisLabel: { color: isDark ? '#64748b' : '#64748b', fontSize: 11 },
            splitLine: { show: false },
        },
    }), [isDark]);

    const mergedOption = useMemo(() => {
        const chartTooltip = (option.tooltip || {}) as Record<string, unknown>;
        // In light mode: theme wins on bg/border/text; in dark: chart wins (already has correct colors)
        const mergedTooltip = isDark
            ? { ...baseTheme.tooltip, ...chartTooltip }
            : {
                ...chartTooltip,
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                textStyle: { color: '#0f172a', fontSize: 12 },
                extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.12); border-radius: 8px;',
            };

        const merged: Record<string, any> = {
            ...baseTheme,
            ...option,
            tooltip: mergedTooltip,
            grid: { ...baseTheme.grid, ...(option.grid || {}) },
            legend: { ...(baseTheme as any).legend, ...(((option as any).legend || {}) as Record<string, unknown>) },
        };

        // ── Force remove all grid splitLines globally ──
        const killSplit = (ax: any) => (ax ? { ...ax, splitLine: { show: false } } : ax);
        if (Array.isArray(merged.xAxis)) merged.xAxis = merged.xAxis.map(killSplit);
        else if (merged.xAxis) merged.xAxis = killSplit(merged.xAxis);
        if (Array.isArray(merged.yAxis)) merged.yAxis = merged.yAxis.map(killSplit);
        else if (merged.yAxis) merged.yAxis = killSplit(merged.yAxis);

        // Fix radar axis names and graph/pie/treemap labels for light mode
        if (!isDark && merged.series) {
            const series = merged.series as Record<string, unknown>[];
            const fixedSeries = series.map((s: Record<string, unknown>) => {
                const type = s.type as string;
                if (type === 'graph' || type === 'pie' || type === 'treemap') {
                    const label = (s.label || {}) as Record<string, unknown>;
                    return { ...s, label: { ...label, color: label.color === '#e2e8f0' ? '#0f172a' : (label.color || '#475569') } };
                }
                if (type === 'heatmap') {
                    const label = (s.label || {}) as Record<string, unknown>;
                    return { ...s, label: { ...label, color: label.color === '#e2e8f0' ? '#0f172a' : (label.color || '#0f172a') } };
                }
                // Fix bar/line labels that use hardcoded dark colors
                if (type === 'bar' || type === 'line') {
                    const label = (s.label || {}) as Record<string, unknown>;
                    if (label.color === '#fff' || label.color === '#e2e8f0') {
                        return { ...s, label: { ...label, color: '#475569' } };
                    }
                }
                return s;
            });
            merged.series = fixedSeries;
        }

        // Fix xAxis/yAxis arrays (multi-axis charts)
        if (!isDark) {
            const lightAxisStyle = {
                axisLine: { lineStyle: { color: '#e2e8f0' } },
                axisTick: { show: false },
                axisLabel: { color: '#64748b', fontSize: 11 },
                splitLine: { show: false },
            };
            if (Array.isArray(merged.xAxis)) {
                merged.xAxis = merged.xAxis.map((ax: Record<string, unknown>) => ({ ...lightAxisStyle, ...ax, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#64748b', fontSize: 11 } }));
            }
            if (Array.isArray(merged.yAxis)) {
                merged.yAxis = merged.yAxis.map((ax: Record<string, unknown>) => ({ ...lightAxisStyle, ...ax, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#64748b', fontSize: 11 }, splitLine: { show: false } }));
            }
        }

        // Fix gauge axisLine track in light mode
        if (!isDark && merged.series) {
            merged.series = (merged.series as any[]).map((s: any) => {
                if (s.type === 'gauge') {
                    return {
                        ...s,
                        axisLine: { ...s.axisLine, lineStyle: { ...(s.axisLine?.lineStyle || {}), color: [[1, '#e2e8f0']] } },
                        detail: { ...s.detail, color: s.detail?.color },
                    };
                }
                return s;
            });
        }

        // Fix radar axisName color in light mode
        if (!isDark && merged.radar) {
            const radar = merged.radar as Record<string, unknown>;
            const axisName = (radar.axisName || {}) as Record<string, unknown>;
            merged.radar = {
                ...radar,
                axisName: { ...axisName, color: '#475569' },
                axisLine: { lineStyle: { color: '#e2e8f0' } },
                splitLine: { lineStyle: { color: '#e2e8f0' } },
                splitArea: { areaStyle: { color: ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0)'] } },
            };
        }

        // Fix visualMap text in light mode
        if (!isDark && merged.visualMap) {
            const vm = merged.visualMap as Record<string, unknown>;
            merged.visualMap = { ...vm, textStyle: { color: '#475569' } };
        }

        return merged;
    }, [option, baseTheme, isDark]);

    const chartEl = (extraHeight?: string) => (
        <ReactEChartsCore
            echarts={echarts}
            option={mergedOption}
            style={{ height: extraHeight || '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
            notMerge={true}
        />
    );

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: delay * 0.1 }}
                className={`glass-panel overflow-hidden ${aiPowered ? 'ai-module glow-cyan' : ''} ${className}`}
            >
                {(title || subtitle) && (
                    <div className="flex items-center justify-between px-5 pt-4 pb-2">
                        <div>
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                            {subtitle && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            {aiPowered && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                    style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,212,255,0.2)' }}>
                                    AI
                                </span>
                            )}
                            <button
                                onClick={openFullscreen}
                                className="p-1.5 rounded-md transition-all hover:scale-110"
                                style={{ color: 'var(--text-muted)' }}
                                title="تكبير الشارت"
                            >
                                <Maximize2 size={14} />
                            </button>
                        </div>
                    </div>
                )}
                <div style={{ height }}>
                    {chartEl()}
                </div>
            </motion.div>

            {/* ── Fullscreen Modal ── */}
            {typeof window !== 'undefined' && isFullscreen && createPortal(
                <AnimatePresence>
                    <motion.div
                        key="fs-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: isDark ? 'rgba(5,9,18,0.85)' : 'rgba(15,23,42,0.5)',
                            backdropFilter: 'blur(6px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '24px',
                        }}
                        onClick={() => setIsFullscreen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.93, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-panel overflow-hidden"
                            style={{ width: '92vw', maxWidth: 1200, minHeight: '85vh', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-subtle)', flexShrink: 0 }}>
                                <div>
                                    <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
                                    {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
                                </div>
                                <button
                                    onClick={() => setIsFullscreen(false)}
                                    className="p-2 rounded-lg transition-all hover:scale-110"
                                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            {/* Chart fills the rest — full height so ECharts can use it */}
                            <div style={{ flex: 1, minHeight: 0, padding: '8px 0', position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                                    {chartEl('100%')}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
