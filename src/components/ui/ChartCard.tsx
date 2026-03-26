'use client';

import React, { useMemo, useState, useCallback, useEffect, useRef, memo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { createPortal } from 'react-dom';
import { ChartTitleFlagBadge, type ChartCardTitleFlag } from './ChartTitleFlagBadge';

export type { ChartCardTitleFlag };

interface ChartCardProps {
    title: string;
    subtitle?: string;
    /** Renders before the title badges/title (inline and fullscreen). */
    titleLeading?: React.ReactNode;
    /** Optional colored flag next to the chart title (inline and fullscreen). */
    titleFlag?: ChartCardTitleFlag;
    /** Optional number shown inside the flag (any `titleFlag` color). */
    titleFlagNumber?: number;
    /** Renders in the header row before the expand control (e.g. level toggles). */
    headerExtra?: React.ReactNode;
    option: Record<string, unknown>;
    height?: string;
    className?: string;
    onExpand?: () => void;
    delay?: number;
    aiPowered?: boolean;
    /** When true, chart initializes only after the card enters the viewport (IntersectionObserver). */
    lazyViewport?: boolean;
    /** Root margin for viewport detection (e.g. prefetch before visible). */
    lazyRootMargin?: string;
    /**
     * Use `visible` when axis titles extend past the plot (e.g. ECharts axis `name`);
     * default `hidden` keeps glass-panel corners clipped cleanly.
     */
    panelOverflow?: 'hidden' | 'visible';
}

function scheduleAfterIdle(cb: () => void): { cancel: () => void } {
    let id: number | ReturnType<typeof setTimeout>;
    if (typeof requestIdleCallback !== 'undefined') {
        id = requestIdleCallback(() => cb(), { timeout: 800 });
        return { cancel: () => cancelIdleCallback(id as number) };
    }
    id = setTimeout(cb, 1);
    return { cancel: () => clearTimeout(id as ReturnType<typeof setTimeout>) };
}

function ChartCard({
    title,
    subtitle,
    titleLeading,
    titleFlag,
    titleFlagNumber,
    headerExtra,
    option,
    height = '320px',
    className = '',
    onExpand,
    delay = 0,
    aiPowered = false,
    lazyViewport = false,
    lazyRootMargin = '100px',
    panelOverflow = 'hidden',
}: ChartCardProps) {
    const mode = useThemeStore((s) => s.mode);
    const isDark = mode === 'dark';
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [chartReady, setChartReady] = useState(false);
    const [inViewport, setInViewport] = useState(!lazyViewport);
    const viewportRef = useRef<HTMLDivElement>(null);
    const fullscreenChartRef = useRef<React.ElementRef<typeof ReactEChartsCore>>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!lazyViewport) return;
        const el = viewportRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') {
            setInViewport(true);
            return;
        }
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setInViewport(true);
                    obs.disconnect();
                }
            },
            { root: null, rootMargin: lazyRootMargin, threshold: 0 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [lazyViewport, lazyRootMargin]);

    useEffect(() => {
        if (!inViewport) return;
        const { cancel } = scheduleAfterIdle(() => {
            if (mountedRef.current) setChartReady(true);
        });
        return () => cancel();
    }, [inViewport]);

    const openFullscreen = useCallback(() => {
        if (onExpand) {
            onExpand();
        } else {
            setIsFullscreen(true);
        }
    }, [onExpand]);

    const resizeFullscreenChart = useCallback(() => {
        fullscreenChartRef.current?.getEchartsInstance?.()?.resize();
    }, []);

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
            extraCssText: `z-index: 100002; box-shadow: ${isDark ? '0 8px 30px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.12)'}; border-radius: 8px;`,
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
        const baseTip = baseTheme.tooltip as { extraCssText?: string };
        const lightTooltipExtra = 'z-index: 100002; box-shadow: 0 4px 12px rgba(0,0,0,0.12); border-radius: 8px;';
        const optTooltipExtra = typeof chartTooltip.extraCssText === 'string' ? String(chartTooltip.extraCssText).trim() : '';
        const darkTooltipExtra = [baseTip.extraCssText, optTooltipExtra].filter(Boolean).join('; ');
        const mergedTooltip = isDark
            ? { ...baseTheme.tooltip, ...chartTooltip, extraCssText: darkTooltipExtra || baseTip.extraCssText }
            : {
                ...chartTooltip,
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                textStyle: { color: '#0f172a', fontSize: 12 },
                extraCssText: optTooltipExtra ? `${optTooltipExtra}; ${lightTooltipExtra}` : lightTooltipExtra,
            };

        const merged: Record<string, unknown> = {
            ...baseTheme,
            ...option,
            tooltip: mergedTooltip,
            grid: { ...baseTheme.grid, ...(option.grid || {}) },
            legend: { ...(baseTheme as { legend: Record<string, unknown> }).legend, ...(((option as { legend?: Record<string, unknown> }).legend || {}) as Record<string, unknown>) },
        };

        if (merged.animation === undefined) {
            merged.animation = false;
        }

        const killSplit = (ax: Record<string, unknown> | undefined) =>
            (ax ? { ...ax, splitLine: { show: false } } : ax);
        if (Array.isArray(merged.xAxis)) merged.xAxis = merged.xAxis.map(killSplit);
        else if (merged.xAxis) merged.xAxis = killSplit(merged.xAxis as Record<string, unknown>);
        if (Array.isArray(merged.yAxis)) merged.yAxis = merged.yAxis.map(killSplit);
        else if (merged.yAxis) merged.yAxis = killSplit(merged.yAxis as Record<string, unknown>);

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

        if (!isDark) {
            const lightAxisStyle = {
                axisLine: { lineStyle: { color: '#e2e8f0' } },
                axisTick: { show: false },
                axisLabel: { color: '#64748b', fontSize: 11 },
                splitLine: { show: false },
            };
            if (Array.isArray(merged.xAxis)) {
                merged.xAxis = merged.xAxis.map((ax: Record<string, unknown>) => ({
                    ...lightAxisStyle,
                    ...ax,
                    axisLine: { lineStyle: { color: '#e2e8f0' } },
                    axisLabel: { color: '#64748b', fontSize: 11 },
                }));
            }
            if (Array.isArray(merged.yAxis)) {
                merged.yAxis = merged.yAxis.map((ax: Record<string, unknown>) => ({
                    ...lightAxisStyle,
                    ...ax,
                    axisLine: { lineStyle: { color: '#e2e8f0' } },
                    axisLabel: { color: '#64748b', fontSize: 11 },
                    splitLine: { show: false },
                }));
            }
        }

        if (!isDark && merged.series) {
            merged.series = (merged.series as Record<string, unknown>[]).map((s) => {
                const ser = s as { type?: string; axisLine?: Record<string, unknown>; detail?: Record<string, unknown> };
                if (ser.type === 'gauge') {
                    const axisLine = ser.axisLine || {};
                    const lineStyle = (axisLine.lineStyle || {}) as Record<string, unknown>;
                    return {
                        ...s,
                        axisLine: {
                            ...axisLine,
                            lineStyle: { ...lineStyle, color: [[1, '#e2e8f0']] },
                        },
                        detail: { ...ser.detail, color: ser.detail?.color },
                    };
                }
                return s;
            });
        }

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

        if (!isDark && merged.visualMap) {
            const vm = merged.visualMap as Record<string, unknown>;
            merged.visualMap = { ...vm, textStyle: { color: '#475569' } };
        }

        const seriesList: Record<string, unknown>[] = !merged.series
            ? []
            : Array.isArray(merged.series)
                ? (merged.series as Record<string, unknown>[])
                : [merged.series as Record<string, unknown>];
        const hasBarSeries = seriesList.some((s) => s.type === 'bar');

        if (hasBarSeries) {
            const spineColor = isDark ? '#64748b' : '#94a3b8';
            const splitLineColor = isDark ? 'rgba(148,163,184,0.22)' : 'rgba(100,116,139,0.3)';

            const enhanceBarCartesianAxis = (ax: Record<string, unknown>): Record<string, unknown> => {
                const t = ax.type as string | undefined;
                if (!ax || (t !== 'category' && t !== 'value' && t !== 'log')) return ax;
                const al = ax.axisLine as Record<string, unknown> | undefined;
                if (al && al.show === false) return ax;

                const tickIn = ax.axisTick as Record<string, unknown> | undefined;
                const forceHideTicks = tickIn && tickIn.show === false;

                const existingLine = (ax.axisLine || {}) as Record<string, unknown>;
                const existingLS = (existingLine.lineStyle || {}) as Record<string, unknown>;

                const next: Record<string, unknown> = {
                    ...ax,
                    axisLine: {
                        show: true,
                        ...existingLine,
                        lineStyle: { width: 2, color: spineColor, ...existingLS },
                    },
                };

                if (forceHideTicks) {
                    next.axisTick = { show: false, ...tickIn };
                } else {
                    const tickLS = (tickIn?.lineStyle || {}) as Record<string, unknown>;
                    next.axisTick = {
                        show: true,
                        length: 5,
                        ...tickIn,
                        lineStyle: { color: spineColor, width: 1, ...tickLS },
                    };
                }
                return next;
            };

            const addValueSplitLines = (ax: Record<string, unknown>): Record<string, unknown> => {
                if (ax.type !== 'value') return ax;
                const al = ax.axisLine as Record<string, unknown> | undefined;
                if (al && al.show === false) return ax;
                const prev = (ax.splitLine || {}) as Record<string, unknown>;
                if (prev.show === false) return ax;
                const prevLs = (prev.lineStyle || {}) as Record<string, unknown>;
                return {
                    ...ax,
                    splitLine: {
                        ...prev,
                        show: true,
                        lineStyle: {
                            type: 'dashed',
                            color: splitLineColor,
                            width: 1,
                            ...prevLs,
                        },
                    },
                };
            };

            const pipeAxis = (ax: Record<string, unknown>) =>
                addValueSplitLines(enhanceBarCartesianAxis(ax));

            if (Array.isArray(merged.xAxis)) {
                merged.xAxis = merged.xAxis.map((ax) => pipeAxis(ax as Record<string, unknown>));
            } else if (merged.xAxis) {
                merged.xAxis = pipeAxis(merged.xAxis as Record<string, unknown>);
            }
            if (Array.isArray(merged.yAxis)) {
                merged.yAxis = merged.yAxis.map((ax) => pipeAxis(ax as Record<string, unknown>));
            } else if (merged.yAxis) {
                merged.yAxis = pipeAxis(merged.yAxis as Record<string, unknown>);
            }
        }

        return merged;
    }, [option, baseTheme, isDark]);

    useEffect(() => {
        if (!isFullscreen) return;
        const run = () => resizeFullscreenChart();
        const raf = requestAnimationFrame(run);
        const t1 = window.setTimeout(run, 80);
        const t2 = window.setTimeout(run, 400);
        return () => {
            cancelAnimationFrame(raf);
            window.clearTimeout(t1);
            window.clearTimeout(t2);
        };
    }, [isFullscreen, resizeFullscreenChart, mergedOption]);

    useEffect(() => {
        if (!isFullscreen) return;
        const onWinResize = () => resizeFullscreenChart();
        window.addEventListener('resize', onWinResize);
        return () => window.removeEventListener('resize', onWinResize);
    }, [isFullscreen, resizeFullscreenChart]);

    const chartEl = (extraHeight?: string, forFullscreen?: boolean) => {
        if (!chartReady) {
            return <div style={{ height: extraHeight || '100%', width: '100%' }} aria-hidden />;
        }
        return (
            <ReactEChartsCore
                ref={forFullscreen ? fullscreenChartRef : undefined}
                echarts={echarts}
                option={mergedOption}
                style={{ height: extraHeight || '100%', width: '100%' }}
                opts={{ renderer: 'canvas' }}
                notMerge={true}
            />
        );
    };

    const showTitleBlock = Boolean(title || subtitle);

    const chartShell = (
        <>
            <div
                className={`flex items-center px-5 pt-4 pb-2 gap-3 ${showTitleBlock ? 'justify-between' : 'justify-end'}`}
            >
                {showTitleBlock && (
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            {titleLeading}
                            {titleFlag && (
                                <ChartTitleFlagBadge flag={titleFlag} flagNumber={titleFlagNumber} size="sm" />
                            )}
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                        </div>
                        {subtitle && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
                    </div>
                )}
                <div className="flex items-center gap-2 shrink-0">
                    {headerExtra}
                    {aiPowered && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,212,255,0.2)' }}>
                            AI
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={openFullscreen}
                        className="p-1.5 rounded-md transition-all hover:scale-110"
                        style={{ color: 'var(--text-muted)' }}
                        title="تكبير الشارت"
                    >
                        <Maximize2 size={14} />
                    </button>
                </div>
            </div>
            <div style={{ height, overflow: panelOverflow === 'visible' ? 'visible' : undefined }}>
                {chartEl()}
            </div>
        </>
    );

    return (
        <>
            <motion.div
                ref={lazyViewport ? viewportRef : undefined}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: delay * 0.1 }}
                className={`glass-panel ${panelOverflow === 'visible' ? 'overflow-visible' : 'overflow-hidden'} ${aiPowered ? 'ai-module glow-cyan' : ''} ${className}`}
            >
                {chartShell}
            </motion.div>

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
                            padding: '12px',
                        }}
                        onClick={() => setIsFullscreen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.93, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`glass-panel ${panelOverflow === 'visible' ? 'overflow-visible' : 'overflow-hidden'}`}
                            style={{
                                width: 'min(96vw, 1600px)',
                                height: 'min(92vh, calc(100dvh - 24px))',
                                maxHeight: '96vh',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div
                                className={`flex items-center px-6 py-3 border-b gap-3 ${showTitleBlock ? 'justify-between' : 'justify-end'}`}
                                style={{ borderColor: 'var(--border-subtle)', flexShrink: 0 }}
                            >
                                {showTitleBlock && (
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2.5">
                                            {titleLeading}
                                            {titleFlag && (
                                                <ChartTitleFlagBadge flag={titleFlag} flagNumber={titleFlagNumber} size="lg" />
                                            )}
                                            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
                                        </div>
                                        {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 shrink-0">
                                    {headerExtra}
                                    <button
                                        type="button"
                                        onClick={() => setIsFullscreen(false)}
                                        className="p-2 rounded-lg transition-all hover:scale-110"
                                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                                    {chartEl('100%', true)}
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

export default memo(ChartCard);

export { buildMonthQuarterYearXAxes, buildThreeYearMonthQuarterYearXAxes } from './chartMonthQuarterYearXAxis';
export type { BuildMonthQuarterYearXAxesParams, BuildThreeYearMonthQuarterYearXAxesParams } from './chartMonthQuarterYearXAxis';
