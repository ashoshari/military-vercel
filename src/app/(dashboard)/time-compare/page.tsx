'use client';

import '@/lib/echarts/register-bar-line-pie';
import dynamic from 'next/dynamic';
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, TrendingUp, DollarSign, BarChart3, Percent } from 'lucide-react';
import { getMonthlySalesData } from '@/lib/mockData';
import { useResolvedAnalyticsPalette } from '@/hooks/useResolvedAnalyticsPalette';

const ChartCard = dynamic(() => import('@/components/ui/ChartCard'), {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
});

// ── بيانات الفترة 1 (Feb 2020 → Jan 2021) ──
const p1Dates = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2020, 1 + i, 1);
    return d.toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' });
});
const p1Sales = [1200, 1400, 2800, 3400, 1800, 2200, 1600, 2000, 1900, 2600, 3000, 2100];

// ── بيانات الفترة 2 (Nov 2021 → Aug 2023) ──
const p2Dates = Array.from({ length: 22 }, (_, i) => {
    const d = new Date(2021, 10 + i, 1);
    return d.toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' });
});
const p2Sales = [3200, 3800, 4200, 5400, 4800, 5200, 4000, 3600, 6200, 5800, 7200, 8400, 6800, 5600, 7800, 8200, 9400, 7600, 8800, 6400, 7000, 9800];

// ── بيانات الفروع ──
const branches = ['سوق المنارة', 'سوق سلاح الجو'];
const branchNetSalesP1 = [42000, 26000];
const branchNetSalesP2 = [177000, 89000];
const branchProfitP1 = [14000, 8500];
const branchProfitP2 = [51000, 31000];
const branchDiscountP1 = [3200, 1800];
const branchDiscountP2 = [12000, 6500];

// ── بيانات فئات المنتجات ──
const categories = ['أجهزة', 'العناية', 'غير مصنف', 'فرفاشية', 'أعمال', 'منزلية', 'غذائية', 'ورقية', 'منظفات'];
const catNetP1 = [1400, 4200, 8500, 100, 350, 5200, 15000, 3800, 3400];
const catNetP2 = [3200, 12500, 22000, 300, 1200, 14800, 57500, 8400, 9100];
const catProfP1 = [400, 1200, 2800, 30, 100, 1500, 5200, 1100, 950];
const catProfP2 = [1100, 4200, 7800, 100, 380, 5200, 22000, 3100, 3200];

const selectedYear = '2025';
const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function TimeComparePage() {
    const palette = useResolvedAnalyticsPalette();
    const [period1] = useState({ from: '2020-02-17', to: '2021-01-27' });
    const [period2] = useState({ from: '2021-11-08', to: '2023-08-23' });

    const salesData = useMemo(() => getMonthlySalesData(), []);
    const currentYearData = salesData.map((d) => d.revenue);
    const previousYearData = currentYearData.map((v) => Math.round(v * 0.88));

    const yoyComparisonOption = {
        xAxis: { type: 'category' as const, data: monthsAr },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
        series: [
            {
                name: `${selectedYear}`,
                type: 'bar' as const,
                data: currentYearData,
                barWidth: 16,
                barGap: '20%',
                itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] },
            },
            {
                name: `${Number(selectedYear) - 1}`,
                type: 'bar' as const,
                data: previousYearData,
                barWidth: 16,
                itemStyle: { color: palette.primarySlate, borderRadius: [4, 4, 0, 0] },
            },
            {
                name: 'الفرق %',
                type: 'line' as const,
                yAxisIndex: 0,
                data: currentYearData.map((v, i) =>
                    Math.round(((v - previousYearData[i]) / previousYearData[i]) * 100 * 100) / 100
                ),
                lineStyle: { color: palette.primaryCyan, width: 2, type: 'dashed' as const },
                itemStyle: { color: palette.primaryCyan },
                tooltip: { valueFormatter: (v: number) => `${v}%` },
            },
        ],
        legend: {
            data: [`${selectedYear}`, `${Number(selectedYear) - 1}`, 'الفرق %'],
            bottom: 0,
            left: 'center',
            textStyle: { color: 'var(--text-muted)' },
        },
    };

    const totalP1 = 68000;
    const totalP2 = 177000;
    const salesChange = totalP2 - totalP1;
    const salesChangePct = ((salesChange / totalP1) * 100).toFixed(2);

    // ── صافي المبيعات الفترة 1 ──
    const p1Option = {
        tooltip: { trigger: 'axis' as const },
        grid: { left: '10%', right: '4%', top: '8%', bottom: '14%' },
        xAxis: { type: 'category' as const, data: p1Dates, axisLabel: { fontSize: 8, rotate: 30 } },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(1)}K`, fontSize: 9 } },
        series: [{
            type: 'line' as const, data: p1Sales, smooth: false, showSymbol: false,
            lineStyle: { width: 1.5, color: '#2563eb' },
            areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(37,99,235,0.2)' }, { offset: 1, color: 'rgba(37,99,235,0.01)' }] } },
        }],
    };

    // ── صافي المبيعات الفترة 2 ──
    const p2Option = {
        tooltip: { trigger: 'axis' as const },
        grid: { left: '10%', right: '4%', top: '8%', bottom: '14%' },
        xAxis: { type: 'category' as const, data: p2Dates, axisLabel: { fontSize: 8, rotate: 30 } },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(1)}K`, fontSize: 9 } },
        series: [{
            type: 'line' as const, data: p2Sales, smooth: false, showSymbol: false,
            lineStyle: { width: 1.5, color: '#2563eb' },
            areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(37,99,235,0.2)' }, { offset: 1, color: 'rgba(37,99,235,0.01)' }] } },
        }],
    };

    // ── ATV حسب الفترة (horizontal bar) ──
    const atvOption = {
        tooltip: { trigger: 'axis' as const },
        grid: { left: '28%', right: '8%', top: '8%', bottom: '8%' },
        xAxis: { type: 'value' as const, axisLabel: { fontSize: 9 }, max: 100, name: '%', nameLocation: 'end' as const },
        yAxis: {
            type: 'category' as const,
            data: ['ATV (كامل الفترة)', 'ATV الفترة 1', 'ATV الفترة 2'],
            inverse: true,
            axisLabel: { fontSize: 9 },
        },
        series: [{
            type: 'bar' as const, barWidth: 18,
            data: [
                { value: 28.36, itemStyle: { color: '#047857', borderRadius: [0, 4, 4, 0] } },
                { value: 2.44, itemStyle: { color: '#3b82f6', borderRadius: [0, 4, 4, 0] } },
                { value: 15.10, itemStyle: { color: '#3b82f6', borderRadius: [0, 4, 4, 0] } },
            ],
            label: { show: true, position: 'right' as const, fontSize: 10, fontWeight: 'bold' as const, formatter: '{c}' },
        }],
    };

    // ── صافي المبيعات حسب الفرع ──
    const branchSalesOption = {
        tooltip: { trigger: 'axis' as const },
        legend: { data: ['الفترة 1', 'الفترة 2'], top: 4, textStyle: { fontSize: 9 } },
        grid: { left: '8%', right: '4%', top: '18%', bottom: '14%' },
        xAxis: { type: 'category' as const, data: branches, axisLabel: { fontSize: 9 } },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K`, fontSize: 9 } },
        series: [
            { name: 'الفترة 1', type: 'bar' as const, barWidth: 28, data: branchNetSalesP1.map(v => ({ value: v, itemStyle: { color: '#047857', borderRadius: [4, 4, 0, 0] } })) },
            { name: 'الفترة 2', type: 'bar' as const, barWidth: 28, data: branchNetSalesP2.map(v => ({ value: v, itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } })) },
        ],
    };

    // ── قيمة الربح حسب الفرع ──
    const branchProfitOption = {
        tooltip: { trigger: 'axis' as const },
        legend: { data: ['الفترة 1', 'الفترة 2'], top: 4, textStyle: { fontSize: 9 } },
        grid: { left: '8%', right: '4%', top: '18%', bottom: '14%' },
        xAxis: { type: 'category' as const, data: branches, axisLabel: { fontSize: 9 } },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K`, fontSize: 9 } },
        series: [
            { name: 'الفترة 1', type: 'bar' as const, barWidth: 28, data: branchProfitP1.map(v => ({ value: v, itemStyle: { color: '#047857', borderRadius: [4, 4, 0, 0] } })) },
            { name: 'الفترة 2', type: 'bar' as const, barWidth: 28, data: branchProfitP2.map(v => ({ value: v, itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } })) },
        ],
    };

    // ── قيمة الخصم حسب الفترة (Pie) ──
    const discountPieOption = {
        tooltip: { trigger: 'item' as const, formatter: '{b}: {c} ({d}%)' },
        legend: { data: ['الفترة 1', 'الفترة 2'], bottom: 0, textStyle: { fontSize: 9 } },
        series: [{
            type: 'pie' as const, radius: ['40%', '70%'], center: ['50%', '45%'],
            label: { show: true, formatter: '{c}K\n({d}%)', fontSize: 9 },
            data: [
                { value: 12.2, name: 'الفترة 1', itemStyle: { color: '#047857' } },
                { value: 100.87, name: 'الفترة 2', itemStyle: { color: '#3b82f6' } },
            ],
        }],
    };

    // ── عدد المعاملات حسب الفترة (Pie) ──
    const txPieOption = {
        tooltip: { trigger: 'item' as const, formatter: '{b}: {c} ({d}%)' },
        legend: { data: ['الفترة 1', 'الفترة 2'], bottom: 0, textStyle: { fontSize: 9 } },
        series: [{
            type: 'pie' as const, radius: ['40%', '70%'], center: ['50%', '45%'],
            label: { show: true, formatter: '{c}K\n({d}%)', fontSize: 9 },
            data: [
                { value: 50, name: 'الفترة 1', itemStyle: { color: '#047857' } },
                { value: 28, name: 'الفترة 2', itemStyle: { color: '#3b82f6' } },
            ],
        }],
    };

    // ── قيمة الخصم حسب الفرع (بار 1) ──
    const discBranch1Option = {
        tooltip: { trigger: 'axis' as const },
        legend: { data: ['الفترة 1', 'الفترة 2'], top: 4, textStyle: { fontSize: 9 } },
        grid: { left: '8%', right: '4%', top: '18%', bottom: '14%' },
        xAxis: { type: 'category' as const, data: branches, axisLabel: { fontSize: 9 } },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K`, fontSize: 9 } },
        series: [
            { name: 'الفترة 1', type: 'bar' as const, barWidth: 28, data: branchDiscountP1.map(v => ({ value: v, itemStyle: { color: '#047857', borderRadius: [4, 4, 0, 0] } })) },
            { name: 'الفترة 2', type: 'bar' as const, barWidth: 28, data: branchDiscountP2.map(v => ({ value: v, itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } })) },
        ],
    };

    // ── قيمة الخصم حسب الفئة (بار 2) ──
    const discCatOption = {
        tooltip: { trigger: 'axis' as const },
        legend: { data: ['الفترة 1', 'الفترة 2'], top: 4, textStyle: { fontSize: 9 } },
        grid: { left: '8%', right: '4%', top: '18%', bottom: '20%' },
        xAxis: { type: 'category' as const, data: categories, axisLabel: { fontSize: 8, rotate: 25 } },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K`, fontSize: 9 } },
        series: [
            { name: 'الفترة 1', type: 'bar' as const, barWidth: 14, data: catNetP1.map(v => ({ value: v, itemStyle: { color: '#047857', borderRadius: [3, 3, 0, 0] } })) },
            { name: 'الفترة 2', type: 'bar' as const, barWidth: 14, data: catNetP2.map(v => ({ value: v, itemStyle: { color: '#3b82f6', borderRadius: [3, 3, 0, 0] } })) },
        ],
    };

    return (
        <div className="space-y-6">
            {/* عنوان */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-1">
                    <Clock size={22} style={{ color: 'var(--accent-blue)' }} />
                    <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>التحليل والمقارنة الزمنية</h1>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-blue)' }} />
                        <span className="text-[10px]" style={{ color: 'var(--accent-blue)' }}>التقرير الثالث عشر</span>
                    </div>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>تحليل ومقارنة الأداء خلال فترة زمنية محددة لدعم اتخاذ القرار — Period Comparison Analysis</p>
            </motion.div>

            {/* اختيار الفترات + KPIs */}
            <div className="glass-panel p-4">
                <div className="flex flex-wrap items-center gap-6 mb-4">
                    {/* الفترة 1 */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: 'rgba(4,120,87,0.1)', color: 'var(--accent-green)' }}>الفترة 1</span>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                            <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                            <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }} dir="ltr">{period1.from}</span>
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>إلى</span>
                            <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }} dir="ltr">{period1.to}</span>
                        </div>
                    </div>
                    {/* الفترة 2 */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--accent-blue)' }}>الفترة 2</span>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                            <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                            <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }} dir="ltr">{period2.from}</span>
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>إلى</span>
                            <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }} dir="ltr">{period2.to}</span>
                        </div>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'صافي المبيعات الفترة 1', value: '68K', color: 'var(--accent-green)', icon: DollarSign },
                        { label: 'صافي المبيعات الفترة 2', value: '177K', color: 'var(--accent-blue)', icon: DollarSign },
                        { label: 'التغير في المبيعات', value: '109K', color: 'var(--accent-cyan)', icon: TrendingUp },
                        { label: '% التغير في المبيعات', value: `${salesChangePct}%`, color: 'var(--accent-amber)', icon: Percent },
                    ].map((k, i) => (
                        <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                            <div className="flex items-center gap-1.5 mb-1">
                                <k.icon size={12} style={{ color: k.color }} />
                                <span className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>{k.label}</span>
                            </div>
                            <p className="text-xl font-bold" style={{ color: k.color }} dir="ltr">{k.value}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* صافي المبيعات الفترة 1 + الفترة 2 + ATV */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <ChartCard title="صافي المبيعات — الفترة 1" titleFlag="green" subtitle="Net Sales Period 1 by Date" option={p1Option} height="280px" delay={1} />
                <ChartCard title="صافي المبيعات — الفترة 2" titleFlag="green" subtitle="Net Sales Period 2 by Date" option={p2Option} height="280px" delay={2} />
                <ChartCard title="ATV حسب الفترة" titleFlag="green" subtitle="متوسط قيمة المعاملة" option={atvOption} height="280px" delay={3} />
            </div>

            {/* صافي المبيعات حسب الفرع + الربح حسب الفرع + دائري الخصم */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <ChartCard title="صافي المبيعات حسب الفرع والفترة" titleFlag="green" subtitle="Net Sales by Branch & Period" option={branchSalesOption} height="300px" delay={1} />
                <ChartCard title="قيمة الربح حسب الفرع والفترة" titleFlag="green" subtitle="Profit Value by Branch & Period" option={branchProfitOption} height="300px" delay={2} />
                <ChartCard title="قيمة الخصم حسب الفترة" titleFlag="green" subtitle="Discount Value by Period" option={discountPieOption} height="300px" delay={3} />
            </div>

            {/* خصم حسب الفرع (بار) + خصم حسب الفئة (بار) + دائري المعاملات */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <ChartCard title="قيمة الخصم حسب الفرع" titleFlag="green" subtitle="Discount Value by Branch & Period" option={discBranch1Option} height="300px" delay={1} />
                <ChartCard title="قيمة الخصم حسب الفئة" titleFlag="green" subtitle="Discount Value by Category & Period" option={discCatOption} height="300px" delay={2} />
                <ChartCard title="عدد المعاملات حسب الفترة" titleFlag="green" subtitle="No. of Transactions by Period" option={txPieOption} height="300px" delay={3} />
            </div>

            <ChartCard
                title="مقارنة المبيعات — العام الحالي مقابل السابق"
                titleFlag="blue"
                subtitle="مقارنة شهرية مع نسبة التغيير"
                option={yoyComparisonOption}
                height="340px"
                delay={1}
            />
        </div>
    );
}
