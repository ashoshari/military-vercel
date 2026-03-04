'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, TrendingDown, BarChart3, Building2, Package, DollarSign } from 'lucide-react';
import ChartCard from '@/components/ui/ChartCard';

export default function TimeComparePage() {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    // ── مقارنة 3 سنوات ──
    const comparisonOption = {
        xAxis: { type: 'category' as const, data: months },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
        series: [
            {
                name: '2025',
                type: 'line',
                data: [2100000, 2200000, 2500000, 2300000, 2400000, 2800000, 2600000, 2700000, 2900000, 2750000, 3000000, 3200000],
                lineStyle: { color: '#22c55e', width: 3 },
                itemStyle: { color: '#22c55e' },
                areaStyle: {
                    color: {
                        type: 'linear' as const,
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(34,197,94,0.15)' },
                            { offset: 1, color: 'rgba(34,197,94,0)' },
                        ],
                    },
                },
            },
            {
                name: '2024',
                type: 'line',
                data: [1900000, 2000000, 2200000, 2100000, 2150000, 2500000, 2350000, 2400000, 2600000, 2500000, 2700000, 2900000],
                lineStyle: { color: '#3b82f6', width: 2, type: 'dashed' as const },
                itemStyle: { color: '#3b82f6' },
            },
            {
                name: '2023',
                type: 'line',
                data: [1700000, 1800000, 1900000, 1850000, 1900000, 2200000, 2100000, 2150000, 2300000, 2200000, 2400000, 2600000],
                lineStyle: { color: '#64748b', width: 1, type: 'dotted' as const },
                itemStyle: { color: '#64748b' },
            },
        ],
        legend: { data: ['2025', '2024', '2023'], bottom: 0, left: 'center' },
    };

    // ── نسب الأرباح ──
    const profitRatioOption = {
        xAxis: { type: 'category' as const, data: months },
        yAxis: { type: 'value' as const, axisLabel: { formatter: '{value}%' } },
        series: [
            {
                name: '2025',
                type: 'line',
                smooth: true,
                data: [32, 33, 35, 34, 33, 36, 35, 34, 37, 36, 38, 39],
                lineStyle: { color: '#22c55e', width: 2 },
                itemStyle: { color: '#22c55e' },
            },
            {
                name: '2024',
                type: 'line',
                smooth: true,
                data: [30, 31, 32, 31, 30, 33, 32, 31, 34, 33, 35, 36],
                lineStyle: { color: '#3b82f6', width: 2, type: 'dashed' as const },
                itemStyle: { color: '#3b82f6' },
            },
        ],
        legend: { data: ['2025', '2024'], bottom: 0, left: 'center' },
    };

    // ── النمو الربعي ──
    const yoyGrowthOption = {
        xAxis: { type: 'category' as const, data: ['الربع 1', 'الربع 2', 'الربع 3', 'الربع 4'] },
        yAxis: { type: 'value' as const, axisLabel: { formatter: '{value}%' } },
        series: [
            {
                name: '2025/2024',
                type: 'bar',
                data: [8.5, 10.2, 7.8, 9.1].map((v) => ({
                    value: v,
                    itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] },
                })),
                barWidth: 28,
            },
            {
                name: '2024/2023',
                type: 'bar',
                data: [12.1, 11.5, 10.8, 9.3].map((v) => ({
                    value: v,
                    itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
                })),
                barWidth: 28,
            },
        ],
        legend: { data: ['2025/2024', '2024/2023'], bottom: 0, left: 'center' },
    };

    // ── الأسواق الأعلى مبيعاً ──
    const topMarketsOption = {
        xAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
        yAxis: { type: 'category' as const, data: ['عمّان المركزي', 'إربد الرئيسي', 'فرع الزرقاء', 'العقبة الميناء', 'السلط'], inverse: true },
        series: [
            {
                name: '2025',
                type: 'bar',
                data: [4200000, 3100000, 2800000, 2400000, 1900000].map((v) => ({
                    value: v,
                    itemStyle: { color: '#22c55e', borderRadius: [0, 4, 4, 0] },
                })),
                barWidth: 14,
            },
            {
                name: '2024',
                type: 'bar',
                data: [3800000, 2900000, 2500000, 2200000, 1800000].map((v) => ({
                    value: v,
                    itemStyle: { color: '#334155', borderRadius: [0, 4, 4, 0] },
                })),
                barWidth: 14,
            },
        ],
        legend: { data: ['2025', '2024'], bottom: 0, left: 'center' },
        grid: { left: '22%', right: '8%', top: '10%', bottom: '18%' },
    };

    // ── تحليل القطع المباعة ──
    const unitsSoldOption = {
        xAxis: { type: 'category' as const, data: months },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` } },
        series: [
            {
                name: '2025',
                type: 'bar',
                data: [145000, 152000, 168000, 160000, 165000, 185000, 175000, 180000, 192000, 185000, 200000, 215000].map(
                    (v) => ({ value: v, itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] } })
                ),
                barWidth: 14,
            },
            {
                name: '2024',
                type: 'bar',
                data: [132000, 138000, 150000, 145000, 148000, 165000, 158000, 162000, 172000, 168000, 180000, 195000].map(
                    (v) => ({ value: v, itemStyle: { color: '#334155', borderRadius: [4, 4, 0, 0] } })
                ),
                barWidth: 14,
            },
        ],
        legend: { data: ['2025', '2024'], bottom: 0, left: 'center' },
    };

    const metrics = [
        { label: 'الإيرادات', current: '24.59M', previous: '22.15M', change: '+11.0%', isUp: true },
        { label: 'الأرباح', current: '8.6M', previous: '7.5M', change: '+14.7%', isUp: true },
        { label: 'الطلبات', current: '184.5K', previous: '172.3K', change: '+7.1%', isUp: true },
        { label: 'متوسط السلة', current: '133.25', previous: '128.50', change: '+3.7%', isUp: true },
        { label: 'القطع المباعة', current: '2.12M', previous: '1.96M', change: '+8.2%', isUp: true },
        { label: 'هامش الربح', current: '34.9%', previous: '33.8%', change: '+1.1pp', isUp: true },
    ];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-1"><Clock size={24} style={{ color: 'var(--accent-green)' }} /><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>الأرباح والمقارنة الزمنية</h1></div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>تحليل نسب الأرباح والتغيرات ومقارنة الأداء — التقريران 8 + 13</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {metrics.map((m) => (
                    <motion.div key={m.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-4">
                        <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
                        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }} dir="ltr">{m.current}</p>
                        <div className="flex items-center gap-1 mt-1">
                            {m.isUp ? <TrendingUp size={12} style={{ color: 'var(--accent-green)' }} /> : <TrendingDown size={12} style={{ color: 'var(--accent-red)' }} />}
                            <span className="text-xs font-semibold" style={{ color: m.isUp ? 'var(--accent-green)' : 'var(--accent-red)' }} dir="ltr">{m.change}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <ChartCard title="مقارنة الإيرادات — 3 سنوات" subtitle="الإيرادات الشهرية المقارنة" option={comparisonOption} height="340px" delay={1} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ChartCard title="نسب الأرباح" subtitle="تطور نسبة الأرباح شهرياً" option={profitRatioOption} height="300px" delay={2} />
                <ChartCard title="معدل النمو الربعي" subtitle="مقارنة النمو سنة بسنة" option={yoyGrowthOption} height="300px" delay={3} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ChartCard title="الأسواق الأعلى مبيعاً" subtitle="مقارنة بين العامين" option={topMarketsOption} height="300px" delay={4} />
                <ChartCard title="تحليل القطع المباعة" subtitle="عدد الوحدات المباعة شهرياً" option={unitsSoldOption} height="300px" delay={5} />
            </div>
        </div>
    );
}
