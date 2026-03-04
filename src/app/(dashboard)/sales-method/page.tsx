'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ShoppingBag, DollarSign, ArrowLeftRight, Users, Shield } from 'lucide-react';
import ChartCard from '@/components/ui/ChartCard';

// ── بيانات نوع الدفع ──
const paymentRows = [
    { method: 'نقدي', sales: 336540, volume: 4120, margin: 22.1 },
    { method: 'فيزا / ماستركارد', sales: 78920, volume: 980, margin: 19.5 },
    { method: 'كوبون / قسيمة', sales: 10370, volume: 142, margin: 14.3 },
];

// ── بيانات نوع البيع ──
const salesTypeRows = [
    { type: 'بطاقة عسكرية', typeAr: 'Army Cards', sales: 299850, volume: 3680, margin: 21.4 },
    { type: 'مدني', typeAr: 'Casual', sales: 126000, volume: 1462, margin: 17.8 },
];

export default function SalesMethodPage() {

    // ── مخطط طرق الدفع (أعمدة + خط للكمية) ──
    const paymentTypeOption = {
        xAxis: { type: 'category' as const, data: paymentRows.map(r => r.method) },
        yAxis: [
            { type: 'value' as const, name: 'صافي المبيعات', axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` } },
            { type: 'value' as const, name: 'حجم المبيعات (وحدة)' },
        ],
        series: [
            {
                name: 'صافي المبيعات',
                type: 'bar',
                data: paymentRows.map((r, i) => ({
                    value: r.sales,
                    itemStyle: {
                        color: ['#22c55e', '#0ea5e9', '#3b82f6'][i],
                        borderRadius: [4, 4, 0, 0],
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: `${(r.sales / 1000).toFixed(1)}K`,
                        color: '#94a3b8',
                        fontSize: 10,
                    },
                })),
                barWidth: 40,
            },
            {
                name: 'حجم المبيعات',
                type: 'line',
                yAxisIndex: 1,
                data: paymentRows.map(r => r.volume),
                lineStyle: { color: '#64748b', width: 2 },
                itemStyle: { color: '#64748b' },
                symbol: 'circle',
                symbolSize: 8,
            },
        ],
        legend: { data: ['صافي المبيعات', 'حجم المبيعات'], bottom: 0, left: 'center' },
    };

    // ── مخطط نوع البيع (أعمدة + خط للكمية) ──
    const salesTypeOption = {
        xAxis: { type: 'category' as const, data: salesTypeRows.map(r => r.type) },
        yAxis: [
            { type: 'value' as const, name: 'صافي المبيعات', axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` } },
            { type: 'value' as const, name: 'حجم المبيعات (وحدة)' },
        ],
        series: [
            {
                name: 'صافي المبيعات',
                type: 'bar',
                data: salesTypeRows.map((r, i) => ({
                    value: r.sales,
                    itemStyle: {
                        color: ['#22c55e', '#0ea5e9'][i],
                        borderRadius: [4, 4, 0, 0],
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: `${(r.sales / 1000).toFixed(1)}K`,
                        color: '#94a3b8',
                        fontSize: 10,
                    },
                })),
                barWidth: 60,
            },
            {
                name: 'حجم المبيعات',
                type: 'line',
                yAxisIndex: 1,
                data: salesTypeRows.map(r => r.volume),
                lineStyle: { color: '#64748b', width: 2 },
                itemStyle: { color: '#64748b' },
                symbol: 'circle',
                symbolSize: 8,
            },
        ],
        legend: { data: ['صافي المبيعات', 'حجم المبيعات'], bottom: 0, left: 'center' },
    };

    // ── اتجاه طرق الدفع شهرياً ──
    const methodTrendOption = {
        xAxis: { type: 'category' as const, data: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'] },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
        series: [
            {
                name: 'نقدي',
                type: 'line',
                stack: 'total',
                data: [850000, 820000, 900000, 880000, 870000, 950000, 920000, 910000, 980000, 940000, 1000000, 1100000],
                areaStyle: { opacity: 0.3 },
                lineStyle: { color: '#22c55e', width: 2 },
                itemStyle: { color: '#22c55e' },
            },
            {
                name: 'فيزا/ماستركارد',
                type: 'line',
                stack: 'total',
                data: [560000, 580000, 620000, 600000, 630000, 700000, 680000, 690000, 730000, 720000, 780000, 850000],
                areaStyle: { opacity: 0.3 },
                lineStyle: { color: '#0ea5e9', width: 2 },
                itemStyle: { color: '#0ea5e9' },
            },
            {
                name: 'كوبون / قسيمة',
                type: 'line',
                stack: 'total',
                data: [80000, 90000, 100000, 110000, 95000, 120000, 115000, 108000, 125000, 118000, 130000, 145000],
                areaStyle: { opacity: 0.3 },
                lineStyle: { color: '#f59e0b', width: 2 },
                itemStyle: { color: '#f59e0b' },
            },
            {
                name: 'دفع لاحق',
                type: 'line',
                stack: 'total',
                data: [200000, 190000, 210000, 220000, 200000, 230000, 220000, 210000, 240000, 230000, 250000, 280000],
                areaStyle: { opacity: 0.3 },
                lineStyle: { color: '#6366f1', width: 2 },
                itemStyle: { color: '#6366f1' },
            },
        ],
        legend: { data: ['نقدي', 'فيزا/ماستركارد', 'كوبون / قسيمة', 'دفع لاحق'], bottom: 0, left: 'center' },
    };

    // ── الإيرادات والهامش حسب الطريقة ──
    const profitByMethodOption = {
        xAxis: { type: 'category' as const, data: ['نقدي', 'فيزا/ماستركارد', 'كوبون / قسيمة', 'دفع لاحق', 'آجل'] },
        yAxis: [
            { type: 'value' as const, name: 'الإيرادات', axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
            { type: 'value' as const, name: 'الهامش %' },
        ],
        series: [
            {
                name: 'الإيرادات',
                type: 'bar',
                data: [10300000, 6900000, 1200000, 2500000, 800000].map((v) => ({
                    value: v,
                    itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] },
                })),
                barWidth: 36,
            },
            {
                name: 'هامش الربح',
                type: 'line',
                yAxisIndex: 1,
                data: [22.1, 19.5, 14.3, 15.3, 12.7],
                lineStyle: { color: '#f59e0b', width: 2 },
                itemStyle: { color: '#f59e0b' },
            },
        ],
        legend: { data: ['الإيرادات', 'هامش الربح'], bottom: 0, left: 'center' },
    };

    // ── نوع البيع اتجاه شهري ──
    const salesTypeTrendOption = {
        xAxis: { type: 'category' as const, data: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'] },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
        series: [
            {
                name: 'بطاقة عسكرية',
                type: 'bar',
                data: [2200000, 2150000, 2400000, 2350000, 2300000, 2600000, 2500000, 2450000, 2700000, 2600000, 2800000, 3100000].map(
                    (v) => ({ value: v, itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] } })
                ),
                barWidth: 14,
                barGap: '20%',
            },
            {
                name: 'مدني',
                type: 'bar',
                data: [850000, 830000, 950000, 940000, 920000, 1050000, 1000000, 990000, 1100000, 1050000, 1150000, 1280000].map(
                    (v) => ({ value: v, itemStyle: { color: '#0ea5e9', borderRadius: [4, 4, 0, 0] } })
                ),
                barWidth: 14,
            },
        ],
        legend: { data: ['بطاقة عسكرية', 'مدني'], bottom: 0, left: 'center' },
    };

    const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-1">
                    <CreditCard size={24} style={{ color: 'var(--accent-green)' }} />
                    <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>طريقة البيع</h1>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>تحليل سلوك البيع حسب طريقة الدفع ونوع الزبون</p>
            </motion.div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                    { icon: CreditCard, label: 'طرق الدفع', value: '4', color: 'var(--accent-green)' },
                    { icon: DollarSign, label: 'نقدي', value: '42%', color: 'var(--accent-green)' },
                    { icon: ShoppingBag, label: 'فيزا/بطاقة', value: '32%', color: 'var(--accent-blue)' },
                    { icon: ArrowLeftRight, label: 'كوبون/قسيمة', value: '4%', color: 'var(--accent-amber)' },
                    { icon: Shield, label: 'بطاقة عسكرية', value: '70.4%', color: 'var(--accent-cyan)' },
                    { icon: Users, label: 'مدني', value: '29.6%', color: 'var(--accent-purple)' },
                ].map((s) => (
                    <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-4">
                        <div className="flex items-center gap-2 mb-2"><s.icon size={14} style={{ color: s.color }} /><span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{s.label}</span></div>
                        <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* الصف الأول: مخطط طرق الدفع + نوع البيع */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ChartCard
                    title="صافي المبيعات وحجم المبيعات حسب طريقة الدفع"
                    subtitle="Net Sales and Product Sales Volume by Payment Type"
                    option={paymentTypeOption}
                    height="320px"
                    delay={1}
                />
                <ChartCard
                    title="صافي المبيعات وحجم المبيعات حسب نوع البيع"
                    subtitle="Net Sales and Product Sales Volume by SalesType"
                    option={salesTypeOption}
                    height="320px"
                    delay={2}
                />
            </div>

            {/* جداول تفصيلية */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* جدول طريقة الدفع */}
                <div className="glass-panel overflow-hidden">
                    <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>تفاصيل طريقة الدفع</h3>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Payment Type Breakdown</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="enterprise-table">
                            <thead>
                                <tr>
                                    <th>طريقة الدفع</th>
                                    <th style={{ textAlign: 'left' }}>صافي المبيعات</th>
                                    <th style={{ textAlign: 'center' }}>حجم المبيعات</th>
                                    <th style={{ textAlign: 'center' }}>الهامش %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentRows.map(r => (
                                    <tr key={r.method}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.method}</td>
                                        <td style={{ textAlign: 'left' }}>
                                            <span className="text-xs font-semibold" style={{ color: 'var(--accent-blue)' }} dir="ltr">{fmt(r.sales)}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }} dir="ltr">{fmt(r.volume)}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="text-xs font-semibold" style={{ color: 'var(--accent-green)' }} dir="ltr">{r.margin}%</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* جدول نوع البيع */}
                <div className="glass-panel overflow-hidden">
                    <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>تفاصيل نوع البيع</h3>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>SalesType Breakdown</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="enterprise-table">
                            <thead>
                                <tr>
                                    <th>نوع الزبون</th>
                                    <th style={{ textAlign: 'left' }}>صافي المبيعات</th>
                                    <th style={{ textAlign: 'center' }}>حجم المبيعات</th>
                                    <th style={{ textAlign: 'center' }}>الهامش %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesTypeRows.map(r => (
                                    <tr key={r.type}>
                                        <td>
                                            <div>
                                                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{r.type}</p>
                                                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.typeAr}</p>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            <span className="text-xs font-semibold" style={{ color: 'var(--accent-blue)' }} dir="ltr">{fmt(r.sales)}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }} dir="ltr">{fmt(r.volume)}</span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="text-xs font-semibold" style={{ color: 'var(--accent-green)' }} dir="ltr">{r.margin}%</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* اتجاهات شهرية */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ChartCard title="اتجاه طرق الدفع شهرياً" subtitle="تطور استخدام كل طريقة خلال العام" option={methodTrendOption} height="340px" delay={3} />
                <ChartCard title="اتجاه نوع البيع شهرياً" subtitle="بطاقة عسكرية مقابل مدني" option={salesTypeTrendOption} height="340px" delay={4} />
            </div>

            {/* الإيرادات والهامش */}
            <ChartCard title="الإيرادات وهامش الربح حسب طريقة الدفع" subtitle="مقارنة الإيرادات مع هامش الربح لكل طريقة" option={profitByMethodOption} height="300px" delay={5} />
        </div>
    );
}
