'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Award, Scale, TrendingUp, BarChart3 } from 'lucide-react';
import ChartCard from '@/components/ui/ChartCard';
import EnterpriseTable from '@/components/ui/EnterpriseTable';
import type { TableColumn } from '@/components/ui/EnterpriseTable';
import { getBranchData, getRegionalData, type BranchData } from '@/lib/mockData';
import BranchMap from '@/components/ui/BranchMap';
import BranchSalesTable from '@/components/ui/BranchSalesTable';

// ── بيانات الأداء المرجّح لكل فرع ──
const branchScores = [
    { id: 'b1', name: 'سوق المنارة', salesContrib: 77.14, transContrib: 54.3, profitMargin: 18.89, avgBasket: 18, voidVol: 3.15, score: 59 },
    { id: 'b2', name: 'سوق سطح النجم', salesContrib: 22.87, transContrib: 28.19, profitMargin: 25.12, avgBasket: 1, voidVol: 0.15, score: 38 },
    { id: 'b3', name: 'سوق القويسمة', salesContrib: 45.20, transContrib: 38.50, profitMargin: 21.80, avgBasket: 9, voidVol: 1.20, score: 72 },
    { id: 'b4', name: 'سوق راس العين', salesContrib: 18.60, transContrib: 22.10, profitMargin: 19.40, avgBasket: 5, voidVol: 0.90, score: 55 },
    { id: 'b5', name: 'سوق البقعة', salesContrib: 62.80, transContrib: 48.70, profitMargin: 23.10, avgBasket: 14, voidVol: 2.10, score: 81 },
    { id: 'b6', name: 'سوق الدمام', salesContrib: 33.40, transContrib: 30.20, profitMargin: 17.60, avgBasket: 7, voidVol: 1.80, score: 46 },
    { id: 'b7', name: 'سوق الخبر', salesContrib: 55.90, transContrib: 44.30, profitMargin: 26.30, avgBasket: 12, voidVol: 0.60, score: 75 },
    { id: 'b8', name: 'سوق جدة', salesContrib: 28.10, transContrib: 25.80, profitMargin: 15.90, avgBasket: 4, voidVol: 2.40, score: 35 },
];

// ── أداء فئات المنتجات لكل فرع ──
const categoryScores = [
    { cat: 'أجهزة وإلكترونيات', b1: 60, b2: 20, b3: 85, b4: 55, b5: 90, b6: 40, b7: 78, b8: 25 },
    { cat: 'العناية الشخصية', b1: 78, b2: 41, b3: 72, b4: 60, b5: 88, b6: 50, b7: 82, b8: 38 },
    { cat: 'غير مصنف', b1: 91, b2: 28, b3: 65, b4: 35, b5: 76, b6: 45, b7: 70, b8: 22 },
    { cat: 'فرفاشية', b1: 30, b2: 20, b3: 45, b4: 28, b5: 55, b6: 22, b7: 48, b8: 18 },
    { cat: 'مستلزمات الأطفال', b1: 79, b2: 42, b3: 80, b4: 58, b5: 85, b6: 48, b7: 75, b8: 35 },
    { cat: 'مستلزمات منزلية', b1: 78, b2: 43, b3: 74, b4: 62, b5: 89, b6: 52, b7: 80, b8: 40 },
    { cat: 'منتجات غذائية', b1: 78, b2: 42, b3: 82, b4: 65, b5: 92, b6: 55, b7: 84, b8: 38 },
    { cat: 'منتجات ورقية', b1: 78, b2: 42, b3: 70, b4: 50, b5: 83, b6: 45, b7: 72, b8: 30 },
    { cat: 'مسطحات', b1: 78, b2: 42, b3: 75, b4: 55, b5: 86, b6: 48, b7: 76, b8: 32 },
];

function getBarColor(score: number) {
    if (score >= 70) return '#00e5a0'; // --accent-green
    if (score >= 50) return '#f59e0b'; // --accent-amber
    if (score >= 30) return '#f97316';
    return '#ef4444'; // --accent-red
}

export default function BranchesPage() {
    const branches = useMemo(() => getBranchData(), []);
    const regions = useMemo(() => getRegionalData(), []);
    const topBranch = [...branches].sort((a, b) => b.revenue - a.revenue)[0];
    const avgScore = Math.round(branchScores.reduce((a, b) => a + b.score, 0) / branchScores.length);

    // ── Custom SVG Gauge ──
    const gaugeRadius = 90;
    const gaugeStroke = 14;
    const gaugeCenter = gaugeRadius + gaugeStroke + 8;
    const svgSize = gaugeCenter * 2;
    const startAngle = 220;
    const endAngle = -40;
    const totalAngle = startAngle - endAngle; // 260°
    const scoreAngle = startAngle - (avgScore / 100) * totalAngle;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const arcPath = (r: number, sA: number, eA: number) => {
        const sx = gaugeCenter + r * Math.cos(toRad(sA));
        const sy = gaugeCenter - r * Math.sin(toRad(sA));
        const ex = gaugeCenter + r * Math.cos(toRad(eA));
        const ey = gaugeCenter - r * Math.sin(toRad(eA));
        const large = sA - eA > 180 ? 1 : 0;
        return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
    };

    const sortedBranches = [...branchScores].sort((a, b) => b.score - a.score);

    // ── أداء الفروع (شريط ملون) ──
    const branchPerfOption = {
        xAxis: {
            type: 'category' as const,
            data: branchScores.map(b => b.name.split(' ').slice(0, 2).join(' ')),
            axisLabel: { rotate: branchScores.length > 4 ? 30 : 0, fontSize: 10 },
        },
        yAxis: { type: 'value' as const, max: 100, axisLabel: { formatter: '{value}%' } },
        series: [{
            type: 'bar',
            data: branchScores.map(b => ({
                value: b.score,
                itemStyle: { color: getBarColor(b.score), borderRadius: [4, 4, 0, 0] },
                label: { show: true, position: 'top', formatter: `${b.score}%`, color: getBarColor(b.score), fontSize: 11, fontWeight: 'bold' },
            })),
            barWidth: Math.max(16, Math.min(36, 200 / branchScores.length)),
        }],
        grid: { bottom: '18%', top: '20%' },
    };

    // ── أداء فئات المنتجات (مجمّع لكل الفروع) ──
    const branchKeys = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'] as const;
    const branchColors = ['#2563eb', '#d97706', '#047857', '#7c3aed', '#0891b2', '#dc2626', '#059669', '#9333ea'];
    const categoryPerfOption = {
        tooltip: {
            trigger: 'axis' as const,
            formatter: (params: { seriesName: string; value: number }[]) =>
                params.map(p => `${p.seriesName}: <b>${p.value}%</b>`).join('<br/>'),
        },
        legend: {
            data: branchScores.map(b => b.name),
            bottom: 0,
            textStyle: { fontSize: 9 },
            type: 'scroll' as const,
        },
        dataZoom: [{ type: 'inside' as const }],
        grid: { bottom: '22%', top: '8%', left: '3%', right: '3%', containLabel: true },
        xAxis: {
            type: 'category' as const,
            data: categoryScores.map(c => c.cat),
            axisLabel: { rotate: 25, fontSize: 9 },
        },
        yAxis: {
            type: 'value' as const,
            max: 100,
            axisLabel: { formatter: '{value}%', fontSize: 9 },
        },
        series: branchScores.map((b, bi) => ({
            name: b.name,
            type: 'bar',
            barMaxWidth: 12,
            data: categoryScores.map(c => {
                const val = (c as unknown as Record<string, number>)[branchKeys[bi]] ?? 0;
                return {
                    value: val,
                    itemStyle: {
                        color: branchColors[bi],
                        borderRadius: [3, 3, 0, 0],
                        opacity: val >= 70 ? 1 : val >= 50 ? 0.85 : val >= 30 ? 0.7 : 0.55,
                    },
                };
            }),
        })),
    };

    // ── نسبة المبيعات حسب المجموعة ──
    const salesByGroupOption = {
        xAxis: { type: 'category' as const, data: branches.slice(0, 6).map((b) => b.nameAr.split(' ')[0]), axisLabel: { fontSize: 10 } },
        yAxis: { type: 'value' as const, max: 100, axisLabel: { formatter: '{value}%' } },
        series: [
            { name: 'بقالة', type: 'bar', stack: 'total', data: [40, 35, 42, 38, 45, 37], itemStyle: { color: '#047857' } },
            { name: 'لحوم', type: 'bar', stack: 'total', data: [22, 25, 20, 23, 18, 24], itemStyle: { color: '#2563eb' } },
            { name: 'ألبان', type: 'bar', stack: 'total', data: [15, 18, 14, 16, 15, 17], itemStyle: { color: '#7c3aed' } },
            { name: 'مشروبات', type: 'bar', stack: 'total', data: [12, 10, 13, 11, 12, 11], itemStyle: { color: '#d97706' } },
            { name: 'أخرى', type: 'bar', stack: 'total', data: [11, 12, 11, 12, 10, 11], itemStyle: { color: '#64748b', borderRadius: [4, 4, 0, 0] } },
        ],
        legend: { data: ['بقالة', 'لحوم', 'ألبان', 'مشروبات', 'أخرى'], top: 0, left: 0 },
    };

    const branchColumns: TableColumn<BranchData>[] = [
        { key: 'nameAr', header: 'الفرع', sortable: true },
        { key: 'regionAr', header: 'المنطقة', sortable: true },
        { key: 'revenue', header: 'الإيرادات', sortable: true, align: 'right', format: 'currency' },
        { key: 'orders', header: 'الطلبات', sortable: true, align: 'right', format: 'number' },
        { key: 'customers', header: 'العملاء', sortable: true, align: 'right', format: 'number' },
        { key: 'growth', header: 'النمو', sortable: true, align: 'right', format: 'change' },
        {
            key: 'performance', header: 'الأداء', sortable: true, align: 'center', render: (val: unknown) => {
                const v = Number(val);
                const color = v >= 85 ? 'var(--accent-green)' : v >= 70 ? 'var(--accent-amber)' : 'var(--accent-red)';
                return (
                    <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                            <div className="h-full rounded-full" style={{ width: `${v}%`, background: color }} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color }} dir="ltr">{v}%</span>
                    </div>
                );
            }
        },
    ];

    const scoreColor = (v: number) => v >= 70 ? 'var(--accent-green)' : v >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)';

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-1"><Building2 size={24} style={{ color: 'var(--accent-green)' }} /><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>أداء الفروع والشركات</h1></div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Branches & Product Category Performance Scores — التقرير الثاني</p>
            </motion.div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Building2, label: 'إجمالي الفروع', value: branches.length, color: 'var(--accent-green)' },
                    { icon: MapPin, label: 'المناطق', value: regions.length, color: 'var(--accent-blue)' },
                    { icon: Award, label: 'الأفضل أداءً', value: topBranch?.nameAr?.split(' ')[0] || '', color: 'var(--accent-amber)' },
                    { icon: Scale, label: 'متوسط الأداء', value: `${avgScore}%`, color: avgScore >= 70 ? 'var(--accent-green)' : 'var(--accent-amber)' },
                ].map((s) => (
                    <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-4">
                        <div className="flex items-center gap-2 mb-2"><s.icon size={14} style={{ color: s.color }} /><span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>{s.label}</span></div>
                        <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── القسم الأول: Gauge + الأوزان المعيارية + أداء الفروع ── */}
            <div className="glass-panel p-0 overflow-hidden">
                <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-2">
                        <BarChart3 size={16} style={{ color: 'var(--accent-blue)' }} />
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>تقييم أداء الفروع وفئات المنتجات</h3>
                    </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-0">
                    {/* Custom SVG Gauge */}
                    <div className="p-5 border-b xl:border-b-0 xl:border-l flex flex-col items-center" style={{ borderColor: 'var(--border-subtle)' }}>
                        <p className="text-[11px] font-semibold mb-3 self-end" style={{ color: 'var(--text-muted)' }}>متوسط درجة أداء الفروع الكلية</p>
                        <svg width={svgSize} height={gaugeCenter + 28} viewBox={`0 0 ${svgSize} ${gaugeCenter + 28}`} style={{ overflow: 'visible' }}>
                            <defs>
                                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="40%" stopColor="#f59e0b" />
                                    <stop offset="100%" stopColor="#00e5a0" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                            </defs>
                            {/* Background track */}
                            <path d={arcPath(gaugeRadius, startAngle, endAngle)} fill="none" stroke="var(--bg-elevated)" strokeWidth={gaugeStroke} strokeLinecap="round" />
                            {/* Gradient progress arc */}
                            <path d={arcPath(gaugeRadius, startAngle, scoreAngle)} fill="none" stroke="url(#gaugeGrad)" strokeWidth={gaugeStroke} strokeLinecap="round" filter="url(#glow)" />
                            {/* Tick marks */}
                            {[0, 25, 50, 75, 100].map(v => {
                                const a = startAngle - (v / 100) * totalAngle;
                                const ix = gaugeCenter + (gaugeRadius - gaugeStroke - 4) * Math.cos(toRad(a));
                                const iy = gaugeCenter - (gaugeRadius - gaugeStroke - 4) * Math.sin(toRad(a));
                                const ox = gaugeCenter + (gaugeRadius + gaugeStroke / 2 + 6) * Math.cos(toRad(a));
                                const oy = gaugeCenter - (gaugeRadius + gaugeStroke / 2 + 6) * Math.sin(toRad(a));
                                return (
                                    <g key={v}>
                                        <line x1={gaugeCenter + (gaugeRadius - 6) * Math.cos(toRad(a))} y1={gaugeCenter - (gaugeRadius - 6) * Math.sin(toRad(a))} x2={ix} y2={iy} stroke="var(--text-muted)" strokeWidth="1" opacity="0.4" />
                                        <text x={ox} y={oy + 3} textAnchor="middle" fontSize="8" fill="var(--text-muted)">{v}</text>
                                    </g>
                                );
                            })}
                            {/* Center score */}
                            <text x={gaugeCenter} y={gaugeCenter - 8} textAnchor="middle" fontSize="34" fontWeight="800" fill={avgScore >= 70 ? '#00e5a0' : avgScore >= 50 ? '#f59e0b' : '#ef4444'}>
                                {avgScore}%
                            </text>
                            <text x={gaugeCenter} y={gaugeCenter + 14} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
                                متوسط الأداء العام
                            </text>
                        </svg>

                        {/* Mini branch scores list */}
                        <div className="w-full mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                            {sortedBranches.map(b => (
                                <div key={b.id} className="flex items-center gap-1.5">
                                    <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                                        <div className="h-full rounded-full transition-all" style={{ width: `${b.score}%`, background: getBarColor(b.score) }} />
                                    </div>
                                    <span className="text-[9px] font-bold w-7 text-left" style={{ color: getBarColor(b.score) }} dir="ltr">{b.score}%</span>
                                    <span className="text-[9px] truncate max-w-[70px]" style={{ color: 'var(--text-muted)' }}>{b.name.split(' ').slice(1).join(' ')}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* الأوزان المعيارية */}
                    <div className="xl:col-span-2 p-5">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                            {[
                                { label: `إجمالي المبيعات المعيارية\n(الوزن 30%)`, value: '10%' },
                                { label: `نمو المبيعات المعياري\n(الوزن 20%)`, value: '7%' },
                                { label: `هامش الربح المعياري\n(الوزن 20%)`, value: '11%' },
                                { label: `متوسط السلة المعياري\n(الوزن 20%)`, value: '7%' },
                                { label: `معدل الحذف المعياري\n(الوزن 10%)`, value: '7%' },
                            ].map(k => (
                                <div key={k.label} className="text-center">
                                    <p className="text-[9px] leading-tight mb-1 whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
                                    <p className="text-xl font-bold" style={{ color: 'var(--accent-blue)' }}>{k.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* جدول الفروع المرجّح */}
                        <div className="overflow-x-auto">
                            <table className="enterprise-table">
                                <thead>
                                    <tr>
                                        <th>اسم الفرع</th>
                                        <th style={{ textAlign: 'center' }}>مساهمة المبيعات</th>
                                        <th style={{ textAlign: 'center' }}>مساهمة المعاملات</th>
                                        <th style={{ textAlign: 'center' }}>هامش الربح</th>
                                        <th style={{ textAlign: 'center' }}>متوسط السلة</th>
                                        <th style={{ textAlign: 'center' }}>حجم الحذف</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {branchScores.map(b => (
                                        <tr key={b.id}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{b.name}</td>
                                            <td>
                                                <div className="flex items-center gap-1">
                                                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)', minWidth: '60px' }}>
                                                        <div className="h-full rounded-full" style={{ width: `${b.salesContrib}%`, background: '#2563eb' }} />
                                                    </div>
                                                    <span className="text-[10px] font-semibold" style={{ color: '#2563eb' }} dir="ltr">{b.salesContrib.toFixed(2)}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1">
                                                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)', minWidth: '60px' }}>
                                                        <div className="h-full rounded-full" style={{ width: `${b.transContrib}%`, background: '#7c3aed' }} />
                                                    </div>
                                                    <span className="text-[10px] font-semibold" style={{ color: '#7c3aed' }} dir="ltr">{b.transContrib.toFixed(2)}%</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="text-xs font-semibold" style={{ color: 'var(--accent-green)' }} dir="ltr">{b.profitMargin.toFixed(2)}%</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }} dir="ltr">{b.avgBasket}</span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="text-xs" style={{ color: 'var(--accent-amber)' }} dir="ltr">{b.voidVol}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Overall Branch Performance Score (bar chart) ── */}
            <div className="glass-panel overflow-hidden">
                <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>درجة أداء الفروع الكلية</h3>
                    <div className="flex items-center gap-3 mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <span>درجة أداء الفروع</span>
                        {branchScores.map(b => (
                            <span key={b.id} className="font-semibold" style={{ color: getBarColor(b.score) }}>{b.score}%</span>
                        ))}
                        <div className="flex items-center gap-1">
                            <div style={{ background: `linear-gradient(to right, #ef4444, #f59e0b, #00e5a0)` }} className="w-12 h-2 rounded-full" />
                            <span>25% → 55% → 70%</span>
                        </div>
                    </div>
                </div>
                <ChartCard title="" option={branchPerfOption} height="280px" />
            </div>

            {/* ── درجة أداء فئات المنتجات ── */}
            <div className="glass-panel overflow-hidden">
                <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>درجة أداء فئات المنتجات الكلية</h3>
                    <div className="flex items-center gap-4 mt-1 text-[10px]">
                        <span style={{ color: 'var(--text-muted)' }}>درجة أداء فئات المنتجات</span>
                        <span className="font-semibold" style={{ color: '#ef4444' }}>20%</span>
                        <div className="w-16 h-2 rounded-full" style={{ background: `linear-gradient(to right, #ef4444, #f59e0b, #00e5a0)` }} />
                        <span className="font-semibold" style={{ color: '#00e5a0' }}>90%</span>
                        <span style={{ color: 'var(--text-muted)' }}>55%</span>
                    </div>
                </div>
                <ChartCard title="" option={categoryPerfOption} height="320px" />

                {/* جدول تفصيلي للفئات */}
                <div className="px-5 pb-4 overflow-x-auto">
                    <table className="enterprise-table">
                        <thead>
                            <tr>
                                <th style={{ minWidth: '120px' }}>الفئة</th>
                                {branchScores.map(b => <th key={b.id} style={{ textAlign: 'center', fontSize: '10px', padding: '4px 6px' }}>{b.name.split(' ').slice(0, 2).join(' ')}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {categoryScores.map(c => {
                                const row = c as unknown as Record<string, number | string>;
                                return (
                                    <tr key={c.cat}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500, minWidth: '120px' }}>{c.cat}</td>
                                        {branchScores.map((b, bi) => {
                                            const val = Number(row[`b${bi + 1}`]) || 0;
                                            return (
                                                <td key={b.id} style={{ textAlign: 'center', padding: '4px 6px' }}>
                                                    <div style={{
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        minWidth: 38, padding: '2px 6px', borderRadius: 4,
                                                        background: val >= 70 ? 'rgba(34,197,94,0.15)' : val >= 50 ? 'rgba(234,179,8,0.12)' : val >= 30 ? 'rgba(249,115,22,0.12)' : 'rgba(239,68,68,0.12)',
                                                    }}>
                                                        <span className="text-[11px] font-bold" style={{ color: getBarColor(val) }} dir="ltr">{val}%</span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── خريطة الفروع + نسبة المبيعات ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <BranchMap />
                <ChartCard title="نسبة المبيعات حسب مجموعة المنتجات" subtitle="توزيع المبيعات لكل سوق" option={salesByGroupOption} height="460px" delay={2} />
            </div>

            <BranchSalesTable />

            <EnterpriseTable title="دليل الفروع" columns={branchColumns} data={branches} pageSize={10} />
        </div>
    );
}
