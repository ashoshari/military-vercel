'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, TrendingUp, BarChart3, Undo2, DollarSign } from 'lucide-react';
import ChartCard from '@/components/ui/ChartCard';
import AIBadge from '@/components/ui/AIBadge';
import { getForecastData } from '@/lib/mockData';

export default function AIForecastPage() {
    const forecastData = useMemo(() => getForecastData(), []);
    const futureData = forecastData.filter((d) => d.actual === null);
    const avgConfidence = forecastData.reduce((a, b) => a + b.confidence, 0) / forecastData.length;

    const forecastOption = {
        xAxis: { type: 'category' as const, data: forecastData.map((d) => d.date), axisLabel: { rotate: 30, fontSize: 10 } },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
        series: [
            {
                name: 'الفعلي',
                type: 'line',
                data: forecastData.map((d) => d.actual),
                lineStyle: { color: '#22c55e', width: 2 },
                itemStyle: { color: '#22c55e' },
            },
            {
                name: 'المتوقع',
                type: 'line',
                data: forecastData.map((d) => d.predicted),
                lineStyle: { color: '#0ea5e9', width: 2 },
                itemStyle: { color: '#0ea5e9' },
            },
            {
                name: 'الحد الأعلى',
                type: 'line',
                data: forecastData.map((d) => d.upperBound),
                lineStyle: { opacity: 0 },
                itemStyle: { opacity: 0 },
                areaStyle: { color: 'rgba(14,165,233,0.06)' },
                stack: 'band',
            },
            {
                name: 'الحد الأدنى',
                type: 'line',
                data: forecastData.map((d) => d.lowerBound),
                lineStyle: { opacity: 0 },
                itemStyle: { opacity: 0 },
                areaStyle: { color: 'rgba(14,165,233,0.06)' },
                stack: 'band',
            },
        ],
        legend: { data: ['الفعلي', 'المتوقع'], bottom: 0, left: 'center' },
        grid: { bottom: '18%' },
    };

    // ── توقع الأرباح ──
    const profitForecastOption = {
        xAxis: { type: 'category' as const, data: futureData.map((d) => d.date) },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
        series: [
            {
                name: 'الأرباح المتوقعة',
                type: 'bar',
                data: futureData.map((d) => ({
                    value: Math.round(d.predicted * 0.35),
                    itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] },
                })),
                barWidth: 28,
            },
            {
                name: 'المبيعات المتوقعة',
                type: 'line',
                data: futureData.map((d) => d.predicted),
                lineStyle: { color: '#0ea5e9', width: 2 },
                itemStyle: { color: '#0ea5e9' },
            },
        ],
        legend: { data: ['الأرباح المتوقعة', 'المبيعات المتوقعة'], bottom: 0, left: 'center' },
    };

    // ── توقع المرتجعات ──
    const returnsForecastOption = {
        xAxis: { type: 'category' as const, data: futureData.map((d) => d.date) },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` } },
        series: [{
            name: 'المرتجعات المتوقعة',
            type: 'bar',
            data: futureData.map((d) => ({
                value: Math.round(d.predicted * 0.048),
                itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0], opacity: 0.7 },
            })),
            barWidth: 28,
        }],
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg" style={{ background: 'var(--accent-cyan-dim)', border: '1px solid rgba(8,145,178,0.2)' }}>
                            <Brain size={20} style={{ color: 'var(--accent-cyan)' }} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>توقع المبيعات بالذكاء الاصطناعي</h1>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>مبيعات + أرباح + مرتجعات متوقعة — التقرير الحادي عشر</p>
                        </div>
                    </div>
                </div>
                <AIBadge label="LSTM + XGBoost" size="md" confidence={avgConfidence} />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { icon: Brain, label: 'دقة النموذج', value: `${avgConfidence.toFixed(1)}%`, color: 'var(--accent-green)' },
                    { icon: DollarSign, label: 'المبيعات المتوقعة', value: `${(futureData.reduce((a, b) => a + b.predicted, 0) / 1000000).toFixed(1)}M`, color: 'var(--accent-cyan)' },
                    { icon: TrendingUp, label: 'الأرباح المتوقعة', value: `${(futureData.reduce((a, b) => a + b.predicted * 0.35, 0) / 1000000).toFixed(1)}M`, color: 'var(--accent-green)' },
                    { icon: Undo2, label: 'المرتجعات المتوقعة', value: `${(futureData.reduce((a, b) => a + b.predicted * 0.048, 0) / 1000000).toFixed(2)}M`, color: 'var(--accent-red)' },
                ].map((s) => (
                    <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel ai-module p-4">
                        <div className="flex items-center gap-2 mb-2"><s.icon size={14} style={{ color: s.color }} /><span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>{s.label}</span></div>
                        <p className="text-lg font-bold" style={{ color: s.color }} dir="ltr">{s.value}</p>
                    </motion.div>
                ))}
            </div>

            <ChartCard title="الفعلي مقابل المتوقع" subtitle="البيانات التاريخية مع نطاق الثقة" option={forecastOption} height="380px" aiPowered delay={1} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ChartCard title="توقع الأرباح" subtitle="الأرباح والمبيعات المتوقعة للأشهر القادمة" option={profitForecastOption} height="320px" aiPowered delay={2} />
                <ChartCard title="توقع المرتجعات" subtitle="المرتجعات المتوقعة بناءً على الأنماط التاريخية" option={returnsForecastOption} height="320px" aiPowered delay={3} />
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-panel ai-module p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>مقياس ثقة التنبؤ</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    {futureData.map((d) => (
                        <div key={d.date} className="text-center p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{d.date}</p>
                            <div className="relative w-12 h-12 mx-auto mb-2">
                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
                                    <circle cx="24" cy="24" r="20" fill="none" stroke={d.confidence >= 80 ? 'var(--accent-green)' : d.confidence >= 70 ? 'var(--accent-amber)' : 'var(--accent-red)'}
                                        strokeWidth="3" strokeLinecap="round" strokeDasharray={`${d.confidence * 1.256} ${125.6 - d.confidence * 1.256}`} />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: 'var(--text-primary)' }} dir="ltr">{d.confidence.toFixed(0)}%</span>
                            </div>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }} dir="ltr">{(d.predicted / 1000000).toFixed(1)}M</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
