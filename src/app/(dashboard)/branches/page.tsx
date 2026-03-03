'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Award, Scale, TrendingUp, BarChart3, ChevronDown, ChevronLeft } from 'lucide-react';
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
    {
        cat: 'أجهزة وإلكترونيات', b1: 60, b2: 20, b3: 85, b4: 55, b5: 90, b6: 40, b7: 78, b8: 25, subs: [
            { name: 'بطاريات', b1: 65, b2: 22, b3: 80, b4: 50, b5: 88, b6: 38, b7: 75, b8: 20 },
            { name: 'إضاءة LED', b1: 58, b2: 18, b3: 88, b4: 58, b5: 92, b6: 42, b7: 80, b8: 28 },
            { name: 'شواحن', b1: 55, b2: 20, b3: 82, b4: 52, b5: 85, b6: 35, b7: 72, b8: 22 },
        ]
    },
    {
        cat: 'العناية الشخصية', b1: 78, b2: 41, b3: 72, b4: 60, b5: 88, b6: 50, b7: 82, b8: 38, subs: [
            { name: 'شامبو وبلسم', b1: 80, b2: 45, b3: 70, b4: 62, b5: 90, b6: 52, b7: 85, b8: 40 },
            { name: 'معجون أسنان', b1: 75, b2: 38, b3: 75, b4: 58, b5: 86, b6: 48, b7: 78, b8: 35 },
            { name: 'مزيل عرق', b1: 82, b2: 42, b3: 68, b4: 55, b5: 85, b6: 45, b7: 80, b8: 36 },
            { name: 'عطور', b1: 72, b2: 35, b3: 78, b4: 65, b5: 92, b6: 55, b7: 88, b8: 42 },
        ]
    },
    {
        cat: 'غير مصنف', b1: 91, b2: 28, b3: 65, b4: 35, b5: 76, b6: 45, b7: 70, b8: 22, subs: [
            { name: 'متفرقات', b1: 90, b2: 25, b3: 60, b4: 30, b5: 72, b6: 40, b7: 65, b8: 18 },
            { name: 'عام', b1: 92, b2: 30, b3: 68, b4: 38, b5: 78, b6: 48, b7: 74, b8: 25 },
        ]
    },
    {
        cat: 'فرفاشية', b1: 30, b2: 20, b3: 45, b4: 28, b5: 55, b6: 22, b7: 48, b8: 18, subs: [
            { name: 'مفارش', b1: 32, b2: 22, b3: 48, b4: 30, b5: 58, b6: 25, b7: 50, b8: 20 },
            { name: 'وسائد', b1: 28, b2: 18, b3: 42, b4: 25, b5: 52, b6: 20, b7: 45, b8: 15 },
        ]
    },
    {
        cat: 'مستلزمات الأطفال', b1: 79, b2: 42, b3: 80, b4: 58, b5: 85, b6: 48, b7: 75, b8: 35, subs: [
            { name: 'حفاضات', b1: 82, b2: 45, b3: 82, b4: 60, b5: 88, b6: 50, b7: 78, b8: 38 },
            { name: 'حليب أطفال', b1: 78, b2: 40, b3: 78, b4: 55, b5: 82, b6: 45, b7: 72, b8: 32 },
            { name: 'طعام أطفال', b1: 75, b2: 38, b3: 80, b4: 58, b5: 85, b6: 48, b7: 74, b8: 34 },
        ]
    },
    {
        cat: 'مستلزمات منزلية', b1: 78, b2: 43, b3: 74, b4: 62, b5: 89, b6: 52, b7: 80, b8: 40, subs: [
            { name: 'منظفات', b1: 80, b2: 45, b3: 76, b4: 65, b5: 90, b6: 55, b7: 82, b8: 42 },
            { name: 'أدوات مطبخ', b1: 75, b2: 40, b3: 72, b4: 58, b5: 88, b6: 48, b7: 78, b8: 38 },
            { name: 'معطرات جو', b1: 82, b2: 46, b3: 78, b4: 65, b5: 92, b6: 55, b7: 84, b8: 44 },
            { name: 'أكياس وأغلفة', b1: 72, b2: 38, b3: 68, b4: 55, b5: 85, b6: 45, b7: 74, b8: 35 },
        ]
    },
    {
        cat: 'منتجات غذائية', b1: 78, b2: 42, b3: 82, b4: 65, b5: 92, b6: 55, b7: 84, b8: 38, subs: [
            { name: 'حبوب وأرز', b1: 80, b2: 44, b3: 85, b4: 68, b5: 94, b6: 58, b7: 86, b8: 40 },
            { name: 'زيوت', b1: 76, b2: 40, b3: 80, b4: 62, b5: 90, b6: 52, b7: 82, b8: 36 },
            { name: 'حليب وألبان', b1: 82, b2: 45, b3: 84, b4: 70, b5: 95, b6: 58, b7: 88, b8: 42 },
            { name: 'معلبات', b1: 72, b2: 38, b3: 78, b4: 58, b5: 88, b6: 50, b7: 78, b8: 32 },
            { name: 'خبز ومعجنات', b1: 78, b2: 42, b3: 80, b4: 64, b5: 90, b6: 54, b7: 84, b8: 38 },
        ]
    },
    {
        cat: 'منتجات ورقية', b1: 78, b2: 42, b3: 70, b4: 50, b5: 83, b6: 45, b7: 72, b8: 30, subs: [
            { name: 'مناديل', b1: 80, b2: 44, b3: 72, b4: 52, b5: 85, b6: 48, b7: 74, b8: 32 },
            { name: 'ورق تواليت', b1: 76, b2: 40, b3: 68, b4: 48, b5: 80, b6: 42, b7: 70, b8: 28 },
            { name: 'ورق مطبخ', b1: 78, b2: 42, b3: 70, b4: 50, b5: 84, b6: 45, b7: 72, b8: 30 },
        ]
    },
    {
        cat: 'مسطحات', b1: 78, b2: 42, b3: 75, b4: 55, b5: 86, b6: 48, b7: 76, b8: 32, subs: [
            { name: 'مسطحات ساخنة', b1: 80, b2: 44, b3: 78, b4: 58, b5: 88, b6: 50, b7: 78, b8: 34 },
            { name: 'مسطحات باردة', b1: 76, b2: 40, b3: 72, b4: 52, b5: 84, b6: 46, b7: 74, b8: 30 },
        ]
    },
];

function getBarColor(score: number) {
    if (score >= 70) return 'var(--accent-green)';
    if (score >= 50) return 'var(--accent-amber)';
    if (score >= 30) return '#f97316';
    return 'var(--accent-red)';
}

export default function BranchesPage() {
    const branches = useMemo(() => getBranchData(), []);
    const regions = useMemo(() => getRegionalData(), []);
    const topBranch = [...branches].sort((a, b) => b.revenue - a.revenue)[0];
    const avgScore = Math.round(branchScores.reduce((a, b) => a + b.score, 0) / branchScores.length);
    const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

    // ── Simple donut gauge ──
    const gColor = avgScore >= 70 ? 'var(--accent-green)' : avgScore >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)';
    const circumference = 2 * Math.PI * 54;
    const dashOffset = circumference - (avgScore / 100) * circumference;

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

    // ── صافي المبيعات عبر الزمن لكل فرع ──
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'جون', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const netSalesData: Record<string, number[]> = {
        'سوق المنارة': [45140, 43200, 41800, 39600, 38100, 36500, 35200, 33800, 31500, 29700, 27920, 24380],
        'سوق سطح النجم': [32100, 31400, 30800, 29500, 28200, 27600, 26800, 25900, 24300, 23100, 22400, 21800],
        'سوق القويسمة': [28500, 29200, 30100, 31500, 32800, 33400, 34200, 35100, 36500, 37800, 38400, 39200],
        'سوق راس العين': [18200, 17800, 17200, 16800, 16500, 16100, 15800, 15200, 14800, 14200, 13800, 13500],
        'سوق البقعة': [38400, 39100, 40200, 41800, 43200, 44500, 45800, 46200, 47100, 48300, 49500, 50200],
        'سوق الدمام': [22300, 21800, 21200, 20800, 20100, 19500, 18800, 18200, 17600, 17100, 16800, 16200],
        'سوق الخبر': [35200, 35800, 36500, 37200, 38100, 38800, 39500, 40200, 41100, 41800, 42500, 43200],
        'سوق جدة': [15200, 14800, 14200, 13800, 13500, 13100, 12800, 12200, 11800, 11500, 11200, 10800],
    };
    const netSalesByBranchOption = {
        tooltip: { trigger: 'axis' as const },
        legend: {
            data: Object.keys(netSalesData),
            bottom: 0,
            textStyle: { fontSize: 9 },
            type: 'scroll' as const,
        },
        grid: { top: '8%', bottom: '20%', left: '3%', right: '3%', containLabel: true },
        xAxis: {
            type: 'category' as const,
            data: months,
            axisLabel: { fontSize: 9 },
            boundaryGap: false,
        },
        yAxis: {
            type: 'value' as const,
            axisLabel: {
                fontSize: 9,
                formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`,
            },
        },
        series: Object.entries(netSalesData).map(([name, data], i) => ({
            name,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 4,
            lineStyle: { width: 2 },
            itemStyle: { color: branchColors[i] },
            data,
            endLabel: {
                show: true,
                formatter: (p: { value: number }) => `${(p.value / 1000).toFixed(1)}K`,
                fontSize: 9,
                color: branchColors[i],
            },
        })),
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
                    {/* Simple Donut Gauge */}
                    <div className="p-5 border-b xl:border-b-0 xl:border-l flex flex-col items-center justify-center" style={{ borderColor: 'var(--border-subtle)' }}>
                        <p className="text-[11px] font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>متوسط درجة أداء الفروع الكلية</p>
                        <div className="relative" style={{ width: 140, height: 140 }}>
                            <svg width="140" height="140" viewBox="0 0 140 140">
                                <circle cx="70" cy="70" r="54" fill="none" stroke="var(--bg-elevated)" strokeWidth="12" />
                                <circle cx="70" cy="70" r="54" fill="none" stroke={gColor} strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={dashOffset}
                                    transform="rotate(-90 70 70)"
                                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold" style={{ color: gColor }}>{avgScore}%</span>
                                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>الأداء العام</span>
                            </div>
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
                            <div style={{ background: `linear-gradient(to right, var(--accent-red), var(--accent-amber), var(--accent-green))` }} className="w-12 h-2 rounded-full" />
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
                        <span className="font-semibold" style={{ color: 'var(--accent-red)' }}>20%</span>
                        <div className="w-16 h-2 rounded-full" style={{ background: `linear-gradient(to right, var(--accent-red), var(--accent-amber), var(--accent-green))` }} />
                        <span className="font-semibold" style={{ color: 'var(--accent-green)' }}>90%</span>
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
                                const isOpen = expandedCats[c.cat];
                                const hasSubs = c.subs && c.subs.length > 0;
                                return (
                                    <React.Fragment key={c.cat}>
                                        <tr
                                            style={{ cursor: hasSubs ? 'pointer' : 'default' }}
                                            onClick={() => hasSubs && setExpandedCats(p => ({ ...p, [c.cat]: !p[c.cat] }))}
                                        >
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 500, minWidth: '120px' }}>
                                                <div className="flex items-center gap-1.5">
                                                    {hasSubs && (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', width: 14, height: 14, borderRadius: 3, background: isOpen ? 'rgba(37,99,235,0.12)' : 'var(--bg-elevated)' }}>
                                                            {isOpen ? <ChevronDown size={10} style={{ color: 'var(--accent-blue)' }} /> : <ChevronLeft size={10} style={{ color: 'var(--text-muted)' }} />}
                                                        </span>
                                                    )}
                                                    {c.cat}
                                                </div>
                                            </td>
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
                                        {isOpen && c.subs?.map(sub => (
                                            <tr key={sub.name} style={{ background: 'var(--bg-elevated)', opacity: 0.9 }}>
                                                <td style={{ paddingRight: '28px', color: 'var(--text-secondary)', fontSize: '11px', minWidth: '120px' }}>
                                                    <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>└</span> {sub.name}
                                                </td>
                                                {branchScores.map((b, bi) => {
                                                    const val = Number((sub as unknown as Record<string, number>)[`b${bi + 1}`]) || 0;
                                                    return (
                                                        <td key={b.id} style={{ textAlign: 'center', padding: '3px 6px' }}>
                                                            <span className="text-[10px] font-semibold" style={{ color: getBarColor(val) }} dir="ltr">{val}%</span>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── مقارنة المبيعات: السنة الحالية مقابل السنة السابقة ── */}
            {(() => {
                const yoyData = [
                    {
                        branch: 'سوق المنارة', py: 73100, ac: 24400, years: [
                            { year: '2020', py: 45200, ac: null as number | null },
                            { year: '2022', py: 27900, ac: 24400 },
                            { year: '2021', py: 45100, ac: 27900 },
                        ]
                    },
                    {
                        branch: 'سوق البقعة', py: 68200, ac: 52100, years: [
                            { year: '2020', py: 42000, ac: null as number | null },
                            { year: '2022', py: 55800, ac: 52100 },
                            { year: '2021', py: 42000, ac: 55800 },
                        ]
                    },
                    {
                        branch: 'سوق الخبر', py: 58400, ac: 43200, years: [
                            { year: '2020', py: 38500, ac: null as number | null },
                            { year: '2022', py: 42500, ac: 43200 },
                            { year: '2021', py: 38500, ac: 42500 },
                        ]
                    },
                    {
                        branch: 'سوق القويسمة', py: 52300, ac: 39200, years: [
                            { year: '2020', py: 35600, ac: null as number | null },
                            { year: '2022', py: 38400, ac: 39200 },
                            { year: '2021', py: 35600, ac: 38400 },
                        ]
                    },
                    {
                        branch: 'سوق سطح النجم', py: 41200, ac: 21800, years: [
                            { year: '2020', py: 28900, ac: null as number | null },
                            { year: '2022', py: 32100, ac: 21800 },
                            { year: '2021', py: 28900, ac: 32100 },
                        ]
                    },
                    {
                        branch: 'سوق الدمام', py: 35800, ac: 16200, years: [
                            { year: '2020', py: 22300, ac: null as number | null },
                            { year: '2022', py: 22300, ac: 16200 },
                            { year: '2021', py: 22300, ac: 22300 },
                        ]
                    },
                    {
                        branch: 'سوق راس العين', py: 28100, ac: 13500, years: [
                            { year: '2020', py: 18200, ac: null as number | null },
                            { year: '2022', py: 18200, ac: 13500 },
                            { year: '2021', py: 18200, ac: 18200 },
                        ]
                    },
                    {
                        branch: 'سوق جدة', py: 22400, ac: 10800, years: [
                            { year: '2020', py: 15200, ac: null as number | null },
                            { year: '2022', py: 15200, ac: 10800 },
                            { year: '2021', py: 15200, ac: 15200 },
                        ]
                    },
                ];
                const allDeltas = yoyData.flatMap(d => {
                    const main = d.ac - d.py;
                    const subs = d.years.filter(y => y.ac !== null).map(y => (y.ac as number) - y.py);
                    return [main, ...subs];
                });
                const maxAbsDelta = Math.max(...allDeltas.map(Math.abs), 1);
                const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`;
                const fmtDelta = (v: number) => `${v >= 0 ? '+' : ''}${fmt(v)}`;
                const pct = (ac: number, py: number) => py === 0 ? 0 : ((ac - py) / py * 100);

                return (
                    <div className="glass-panel p-0 overflow-hidden">
                        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>مقارنة المبيعات: السنة الحالية مقابل السابقة</h3>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Current Year Sales and Previous Year Sales by Year, Branch Name</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="enterprise-table" style={{ minWidth: 700 }}>
                                <thead>
                                    <tr>
                                        <th style={{ minWidth: 140 }}>الفرع</th>
                                        <th style={{ textAlign: 'center', width: 70 }}>السابق</th>
                                        <th style={{ textAlign: 'center', width: 70 }}>الفعلي</th>
                                        <th style={{ textAlign: 'center', minWidth: 240 }}>الفرق</th>
                                        <th style={{ textAlign: 'center', width: 80 }}>التغير%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {yoyData.map(d => {
                                        const delta = d.ac - d.py;
                                        const deltaPct = pct(d.ac, d.py);
                                        const isOpen = expandedCats[`yoy_${d.branch}`];
                                        const barW = Math.abs(delta) / maxAbsDelta * 50; // max 50% of cell width per side
                                        return (
                                            <React.Fragment key={d.branch}>
                                                <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedCats(p => ({ ...p, [`yoy_${d.branch}`]: !p[`yoy_${d.branch}`] }))}>
                                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                        <div className="flex items-center gap-1.5">
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', width: 14, height: 14, borderRadius: 3, background: isOpen ? 'rgba(37,99,235,0.12)' : 'var(--bg-elevated)' }}>
                                                                {isOpen ? <ChevronDown size={10} style={{ color: 'var(--accent-blue)' }} /> : <ChevronLeft size={10} style={{ color: 'var(--text-muted)' }} />}
                                                            </span>
                                                            {d.branch}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontWeight: 500, color: 'var(--text-secondary)' }} dir="ltr">{fmt(d.py)}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: 500, color: 'var(--text-secondary)' }} dir="ltr">{fmt(d.ac)}</td>
                                                    <td style={{ padding: '4px 8px' }}>
                                                        <div style={{ position: 'relative', height: 18, display: 'flex', alignItems: 'center' }}>
                                                            {/* Center axis */}
                                                            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border-subtle)' }} />
                                                            {/* Bar */}
                                                            {delta < 0 ? (
                                                                <div style={{ position: 'absolute', right: '50%', top: 2, bottom: 2, width: `${barW}%`, background: 'var(--accent-red)', borderRadius: '3px 0 0 3px' }} />
                                                            ) : (
                                                                <div style={{ position: 'absolute', left: '50%', top: 2, bottom: 2, width: `${barW}%`, background: 'var(--accent-green)', borderRadius: '0 3px 3px 0' }} />
                                                            )}
                                                            {/* Label */}
                                                            <span className="text-[10px] font-bold" dir="ltr" style={{
                                                                position: 'absolute',
                                                                color: delta >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                                                                ...(delta < 0 ? { right: `calc(50% + ${barW}% + 6px)` } : { left: `calc(50% + ${barW}% + 6px)` }),
                                                                whiteSpace: 'nowrap',
                                                            }}>{fmtDelta(delta)}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <div className="flex items-center justify-center gap-1" dir="ltr">
                                                            <span className="text-[11px] font-bold" style={{ color: deltaPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}</span>
                                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: deltaPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', display: 'inline-block' }} />
                                                        </div>
                                                    </td>
                                                </tr>
                                                {isOpen && d.years.map(y => {
                                                    const yDelta = y.ac !== null ? (y.ac as number) - y.py : null;
                                                    const yPct = y.ac !== null ? pct(y.ac as number, y.py) : null;
                                                    const yBarW = yDelta !== null ? Math.abs(yDelta) / maxAbsDelta * 50 : 0;
                                                    return (
                                                        <tr key={y.year} style={{ background: 'var(--bg-elevated)' }}>
                                                            <td style={{ paddingRight: 28, color: 'var(--text-muted)', fontSize: 12 }}>
                                                                <span style={{ marginLeft: 4 }}>┃</span> {y.year}
                                                            </td>
                                                            <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }} dir="ltr">{fmt(y.py)}</td>
                                                            <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }} dir="ltr">{y.ac !== null ? fmt(y.ac as number) : ''}</td>
                                                            <td style={{ padding: '3px 8px' }}>
                                                                {yDelta !== null && (
                                                                    <div style={{ position: 'relative', height: 14, display: 'flex', alignItems: 'center' }}>
                                                                        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border-subtle)' }} />
                                                                        {yDelta < 0 ? (
                                                                            <div style={{ position: 'absolute', right: '50%', top: 1, bottom: 1, width: `${yBarW}%`, background: 'var(--accent-red)', borderRadius: '2px 0 0 2px', opacity: 0.7 }} />
                                                                        ) : (
                                                                            <div style={{ position: 'absolute', left: '50%', top: 1, bottom: 1, width: `${yBarW}%`, background: 'var(--accent-green)', borderRadius: '0 2px 2px 0', opacity: 0.7 }} />
                                                                        )}
                                                                        <span className="text-[9px] font-semibold" dir="ltr" style={{
                                                                            position: 'absolute',
                                                                            color: yDelta >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                                                                            ...(yDelta < 0 ? { right: `calc(50% + ${yBarW}% + 4px)` } : { left: `calc(50% + ${yBarW}% + 4px)` }),
                                                                            whiteSpace: 'nowrap',
                                                                        }}>{fmtDelta(yDelta)}</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                {yPct !== null && (
                                                                    <div className="flex items-center justify-center gap-1" dir="ltr">
                                                                        <span className="text-[10px] font-semibold" style={{ color: yPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{yPct >= 0 ? '+' : ''}{yPct.toFixed(1)}</span>
                                                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: yPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', display: 'inline-block' }} />
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })()}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <BranchMap />
                <ChartCard title="صافي المبيعات عبر الزمن لكل فرع" subtitle="Net Sales Over Time by Branch" option={netSalesByBranchOption} height="460px" delay={2} />
            </div>

            <BranchSalesTable />

            <EnterpriseTable title="دليل الفروع" columns={branchColumns} data={branches} pageSize={10} />
        </div>
    );
}
