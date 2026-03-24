'use client';

import '@/lib/echarts/register-bar-line-pie';
import dynamic from 'next/dynamic';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, BarChart3, Building2, FileText, Layers } from 'lucide-react';
import { ChartTitleFlagBadge } from '@/components/ui/ChartTitleFlagBadge';

const ChartCard = dynamic(() => import('@/components/ui/ChartCard'), {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
});
import { getMonthlySalesData, getProductData, type ProductData } from '@/lib/mockData';
import { PRIMARY_GREEN, PRIMARY_RED, PRIMARY_AMBER, PRIMARY_SLATE, PRIMARY_CYAN, PRIMARY_BLUE } from '@/lib/colors';
import EnterpriseTable from '@/components/ui/EnterpriseTable';
import type { TableColumn } from '@/components/ui/EnterpriseTable';
import TreeDrillDown from '@/components/ui/TreeDrillDown';
import DrillDownTable from '@/components/ui/DrillDownTable';

export default function SalesPage() {
    const salesData = useMemo(() => getMonthlySalesData(), []);
    const products = useMemo(() => getProductData(), []);
    const totalRevenue = salesData.reduce((a, b) => a + b.revenue, 0);
    const totalOrders = salesData.reduce((a, b) => a + b.orders, 0);
    const totalReturns = salesData.reduce((a, b) => a + b.returns, 0);
    const totalDiscount = Math.round(totalRevenue * 0.073);
    const totalCost = Math.round(totalRevenue * 0.65);

    const [selectedYear] = useState('2025');
    const [drillLevel, setDrillLevel] = useState<'year' | 'quarter' | 'month'>('month');
    const [drillSeriesMode, setDrillSeriesMode] = useState<'both' | 'sales' | 'profit'>('both');

    const salesKPIs = [
        { icon: DollarSign, label: 'تكلفة المواد', value: `${(totalCost / 1000000).toFixed(1)}M`, sublabel: 'د.أ', color: 'var(--accent-red)' },
        { icon: TrendingUp, label: 'قيمة المبيعات', value: `${(totalRevenue / 1000000).toFixed(1)}M`, sublabel: 'د.أ', color: 'var(--accent-green)' },
        { icon: BarChart3, label: 'قيمة الخصومات', value: `${(totalDiscount / 1000000).toFixed(2)}M`, sublabel: 'د.أ', color: 'var(--accent-amber)' },
        { icon: Building2, label: 'عدد الفروع', value: '47', sublabel: 'فرع نشط', color: 'var(--accent-blue)' },
        { icon: FileText, label: 'عدد الفواتير', value: totalOrders.toLocaleString('en-US'), sublabel: 'فاتورة', color: 'var(--accent-cyan)' },
        { icon: ShoppingCart, label: 'متوسط السلة', value: `${Math.round(totalRevenue / totalOrders)}`, sublabel: 'د.أ / فاتورة', color: 'var(--accent-purple)' },
    ];

    // ── مقارنة سنوية: العام الحالي مقابل السابق ──
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const currentYearData = salesData.map((d) => d.revenue);
    const previousYearData = currentYearData.map((v) => Math.round(v * (0.85 + Math.random() * 0.1)));

    const yoyComparisonOption = {
        xAxis: { type: 'category' as const, data: months },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
        series: [
            {
                name: `${selectedYear}`,
                type: 'bar',
                data: currentYearData,
                barWidth: 16,
                barGap: '20%',
                itemStyle: { color: PRIMARY_GREEN, borderRadius: [4, 4, 0, 0] },
            },
            {
                name: `${Number(selectedYear) - 1}`,
                type: 'bar',
                data: previousYearData,
                barWidth: 16,
                itemStyle: { color: PRIMARY_SLATE, borderRadius: [4, 4, 0, 0] },
            },
            {
                name: 'الفرق %',
                type: 'line',
                yAxisIndex: 0,
                data: currentYearData.map((v, i) => Math.round(((v - previousYearData[i]) / previousYearData[i]) * 100 * 100) / 100),
                lineStyle: { color: PRIMARY_CYAN, width: 2, type: 'dashed' as const },
                itemStyle: { color: PRIMARY_CYAN },
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

    // ── Drill-down: بيانات حسب المستوى ──
    const getDrillData = () => {
        if (drillLevel === 'year') {
            const values = [22000000, 24500000, totalRevenue];
            return { labels: ['2023', '2024', '2025'], values, profits: values.map((v, i) => Math.round(v * [0.22, 0.25, 0.28][i])) };
        }
        if (drillLevel === 'quarter') {
            const values = [totalRevenue * 0.22, totalRevenue * 0.26, totalRevenue * 0.24, totalRevenue * 0.28];
            return { labels: ['الربع 1', 'الربع 2', 'الربع 3', 'الربع 4'], values, profits: values.map((v, i) => Math.round(v * [0.24, 0.29, 0.26, 0.31][i])) };
        }
        return { labels: months, values: currentYearData, profits: currentYearData.map((v) => Math.round(v * (0.22 + Math.random() * 0.12))) };
    };
    const drillData = getDrillData();

    const salesYAxis = {
        type: 'value' as const,
        name: 'المبيعات',
        axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
    };
    const profitYAxis = {
        type: 'value' as const,
        name: 'الأرباح',
        axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
    };
    const salesBarSeries = {
        name: 'المبيعات',
        type: 'bar' as const,
        data: drillData.values,
        barWidth: drillLevel === 'month' ? 18 : 40,
        itemStyle: { color: PRIMARY_GREEN, borderRadius: [4, 4, 0, 0] },
    };
    const profitLineSeries = {
        name: 'الأرباح',
        type: 'line' as const,
        yAxisIndex: drillSeriesMode === 'both' ? 1 : 0,
        data: drillData.profits,
        lineStyle: { color: PRIMARY_CYAN, width: 2.5 },
        itemStyle: { color: PRIMARY_CYAN, borderWidth: 2 },
        symbol: 'circle' as const,
        symbolSize: 8,
        smooth: true,
        areaStyle: { color: 'rgba(8,145,178,0.08)' },
    };

    const drillDownOption =
        drillSeriesMode === 'both'
            ? {
                xAxis: { type: 'category' as const, data: drillData.labels },
                yAxis: [salesYAxis, profitYAxis],
                series: [salesBarSeries, profitLineSeries],
                legend: {
                    data: ['المبيعات', 'الأرباح'],
                    bottom: 0,
                    left: 'center',
                    textStyle: { color: '#94a3b8', fontSize: 11 },
                },
                grid: { bottom: '15%' },
            }
            : drillSeriesMode === 'sales'
                ? {
                    xAxis: { type: 'category' as const, data: drillData.labels },
                    yAxis: salesYAxis,
                    series: [salesBarSeries],
                    legend: {
                        data: ['المبيعات'],
                        bottom: 0,
                        left: 'center',
                        textStyle: { color: '#94a3b8', fontSize: 11 },
                    },
                    grid: { bottom: '15%' },
                }
                : {
                    xAxis: { type: 'category' as const, data: drillData.labels },
                    yAxis: profitYAxis,
                    series: [profitLineSeries],
                    legend: {
                        data: ['الأرباح'],
                        bottom: 0,
                        left: 'center',
                        textStyle: { color: '#94a3b8', fontSize: 11 },
                    },
                    grid: { bottom: '15%' },
                };

    // ── مبيعات مقابل أرباح حسب المنتج ──
    const salesVsProfitOption = {
        xAxis: { type: 'category' as const, data: products.slice(0, 8).map((p) => p.nameAr.split(' ').slice(0, 2).join(' ')), axisLabel: { rotate: 35, fontSize: 10 } },
        yAxis: [
            { type: 'value' as const, name: 'الكمية', axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` } },
            { type: 'value' as const, name: 'الأرباح', axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` } },
        ],
        series: [
            {
                name: 'الكمية المباعة',
                type: 'bar',
                data: products.slice(0, 8).map((p) => p.unitsSold),
                itemStyle: { color: PRIMARY_BLUE, borderRadius: [4, 4, 0, 0] },
                barWidth: 16,
            },
            {
                name: 'الأرباح',
                type: 'line',
                yAxisIndex: 1,
                data: products.slice(0, 8).map((p) => Math.round(p.revenue * p.margin / 100)),
                lineStyle: { color: PRIMARY_GREEN, width: 2 },
                itemStyle: { color: PRIMARY_GREEN },
            },
        ],
        legend: { data: ['الكمية المباعة', 'الأرباح'], bottom: 0, left: 'center' },
        grid: { bottom: '20%' },
    };

    // ── شلال الإيرادات ──
    const waterfallOption = {
        xAxis: { type: 'category' as const, data: ['إجمالي المبيعات', 'التكاليف', 'الخصومات', 'المرتجعات', 'صافي الربح'] },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
        series: [{
            type: 'bar',
            data: [
                { value: totalRevenue, itemStyle: { color: PRIMARY_GREEN, borderRadius: [4, 4, 0, 0] } },
                { value: totalCost, itemStyle: { color: PRIMARY_RED, borderRadius: [4, 4, 0, 0] } },
                { value: totalDiscount, itemStyle: { color: PRIMARY_AMBER, borderRadius: [4, 4, 0, 0] } },
                { value: totalReturns * 50, itemStyle: { color: PRIMARY_RED, borderRadius: [4, 4, 0, 0] } },
                {
                    value: totalRevenue - totalCost - totalDiscount - totalReturns * 50,
                    itemStyle: { color: PRIMARY_GREEN, borderRadius: [4, 4, 0, 0] },
                },
            ],
            barWidth: 36,
        }],
    };

    const prodColumns: TableColumn<ProductData>[] = [
        { key: 'nameAr', header: 'المنتج', sortable: true },
        { key: 'categoryAr', header: 'الفئة', sortable: true },
        { key: 'price', header: 'السعر', sortable: true, align: 'right', format: 'currency' },
        { key: 'unitsSold', header: 'الوحدات', sortable: true, align: 'right', format: 'number' },
        { key: 'revenue', header: 'الإيرادات', sortable: true, align: 'right', format: 'currency' },
        { key: 'margin', header: 'الهامش', sortable: true, align: 'right', format: 'percent' },
    ];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-1">
                    <TrendingUp size={24} style={{ color: PRIMARY_GREEN }} />
                    <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>أداء المبيعات</h1>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>تحليل شامل للمبيعات — التقرير الأول</p>
            </motion.div>

            {/* 6 KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {salesKPIs.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="glass-panel p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <s.icon size={14} style={{ color: s.color }} />
                            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                        </div>
                        <p className="text-lg font-bold" style={{ color: s.color }} dir="ltr">{s.value}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.sublabel}</p>
                    </motion.div>
                ))}
            </div>
            {/* Drill-Down */}
            <ChartCard
                title="صافي الأرباح والمبيعات حسب التاريخ"
                subtitle="انقر على المستوى للتعمق في البيانات"
                titleFlag="green"
                headerExtra={
                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3">
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                            <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>المؤشر:</span>
                            {(
                                [
                                    ['sales', 'المبيعات'],
                                    ['profit', 'الأرباح'],
                                    ['both', 'كلاهما'],
                                ] as const
                            ).map(([mode, label]) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setDrillSeriesMode(mode)}
                                    className="px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors"
                                    style={{
                                        background: drillSeriesMode === mode ? 'rgba(14,165,233,0.15)' : 'var(--bg-elevated)',
                                        color: drillSeriesMode === mode ? PRIMARY_CYAN : 'var(--text-muted)',
                                        border: `1px solid ${drillSeriesMode === mode ? PRIMARY_CYAN : 'var(--border-subtle)'}`,
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="hidden sm:block h-6 w-px shrink-0" style={{ background: 'var(--border-subtle)' }} aria-hidden />
                        <div className="flex items-center gap-1 flex-wrap justify-end">
                            <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>المستوى:</span>
                            {([['year', 'سنة'], ['quarter', 'ربع'], ['month', 'شهر']] as const).map(([level, label]) => (
                                <button key={level} type="button" onClick={() => setDrillLevel(level)}
                                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                                    style={{
                                        background: drillLevel === level ? 'var(--accent-green-dim)' : 'var(--bg-elevated)',
                                        color: drillLevel === level ? 'var(--accent-green)' : 'var(--text-muted)',
                                        border: `1px solid ${drillLevel === level ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
                                    }}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                }
                option={drillDownOption}
                height="280px"
            />

            {/* مبيعات مقابل أرباح + شلال */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ChartCard title="صافي الأرباح والمبيعات حسب التصنيف" subtitle='مقارنة حسب التصنيف' titleFlag='green' option={salesVsProfitOption} height="340px" delay={2} />
                <ChartCard title="شلال الإيرادات" titleFlag='blue' subtitle="من إجمالي المبيعات إلى صافي الربح" option={waterfallOption} height="340px" delay={3} />
            </div>

            {/* ── Decomposition Tree Drill-Down ── */}
            <TreeDrillDown />

            {/* ── الجدول التفصيلي: سنة / ربع / شهر مع YoY وMoM ── */}
            <div className="glass-panel overflow-hidden">
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-2">
                        <ChartTitleFlagBadge flag="green" size="sm" />
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>التحليل الزمني التفصيلي للمبيعات</h3>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>صافي المبيعات • صافي المبيعات YoY (العام السابق) • YoY% • MoM% • عدد الفواتير • هامش الربح</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="enterprise-table">
                        <thead>
                            <tr>
                                <th>السنة</th>
                                <th>الربع</th>
                                <th>الشهر</th>
                                <th style={{ textAlign: 'left' }}>صافي المبيعات</th>
                                <th style={{ textAlign: 'left' }}>صافي المبيعات YoY</th>
                                <th style={{ textAlign: 'center' }}>نمو YoY%</th>
                                <th style={{ textAlign: 'center' }}>نمو MoM%</th>
                                <th style={{ textAlign: 'center' }}>عدد الفواتير</th>
                                <th style={{ textAlign: 'center' }}>هامش الربح %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {([
                                { year: '2022', quarter: 'الربع 1', month: 'مارس', net: 2065, yoy: 61.51, mom: 62.73, invoices: 823, margin: 53.94 },
                                { year: '2022', quarter: 'الربع 1', month: 'فبراير', net: 1513, yoy: 29.49, mom: 6.76, invoices: 614, margin: 60.93 },
                                { year: '2022', quarter: 'الربع 1', month: 'يناير', net: 1418, yoy: 70.89, mom: null, invoices: 581, margin: 59.84 },
                                { year: '2021', quarter: 'الربع 1', month: 'مارس', net: 1284, yoy: -29.39, mom: 30.47, invoices: 547, margin: 26.04 },
                                { year: '2021', quarter: 'الربع 1', month: 'فبراير', net: 1665, yoy: 260.29, mom: 40.90, invoices: 515, margin: 27.83 },
                                { year: '2021', quarter: 'الربع 1', month: 'يناير', net: 831, yoy: null, mom: null, invoices: 334, margin: 31.07 },
                                { year: '2020', quarter: 'الربع 1', month: 'مارس', net: 1821, yoy: null, mom: 565.75, invoices: 649, margin: 2.24 },
                                { year: '2020', quarter: 'الربع 1', month: 'فبراير', net: 273, yoy: null, mom: null, invoices: 113, margin: 1.49 },
                            ] as { year: string; quarter: string; month: string; net: number; yoy: number | null; mom: number | null; invoices: number; margin: number }[]).map((row, i) => {
                                const netYoyPrior =
                                    row.yoy != null && row.yoy !== -100 ? Math.round(row.net / (1 + row.yoy / 100)) : null;
                                return (
                                <tr key={i}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{row.year}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{row.quarter}</td>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{row.month}</td>
                                    <td style={{ textAlign: 'left' }}>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-semibold" style={{ color: 'var(--accent-blue)' }} dir="ltr">{row.net.toLocaleString('en-US')}</span>
                                            <div style={{ width: `${Math.min(row.net / 25, 80)}px`, height: '6px', borderRadius: '3px', background: 'var(--accent-blue)', opacity: 0.5 }} />
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'left' }}>
                                        {netYoyPrior != null ? (
                                            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }} dir="ltr">{netYoyPrior.toLocaleString('en-US')}</span>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>—</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {row.yoy != null ? (
                                            <span className="inline-flex items-center gap-0.5 text-xs font-semibold" style={{ color: row.yoy >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }} dir="ltr">
                                                {row.yoy >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                {row.yoy >= 0 ? '+' : ''}{row.yoy.toFixed(2)}%
                                            </span>
                                        ) : <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>—</span>}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {row.mom != null ? (
                                            <span className="inline-flex items-center gap-0.5 text-xs font-semibold" style={{ color: row.mom >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }} dir="ltr">
                                                {row.mom >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                {row.mom >= 0 ? '+' : ''}{row.mom.toFixed(2)}%
                                            </span>
                                        ) : <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>—</span>}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }} dir="ltr">{row.invoices.toLocaleString('en-US')}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="text-xs font-semibold" style={{ color: row.margin > 20 ? 'var(--accent-green)' : row.margin > 10 ? 'var(--accent-amber)' : 'var(--accent-red)' }} dir="ltr">
                                            {row.margin.toFixed(2)}%
                                        </span>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* جدول التحليل التفصيلي — سوق / فئة / منتج */}
            <DrillDownTable />
        </div>
    );
}
