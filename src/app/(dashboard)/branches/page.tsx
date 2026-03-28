'use client';

import '@/lib/echarts/register-bar-line-pie';
import dynamic from 'next/dynamic';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Award, Scale,  BarChart3, ChevronDown, ChevronLeft } from 'lucide-react';
import { ChartTitleFlagBadge } from '@/components/ui/ChartTitleFlagBadge';

const ChartCard = dynamic(() => import('@/components/ui/ChartCard'), {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
});
import EnterpriseTable from '@/components/ui/EnterpriseTable';
import type { TableColumn } from '@/components/ui/EnterpriseTable';
import { getBranchData, getRegionalData, type BranchData } from '@/lib/mockData';
import BranchMap from '@/components/ui/BranchMap';
import MetricsBubblePlot, { type MetricsBubblePoint } from '@/components/ui/MetricsBubblePlot';
import { BRANCH_PRODUCT_ANALYSIS, buildProductBubbleRows, type ProductBubbleRow } from '@/lib/branchProductAnalysis';
import { useResolvedAnalyticsPalette } from '@/hooks/useResolvedAnalyticsPalette';
import DrillDownTable from '@/components/ui/DrillDownTable';
import { AnalyticsBarCell, AnalyticsTable, analyticsTdBaseStyle } from '@/components/ui/AnalyticsTable';

// ── بيانات الأداء المرجّح لكل فرع (جدول + رسوم) ──
const branchScores = [
    { id: 'b1', name: 'سوق المنارة', score: 59, profit: 428_500, sales: 2_412_000, employees: 142, returns: 2.8, growth: 6.2, discount: 4.1 },
    { id: 'b2', name: 'سوق سطح النجم', score: 38, profit: 118_200, sales: 892_400, employees: 68, returns: 1.1, growth: -1.4, discount: 5.8 },
    { id: 'b3', name: 'سوق القويسمة', score: 72, profit: 512_800, sales: 2_105_000, employees: 128, returns: 1.9, growth: 11.3, discount: 3.2 },
    { id: 'b4', name: 'سوق راس العين', score: 55, profit: 95_400, sales: 618_000, employees: 52, returns: 2.4, growth: 3.1, discount: 6.4 },
    { id: 'b5', name: 'سوق البقعة', score: 81, profit: 601_200, sales: 2_890_000, employees: 165, returns: 1.4, growth: 8.7, discount: 2.9 },
    { id: 'b6', name: 'سوق الدمام', score: 46, profit: 156_700, sales: 1_024_500, employees: 79, returns: 3.2, growth: 0.8, discount: 5.1 },
    { id: 'b7', name: 'سوق الخبر', score: 75, profit: 489_000, sales: 2_198_000, employees: 121, returns: 1.6, growth: 9.5, discount: 3.6 },
    { id: 'b8', name: 'سوق جدة', score: 35, profit: 72_300, sales: 541_200, employees: 45, returns: 4.8, growth: -2.6, discount: 7.2 },
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

const BRANCH_KEYS = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'] as const;

const BRANCH_PERF_QUARTER_LABELS = ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'] as const;
const BRANCH_PERF_BIMONTH_LABELS = [
    'يناير–فبراير', 'مارس–أبريل', 'مايو–جون',
    'يوليو–أغسطس', 'سبتمبر–أكتوبر', 'نوفمبر–ديسمبر',
] as const;

/** Mock period scores around each branch’s annual score (demo data). */
function branchPerfPeriodScore(baseScore: number, branchIndex: number, periodIndex: number, periodCount: number): number {
    const wave = Math.sin((periodIndex / periodCount) * Math.PI * 2 + branchIndex * 0.65) * 7;
    const noise = ((branchIndex * 17 + periodIndex * 11) % 9) - 4;
    return Math.max(18, Math.min(98, Math.round(baseScore + wave + noise)));
}

export default function BranchesPage() {
    const palette = useResolvedAnalyticsPalette();
    const branchChartColors = useMemo(
        () => [palette.primaryGreen, palette.primaryCyan, palette.primaryBlue, palette.primaryPurple, palette.primaryAmber, palette.primaryRed, '#0891b2', '#d97706'] as const,
        [palette],
    );
    const branches = useMemo(() => getBranchData(), []);
    const regions = useMemo(() => getRegionalData(), []);
    const topBranch = [...branches].sort((a, b) => b.revenue - a.revenue)[0];
    const avgScore = Math.round(branchScores.reduce((a, b) => a + b.score, 0) / branchScores.length);
    const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
    const [branchPerfGranularity, setBranchPerfGranularity] = useState<'year' | 'quarter' | 'bimonth'>('year');

    // ── Simple donut gauge (200×200, r=77 — scaled up from 140×140 / r=54) ──
    const gColor = avgScore >= 70 ? 'var(--accent-green)' : avgScore >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)';
    const donutR = 77;
    const donutC = 100;
    const circumference = 2 * Math.PI * donutR;
    const dashOffset = circumference - (avgScore / 100) * circumference;

    // ── أداء الفروع (شريط ملون): سنوي / ربع سنوي / كل شهرين ──
    const branchPerfOption = useMemo(() => {
        const shortName = (b: (typeof branchScores)[0]) => b.name.split(' ').slice(0, 2).join(' ');
        if (branchPerfGranularity === 'year') {
            const rotate = branchScores.length > 4 ? 30 : 0;
            return {
                tooltip: { trigger: 'item' as const, formatter: '{b}: {c}%' },
                xAxis: {
                    type: 'category' as const,
                    data: branchScores.map(shortName),
                    boundaryGap: true,
                    axisTick: { alignWithLabel: true },
                    axisLabel: {
                        rotate,
                        fontSize: 10,
                        align: 'center',
                        verticalAlign: 'middle',
                        margin: rotate ? 14 : 10,
                        interval: 0,
                    },
                },
                yAxis: { type: 'value' as const, max: 100, axisLabel: { formatter: '{value}%' } },
                series: [{
                    type: 'bar' as const,
                    data: branchScores.map(b => ({
                        value: b.score,
                        itemStyle: { color: getBarColor(b.score), borderRadius: [4, 4, 0, 0] },
                        label: { show: true, position: 'top', formatter: `${b.score}%`, color: getBarColor(b.score), fontSize: 11, fontWeight: 'bold' },
                    })),
                    barWidth: Math.max(16, Math.min(36, 200 / branchScores.length)),
                }],
                grid: { top: '20%', bottom: rotate ? '22%' : '16%', left: '3%', right: '3%', containLabel: true },
            };
        }
        const multiGrid = { bottom: '24%', top: '8%', left: '3%', right: '3%', containLabel: true };
        const multiTooltip = {
            trigger: 'axis' as const,
            formatter: (params: { seriesName: string; value: number }[]) =>
                params.map(p => `${p.seriesName}: <b>${p.value}%</b>`).join('<br/>'),
        };
        const multiLegend = {
            data: branchScores.map(b => b.name),
            bottom: 0,
            textStyle: { fontSize: 8 },
            type: 'scroll' as const,
        };
        const multiY = { type: 'value' as const, max: 100, axisLabel: { formatter: '{value}%', fontSize: 9 } };
        if (branchPerfGranularity === 'quarter') {
            const n = BRANCH_PERF_QUARTER_LABELS.length;
            return {
                tooltip: multiTooltip,
                legend: multiLegend,
                grid: multiGrid,
                xAxis: {
                    type: 'category' as const,
                    data: [...BRANCH_PERF_QUARTER_LABELS],
                    axisLabel: { fontSize: 9 },
                },
                yAxis: multiY,
                series: branchScores.map((b, bi) => ({
                    name: b.name,
                    type: 'bar' as const,
                    barMaxWidth: 8,
                    data: Array.from({ length: n }, (_, qi) => {
                        const v = branchPerfPeriodScore(b.score, bi, qi, n);
                        return {
                            value: v,
                            itemStyle: { color: branchChartColors[bi], borderRadius: [2, 2, 0, 0] },
                        };
                    }),
                })),
                dataZoom: [{ type: 'inside' as const }],
            };
        }
        const n = BRANCH_PERF_BIMONTH_LABELS.length;
        return {
            tooltip: multiTooltip,
            legend: multiLegend,
            grid: { ...multiGrid, bottom: '26%' },
            xAxis: {
                type: 'category' as const,
                data: [...BRANCH_PERF_BIMONTH_LABELS],
                boundaryGap: true,
                axisTick: { alignWithLabel: true },
                axisLabel: {
                    rotate: 28,
                    fontSize: 8,
                    align: 'center',
                    verticalAlign: 'middle',
                    margin: 16,
                    interval: 0,
                },
            },
            yAxis: multiY,
            series: branchScores.map((b, bi) => ({
                name: b.name,
                type: 'bar' as const,
                barMaxWidth: 6,
                data: Array.from({ length: n }, (_, mi) => {
                    const v = branchPerfPeriodScore(b.score, bi, mi, n);
                    return {
                        value: v,
                        itemStyle: { color: branchChartColors[bi], borderRadius: [2, 2, 0, 0] },
                    };
                }),
            })),
            dataZoom: [{ type: 'inside' as const }],
        };
    }, [branchPerfGranularity, branchChartColors]);

    // ── أداء فئات المنتجات (مجمّع لكل الفروع) ──
    const categoryPerfOption = useMemo(() => ({
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
                const val = (c as unknown as Record<string, number>)[BRANCH_KEYS[bi]] ?? 0;
                return {
                    value: val,
                    itemStyle: {
                        color: branchChartColors[bi],
                        borderRadius: [3, 3, 0, 0],
                        opacity: val >= 70 ? 1 : val >= 50 ? 0.85 : val >= 30 ? 0.7 : 0.55,
                    },
                };
            }),
        })),
    }), [branchChartColors]);

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
    const netSalesByBranchOption = useMemo(() => ({
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
            itemStyle: { color: branchChartColors[i] },
            data,
            endLabel: {
                show: true,
                formatter: (p: { value: number }) => `${(p.value / 1000).toFixed(1)}K`,
                fontSize: 9,
                color: branchChartColors[i],
            },
        })),
    }), [branchChartColors]);

    const branchColumns: TableColumn<BranchData>[] = useMemo(() => {
        const maxRev = Math.max(...branches.map((b) => b.revenue), 1);
        const maxOrd = Math.max(...branches.map((b) => b.orders), 1);
        const maxCust = Math.max(...branches.map((b) => b.customers), 1);
        return [
            { key: 'nameAr', header: 'الفرع', sortable: true },
            { key: 'regionAr', header: 'المنطقة', sortable: true },
            { key: 'revenue', header: 'الإيرادات', sortable: true, align: 'center', format: 'currency', analyticsBar: { max: maxRev } },
            { key: 'orders', header: 'الطلبات', sortable: true, align: 'center', format: 'number', analyticsBar: { max: maxOrd } },
            { key: 'customers', header: 'العملاء', sortable: true, align: 'center', format: 'number', analyticsBar: { max: maxCust } },
            { key: 'growth', header: 'النمو', sortable: true, align: 'right', format: 'change' },
            {
                key: 'performance',
                header: 'الأداء',
                sortable: true,
                align: 'center',
                render: (val: unknown) => {
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
                },
            },
        ];
    }, [branches]);

    const scoreColor = (v: number) => v >= 70 ? 'var(--accent-green)' : v >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)';

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-1"><Building2 size={24} style={{ color: 'var(--accent-green)' }} /><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>أداء الفروع</h1></div>
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
                        <ChartTitleFlagBadge flag="green" size="sm" />
                        <div className="flex items-center gap-2">
                            <BarChart3 size={16} style={{ color: 'var(--accent-blue)' }} />
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>تقييم أداء الفروع</h3>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-0">
                    {/* Simple Donut Gauge */}
                    <div className="p-5 border-b xl:border-b-0 xl:border-l flex flex-col items-center justify-center" style={{ borderColor: 'var(--border-subtle)' }}>
                        <p className="text-[11px] font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>متوسط درجة أداء الفروع الكلية</p>
                        <div className="relative" style={{ width: 200, height: 200 }}>
                            <svg width="200" height="200" viewBox="0 0 200 200">
                                <circle cx={donutC} cy={donutC} r={donutR} fill="none" stroke="var(--bg-elevated)" strokeWidth="16" />
                                <circle cx={donutC} cy={donutC} r={donutR} fill="none" stroke={gColor} strokeWidth="16"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={dashOffset}
                                    transform={`rotate(-90 ${donutC} ${donutC})`}
                                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold" style={{ color: gColor }}>{avgScore}%</span>
                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>الأداء العام</span>
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
                            <AnalyticsTable
                                headers={[
                                    { label: 'الفرع', align: 'right' },
                                    { label: 'الربح', align: 'center' },
                                    { label: 'عدد الموظفين مقارنة بالمبيعات', align: 'center' },
                                    { label: 'المرتجعات', align: 'center' },
                                    { label: 'النمو', align: 'center' },
                                    { label: 'الخصم', align: 'center' },
                                    { label: 'المبيعات', align: 'center' },
                                ]}
                            >
                                {(() => {
                                    const maxProfit = Math.max(...branchScores.map((b) => b.profit), 1);
                                    const maxSales = Math.max(...branchScores.map((b) => b.sales), 1);
                                    const maxEmpPerM = Math.max(
                                        ...branchScores.map((b) => (b.sales > 0 ? (b.employees / b.sales) * 1_000_000 : 0)),
                                        1
                                    );
                                    return branchScores.map((b) => {
                                        const empPerM = b.sales > 0 ? (b.employees / b.sales) * 1_000_000 : 0;
                                        return (
                                            <tr key={b.id}>
                                                <td style={{ ...analyticsTdBaseStyle('right'), fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                                                    {b.name}
                                                </td>
                                                <AnalyticsBarCell value={b.profit} max={maxProfit} color="#3b82f6" text={b.profit.toLocaleString('en-US')} />
                                                <AnalyticsBarCell value={empPerM} max={maxEmpPerM} color="#3b82f6" text={`${b.employees} · ${empPerM.toFixed(1)}`} />
                                                <AnalyticsBarCell value={b.returns} max={10} color="#3b82f6" text={`${b.returns.toFixed(1)}%`} />
                                                <td style={analyticsTdBaseStyle('center')}>
                                                    <span style={{ fontSize: 10, fontWeight: 600, color: b.growth >= 0 ? 'var(--accent-green)' : 'var(--accent-amber)' }} dir="ltr">
                                                        {b.growth >= 0 ? '+' : ''}{b.growth.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <AnalyticsBarCell value={b.discount} max={10} color="#3b82f6" text={`${b.discount.toFixed(1)}%`} />
                                                <AnalyticsBarCell value={b.sales} max={maxSales} color="#3b82f6" text={b.sales.toLocaleString('en-US')} />
                                            </tr>
                                        );
                                    });
                                })()}
                            </AnalyticsTable>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Overall Branch Performance Score (bar chart) ── */}
            <div className="glass-panel overflow-hidden">
                <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <ChartTitleFlagBadge flag="green" size="sm" />
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>أداء الفروع الكلية</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 shrink-0" role="group" aria-label="دقة عرض الرسم">
                            {([
                                { id: 'year' as const, label: 'سنوي' },
                                { id: 'quarter' as const, label: 'ربع سنوي' },
                                { id: 'bimonth' as const, label: 'شهري (كل شهرين)' },
                            ]).map(t => {
                                const active = branchPerfGranularity === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setBranchPerfGranularity(t.id)}
                                        className="text-[10px] font-medium px-2.5 py-1 rounded-md border transition-colors"
                                        style={{
                                            borderColor: 'var(--border-subtle)',
                                            background: active ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                                            color: active ? 'var(--accent-blue)' : 'var(--text-muted)',
                                        }}
                                    >
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <span>درجة أداء الفروع</span>
                        {branchScores.map(b => (
                            <span key={b.id} className="font-semibold" style={{ color: getBarColor(b.score) }}>{b.score}%</span>
                        ))}
                        <div className="flex items-center gap-1">
                            <div style={{ background: `linear-gradient(to right, var(--accent-red), var(--accent-amber), var(--accent-green))` }} className="w-12 h-2 rounded-full" />
                            <span>25% → 55% → 70%</span>
                        </div>
                        {branchPerfGranularity === 'quarter' && (
                            <span className="text-[9px] opacity-90">المحور: الأرباع — مفتاح الألوان: الفروع</span>
                        )}
                        {branchPerfGranularity === 'bimonth' && (
                            <span className="text-[9px] opacity-90">المحور: أزواج أشهر — مفتاح الألوان: الفروع</span>
                        )}
                    </div>
                </div>
                <ChartCard
                    key={branchPerfGranularity}
                    title=""
                    option={branchPerfOption as Record<string, unknown>}
                    height={branchPerfGranularity === 'year' ? '280px' : '320px'}
                />
            </div>

            {/* ── درجة أداء فئات المنتجات ── */}
            <div className="glass-panel overflow-hidden">
                <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-2">
                        <ChartTitleFlagBadge flag="green" size="sm" />
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>أداء فئات المنتجات حسب الفروع</h3>
                    </div>
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
                    <AnalyticsTable
                        headers={[
                            { label: 'الفئة', align: 'right', width: '120px' },
                            ...branchScores.map((b) => ({ label: b.name.split(' ').slice(0, 2).join(' '), align: 'center' as const, width: '88px' as const })),
                        ]}
                        minWidth={Math.max(560, 120 + branchScores.length * 88)}
                    >
                        {categoryScores.map((c) => {
                            const row = c as unknown as Record<string, number | string>;
                            const isOpen = expandedCats[c.cat];
                            const hasSubs = c.subs && c.subs.length > 0;
                            return (
                                <React.Fragment key={c.cat}>
                                    <tr
                                        className={hasSubs ? 'cursor-pointer hover:bg-white/[0.015] transition-colors' : undefined}
                                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                                        onClick={() => hasSubs && setExpandedCats((p) => ({ ...p, [c.cat]: !p[c.cat] }))}
                                    >
                                        <td style={{ ...analyticsTdBaseStyle('right'), fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
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
                                                <AnalyticsBarCell key={b.id} value={val} max={100} color={getBarColor(val)} text={`${val}%`} />
                                            );
                                        })}
                                    </tr>
                                    {isOpen && c.subs?.map((sub) => (
                                        <tr key={sub.name} style={{ background: 'rgba(8,145,178,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                                            <td style={{ ...analyticsTdBaseStyle('right'), paddingRight: '28px', fontSize: 10, color: 'var(--text-secondary)' }}>
                                                <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>└</span> {sub.name}
                                            </td>
                                            {branchScores.map((b, bi) => {
                                                const val = Number((sub as unknown as Record<string, number>)[`b${bi + 1}`]) || 0;
                                                return (
                                                    <AnalyticsBarCell key={b.id} value={val} max={100} color={getBarColor(val)} text={`${val}%`} />
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            );
                        })}
                    </AnalyticsTable>
                </div>
            </div>

            {/* ── مقارنة المبيعات: السنة الحالية مقابل السنة السابقة ── */}
            {(() => {
                const yoyQuarterLabels = ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'] as const;
                const yoyQuarterMonths = [
                    ['يناير', 'فبراير', 'مارس'],
                    ['أبريل', 'مايو', 'جون'],
                    ['يوليو', 'أغسطس', 'سبتمبر'],
                    ['أكتوبر', 'نوفمبر', 'ديسمبر'],
                ] as const;
                const yoyWeights = [0.24, 0.25, 0.26, 0.25];

                function split3Exact(total: number): [number, number, number] {
                    const a = Math.round(total / 3);
                    const b = Math.round((total - a) / 2);
                    return [a, b, total - a - b];
                }

                function buildQuartersForYear(yearPy: number, yearAc: number | null) {
                    const qpys = [0, 0, 0, 0];
                    for (let i = 0; i < 3; i++) qpys[i] = Math.round(yearPy * yoyWeights[i]);
                    qpys[3] = yearPy - qpys[0] - qpys[1] - qpys[2];
                    const qacs: (number | null)[] = yearAc === null
                        ? [null, null, null, null]
                        : (() => {
                            const a = [0, 0, 0, 0];
                            for (let i = 0; i < 3; i++) a[i] = Math.round(yearAc * yoyWeights[i]);
                            a[3] = yearAc - a[0] - a[1] - a[2];
                            return a;
                        })();
                    return yoyQuarterLabels.map((label, qi) => {
                        const qpy = qpys[qi];
                        const qac = qacs[qi];
                        const [m0, m1, m2] = split3Exact(qpy);
                        const mac = qac === null ? [null, null, null] as const : split3Exact(qac);
                        return {
                            label,
                            py: qpy,
                            ac: qac,
                            months: yoyQuarterMonths[qi].map((name, mi) => ({
                                name,
                                py: [m0, m1, m2][mi],
                                ac: mac[mi],
                            })),
                        };
                    });
                }

                const yoyBase = [
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
                        branch: 'سوق الخبر', py: 42000, ac: 56000, years: [
                            { year: '2020', py: 30000, ac: null as number | null },
                            { year: '2022', py: 44000, ac: 56000 },
                            { year: '2021', py: 30000, ac: 44000 },
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

                const yoyData = yoyBase.map(d => ({
                    branch: d.branch,
                    py: d.py,
                    ac: d.ac,
                    years: d.years.map(y => ({
                        year: y.year,
                        py: y.py,
                        ac: y.ac,
                        quarters: buildQuartersForYear(y.py, y.ac),
                    })),
                }));

                const allDeltas = yoyData.flatMap(d => {
                    const out: number[] = [d.ac - d.py];
                    for (const y of d.years) {
                        if (y.ac !== null) out.push(y.ac - y.py);
                        for (const q of y.quarters) {
                            if (q.ac !== null) out.push(q.ac - q.py);
                            for (const m of q.months) {
                                if (m.ac !== null) out.push(m.ac - m.py);
                            }
                        }
                    }
                    return out;
                });
                const maxAbsDelta = Math.max(...allDeltas.map(Math.abs), 1);
                const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`;
                const fmtDelta = (v: number) => `${v >= 0 ? '+' : ''}${fmt(v)}`;
                const pct = (ac: number, py: number) => py === 0 ? 0 : ((ac - py) / py * 100);

                const yoyKey = {
                    branch: (b: string) => `yoy_b_${b}`,
                    year: (b: string, y: string) => `yoy_y_${b}_${y}`,
                    quarter: (b: string, y: string, q: string) => `yoy_q_${b}_${y}_${q}`,
                };

                function renderPctCell(ac: number, py: number, small: boolean) {
                    const p = pct(ac, py);
                    return (
                        <div className="flex items-center justify-center gap-1" dir="ltr">
                            <span className={small ? 'text-[10px] font-semibold' : 'text-[11px] font-bold'} style={{ color: p >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{p >= 0 ? '+' : ''}{p.toFixed(1)}</span>
                            <span style={{ width: small ? 5 : 6, height: small ? 5 : 6, borderRadius: '50%', background: p >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', display: 'inline-block' }} />
                        </div>
                    );
                }

                function chevron(open: boolean) {
                    return (
                        <span style={{ display: 'inline-flex', alignItems: 'center', width: 14, height: 14, borderRadius: 3, background: open ? 'rgba(37,99,235,0.12)' : 'var(--bg-elevated)' }}>
                            {open ? <ChevronDown size={10} style={{ color: 'var(--accent-blue)' }} /> : <ChevronLeft size={10} style={{ color: 'var(--text-muted)' }} />}
                        </span>
                    );
                }

                function renderYoyDeltaCell(delta: number) {
                    return (
                        <AnalyticsBarCell
                            value={Math.abs(delta)}
                            max={maxAbsDelta}
                            color={delta >= 0 ? '#3b82f6' : '#ef4444'}
                            text={fmtDelta(delta)}
                        />
                    );
                }

                return (
                    <div className="glass-panel p-0 overflow-hidden">
                        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                            <div className="flex items-center gap-2">
                                <ChartTitleFlagBadge flag="green" size="sm" />
                                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>مقارنة المبيعات: السنة الحالية مقابل السابقة</h3>
                            </div>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>تسلسل: سوق ← سنة ← ربع سنوي ← شهر — كل مستوى مغلق افتراضياً</p>
                        </div>
                        <div className="overflow-x-auto w-full min-w-0">
                            <AnalyticsTable
                                minWidth={780}
                                headers={[
                                    { label: 'سوق / سنة / ربع / شهر', align: 'right', width: 160 },
                                    { label: 'مبيعات العام السابق', align: 'center', width: 88 },
                                    { label: 'مبيعات العام الحالي', align: 'center', width: 88 },
                                    { label: 'الفرق', align: 'center', width: 300 },
                                    { label: 'التغير%', align: 'center', width: 88 },
                                ]}
                            >
                                    {yoyData.map(d => {
                                        const delta = d.ac - d.py;
                                        const deltaPct = pct(d.ac, d.py);
                                        const branchOpen = !!expandedCats[yoyKey.branch(d.branch)];
                                        return (
                                            <React.Fragment key={d.branch}>
                                                <tr
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => setExpandedCats(p => ({ ...p, [yoyKey.branch(d.branch)]: !p[yoyKey.branch(d.branch)] }))}
                                                >
                                                    <td style={{ ...analyticsTdBaseStyle('right'), fontWeight: 700, color: 'var(--text-primary)' }}>
                                                        <div className="flex items-center gap-1.5">
                                                            {chevron(branchOpen)}
                                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>سوق</span>
                                                            {d.branch}
                                                        </div>
                                                    </td>
                                                    <td style={analyticsTdBaseStyle('center')} dir="ltr">{fmt(d.py)}</td>
                                                    <td style={analyticsTdBaseStyle('center')} dir="ltr">{fmt(d.ac)}</td>
                                                    {renderYoyDeltaCell(delta)}
                                                    <td style={analyticsTdBaseStyle('center')}>{renderPctCell(d.ac, d.py, false)}</td>
                                                </tr>
                                                {branchOpen && d.years.map(y => {
                                                    const yk = yoyKey.year(d.branch, y.year);
                                                    const yearOpen = !!expandedCats[yk];
                                                    const yDelta = y.ac !== null ? (y.ac as number) - y.py : null;
                                                    const yPct = y.ac !== null ? pct(y.ac as number, y.py) : null;
                                                    return (
                                                        <React.Fragment key={y.year}>
                                                            <tr
                                                                style={{ cursor: 'pointer', background: 'var(--bg-elevated)' }}
                                                                onClick={e => { e.stopPropagation(); setExpandedCats(p => ({ ...p, [yk]: !p[yk] })); }}
                                                            >
                                                                <td style={{ ...analyticsTdBaseStyle('right'), paddingInlineStart: 22, color: 'var(--text-muted)', fontSize: 12 }}>
                                                                    <div className="flex items-center gap-1.5">
                                                                        {chevron(yearOpen)}
                                                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>سنة</span>
                                                                        <span style={{ marginInlineEnd: 4 }}>┃</span>
                                                                        {y.year}
                                                                    </div>
                                                                </td>
                                                                <td style={{ ...analyticsTdBaseStyle('center'), color: 'var(--text-muted)', fontSize: 12 }} dir="ltr">{fmt(y.py)}</td>
                                                                <td style={{ ...analyticsTdBaseStyle('center'), color: 'var(--text-muted)', fontSize: 12 }} dir="ltr">{y.ac !== null ? fmt(y.ac as number) : ''}</td>
                                                                {yDelta !== null ? renderYoyDeltaCell(yDelta) : <td style={analyticsTdBaseStyle('center')} />}
                                                                <td style={analyticsTdBaseStyle('center')}>
                                                                    {yPct !== null && renderPctCell(y.ac as number, y.py, true)}
                                                                </td>
                                                            </tr>
                                                            {yearOpen && y.quarters.map(q => {
                                                                const qk = yoyKey.quarter(d.branch, y.year, q.label);
                                                                const qOpen = !!expandedCats[qk];
                                                                const qDelta = q.ac !== null ? q.ac - q.py : null;
                                                                const qPct = q.ac !== null ? pct(q.ac, q.py) : null;
                                                                return (
                                                                    <React.Fragment key={q.label}>
                                                                        <tr
                                                                            style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.02)' }}
                                                                            onClick={e => { e.stopPropagation(); setExpandedCats(p => ({ ...p, [qk]: !p[qk] })); }}
                                                                        >
                                                                            <td style={{ ...analyticsTdBaseStyle('right'), paddingInlineStart: 40, color: 'var(--text-secondary)', fontSize: 12 }}>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    {chevron(qOpen)}
                                                                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>ربع</span>
                                                                                    <span style={{ marginInlineEnd: 4, color: 'var(--text-muted)' }}>┃</span>
                                                                                    {q.label}
                                                                                </div>
                                                                            </td>
                                                                            <td style={{ ...analyticsTdBaseStyle('center'), fontSize: 12, color: 'var(--text-secondary)' }} dir="ltr">{fmt(q.py)}</td>
                                                                            <td style={{ ...analyticsTdBaseStyle('center'), fontSize: 12, color: 'var(--text-secondary)' }} dir="ltr">{q.ac !== null ? fmt(q.ac) : ''}</td>
                                                                            {qDelta !== null ? renderYoyDeltaCell(qDelta) : <td style={analyticsTdBaseStyle('center')} />}
                                                                            <td style={analyticsTdBaseStyle('center')}>
                                                                                {qPct !== null && q.ac !== null && renderPctCell(q.ac, q.py, true)}
                                                                            </td>
                                                                        </tr>
                                                                        {qOpen && q.months.map(m => {
                                                                            const mDelta = m.ac !== null ? m.ac - m.py : null;
                                                                            const mPct = m.ac !== null ? pct(m.ac, m.py) : null;
                                                                            return (
                                                                                <tr key={m.name} style={{ background: 'var(--bg-elevated)' }}>
                                                                                    <td style={{ ...analyticsTdBaseStyle('right'), paddingInlineStart: 58, color: 'var(--text-muted)', fontSize: 11 }}>
                                                                                        <div className="flex items-center gap-1.5">
                                                                                            <span style={{ display: 'inline-block', width: 14 }} />
                                                                                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>شهر</span>
                                                                                            <span style={{ marginInlineEnd: 4 }}>┃</span>
                                                                                            {m.name}
                                                                                        </div>
                                                                                    </td>
                                                                                    <td style={{ ...analyticsTdBaseStyle('center'), fontSize: 11, color: 'var(--text-muted)' }} dir="ltr">{fmt(m.py)}</td>
                                                                                    <td style={{ ...analyticsTdBaseStyle('center'), fontSize: 11, color: 'var(--text-muted)' }} dir="ltr">{m.ac !== null ? fmt(m.ac) : ''}</td>
                                                                                    {mDelta !== null ? renderYoyDeltaCell(mDelta) : <td style={analyticsTdBaseStyle('center')} />}
                                                                                    <td style={analyticsTdBaseStyle('center')}>
                                                                                        {mPct !== null && m.ac !== null && (
                                                                                            <div className="flex items-center justify-center gap-1" dir="ltr">
                                                                                                <span className="text-[9px] font-semibold" style={{ color: mPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{mPct >= 0 ? '+' : ''}{mPct.toFixed(1)}</span>
                                                                                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: mPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', display: 'inline-block' }} />
                                                                                            </div>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </React.Fragment>
                                                                );
                                                            })}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    })}
                            </AnalyticsTable>
                        </div>
                    </div>
                );
            })()}
            {/* ── تحليل المنتجات: حجم المبيعات + متوسط السعر ── */}
            {(() => {
                const t1 = buildProductBubbleRows(BRANCH_PRODUCT_ANALYSIS, expandedCats, setExpandedCats, 'pv');
                const toBubble = (r: ProductBubbleRow, xValue: number, yValue: number): MetricsBubblePoint => {
                    /** قيمة تجريبية لمتوسط ربح السلة (تُشتق من ATV والسعر وحجم السلة) لتحجيم الفقاعات */
                    const basketProfit = Number((r.atv * 0.24 + r.price * r.basket * 0.42).toFixed(2));
                    return {
                        key: r.key,
                        label: r.label,
                        depth: r.depth as 0 | 1 | 2,
                        xValue,
                        yValue,
                        hasChildren: r.has,
                        open: r.open,
                        onClick: r.click,
                        vol: r.vol,
                        price: r.price,
                        basket: r.basket,
                        atv: r.atv,
                        basketProfit,
                    };
                };
                const bubblePoints1 = t1.map((r) => toBubble(r, r.vol, r.price));
                return (
                    <div className="glass-panel p-0 overflow-hidden w-full">
                        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                            <div className="flex items-center gap-2">
                                <ChartTitleFlagBadge flag="green" size="sm" />
                                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>تغير المبيعات حسب السعر</h3>
                            </div>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                انقر على دائرة الفرع أو الفئة للتوسيع • المحور الأفقي: الحجم، العمودي: م. السعر • حجم الدائرة: متوسط ربح السلة
                            </p>
                        </div>
                        <MetricsBubblePlot
                            points={bubblePoints1}
                            xLabel="متوسط حجم السلة"
                            yLabel="متوسط سعر السلة"
                            variant="blue"
                            plotHeight={420}
                            bubbleSizing="basketProfit"
                        />
                    </div>
                );
            })()}

            {/* ── خريطة الفروع + صافي المبيعات ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <BranchMap />
                <ChartCard title="صافي المبيعات عبر الزمن لكل فرع" titleFlag='green' subtitle="Net Sales Over Time by Branch" option={netSalesByBranchOption} height="460px" delay={2} />
            </div>
            {/* جدول التحليل التفصيلي — سوق / فئة / منتج */}
            <DrillDownTable />
            {/* <BranchSalesTable /> */}

            <EnterpriseTable title="دليل الفروع" titleFlag="green" columns={branchColumns} data={branches} pageSize={10} />
        </div >
    );
}
