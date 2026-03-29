'use client';

import '@/lib/echarts/register-bar-line-pie';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { CreditCard, ShoppingBag, DollarSign, ArrowLeftRight, Shield, Globe, Zap } from 'lucide-react';

const ChartCard = dynamic(() => import('@/components/ui/ChartCard'), {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
});
import { useResolvedAnalyticsPalette } from '@/hooks/useResolvedAnalyticsPalette';
import AnalyticsTableCard from '@/components/ui/AnalyticsTableCard';
import { AnalyticsBarCell, AnalyticsTable, analyticsTdBaseStyle } from '@/components/ui/AnalyticsTable';

// ── بيانات نوع الدفع ──
const paymentRows = [
    { method: 'نقدي', sales: 336540, volume: 4120, margin: 22.1 },
    { method: 'فيزا / ماستركارد', sales: 78920, volume: 980, margin: 19.5 },
    { method: 'كوبون / قسيمة', sales: 10370, volume: 142, margin: 14.3 },
];

// ── بيانات نوع البيع ──
const salesTypeRows = [
    { type: 'ذمم (كتب رسمية)', typeAr: 'Receivables / official', sales: 198400, volume: 2410, margin: 20.2 },
    { type: 'بيع الكتروني', typeAr: 'E‑commerce', sales: 156200, volume: 1895, margin: 18.6 },
    { type: 'دفع فوري', typeAr: 'Instant payment', sales: 71250, volume: 837, margin: 16.9 },
];

export default function SalesMethodPage() {
    const palette = useResolvedAnalyticsPalette();

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
                        color: [palette.primaryGreen, palette.primaryCyan, palette.primaryBlue][i],
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
                        color: [palette.primaryGreen, palette.primaryCyan, palette.primaryBlue][i],
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
                barWidth: 44,
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
                lineStyle: { color: palette.primaryGreen, width: 2 },
                itemStyle: { color: palette.primaryGreen },
            },
            {
                name: 'فيزا/ماستركارد',
                type: 'line',
                stack: 'total',
                data: [560000, 580000, 620000, 600000, 630000, 700000, 680000, 690000, 730000, 720000, 780000, 850000],
                areaStyle: { opacity: 0.3 },
                lineStyle: { color: palette.primaryCyan, width: 2 },
                itemStyle: { color: palette.primaryCyan },
            },
            {
                name: 'كوبون / قسيمة',
                type: 'line',
                stack: 'total',
                data: [80000, 90000, 100000, 110000, 95000, 120000, 115000, 108000, 125000, 118000, 130000, 145000],
                areaStyle: { opacity: 0.3 },
                lineStyle: { color: palette.primaryAmber, width: 2 },
                itemStyle: { color: palette.primaryAmber },
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
                name: 'ذمم (كتب رسمية)',
                type: 'bar',
                data: [1680000, 1650000, 1720000, 1700000, 1750000, 1820000, 1780000, 1760000, 1850000, 1800000, 1880000, 1950000].map(
                    (v) => ({ value: v, itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] } })
                ),
                barWidth: 10,
                barGap: '18%',
            },
            {
                name: 'بيع الكتروني',
                type: 'bar',
                data: [1320000, 1380000, 1450000, 1420000, 1500000, 1580000, 1550000, 1620000, 1680000, 1720000, 1780000, 1850000].map(
                    (v) => ({ value: v, itemStyle: { color: palette.primaryCyan, borderRadius: [4, 4, 0, 0] } })
                ),
                barWidth: 10,
            },
            {
                name: 'دفع فوري',
                type: 'bar',
                data: [620000, 640000, 680000, 700000, 710000, 730000, 720000, 735000, 760000, 780000, 800000, 820000].map(
                    (v) => ({ value: v, itemStyle: { color: palette.primaryBlue, borderRadius: [4, 4, 0, 0] } })
                ),
                barWidth: 10,
            },
        ],
        legend: { data: ['ذمم (كتب رسمية)', 'بيع الكتروني', 'دفع فوري'], bottom: 0, left: 'center' },
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                    { icon: CreditCard, label: 'طرق الدفع', value: '4', color: 'var(--accent-green)' },
                    { icon: DollarSign, label: 'نقدي', value: '42%', color: 'var(--accent-green)' },
                    { icon: ShoppingBag, label: 'فيزا/بطاقة', value: '32%', color: 'var(--accent-blue)' },
                    { icon: ArrowLeftRight, label: 'كوبون/قسيمة', value: '4%', color: 'var(--accent-amber)' },
                    { icon: Shield, label: 'ذمم (كتب رسمية)', value: '46.5%', color: 'var(--accent-cyan)' },
                    { icon: Globe, label: 'بيع إلكتروني', value: '36.6%', color: 'var(--accent-purple)' },
                    { icon: Zap, label: 'دفع فوري', value: '16.9%', color: 'var(--accent-amber)' },
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
                    titleFlag="green"
                    subtitle="Net Sales and Product Sales Volume by Payment Type"
                    option={paymentTypeOption}
                    height="320px"
                    delay={1}
                />
                <ChartCard
                    title="صافي المبيعات وحجم المبيعات حسب نوع البيع"
                    titleFlag="green"
                    subtitle="Net Sales and Product Sales Volume by SalesType"
                    option={salesTypeOption}
                    height="320px"
                    delay={2}
                />
            </div>

            {/* جداول تفصيلية */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* جدول طريقة الدفع */}
                <AnalyticsTableCard
                    title="تفاصيل طريقة الدفع"
                    flag="green"
                    subtitles={<p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Payment Type Breakdown</p>}
                >
                    <AnalyticsTable
                        headers={[
                            { label: 'طريقة الدفع', align: 'right' },
                            { label: 'صافي المبيعات', align: 'center' },
                            { label: 'حجم المبيعات', align: 'center' },
                            { label: 'الهامش %', align: 'center' },
                        ]}
                    >
                        {(() => {
                            const maxSales = Math.max(...paymentRows.map((r) => r.sales), 1);
                            const maxVol = Math.max(...paymentRows.map((r) => r.volume), 1);
                            return paymentRows.map((r) => (
                                <tr key={r.method} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <td style={{ ...analyticsTdBaseStyle('right'), fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {r.method}
                                    </td>
                                    <AnalyticsBarCell value={r.sales} max={maxSales} color="#3b82f6" text={fmt(r.sales)} />
                                    <AnalyticsBarCell value={r.volume} max={maxVol} color="#3b82f6" text={fmt(r.volume)} />
                                    <td style={analyticsTdBaseStyle('center')} dir="ltr">
                                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>{r.margin}%</span>
                                    </td>
                                </tr>
                            ));
                        })()}
                    </AnalyticsTable>
                </AnalyticsTableCard>

                {/* جدول نوع البيع */}
                <AnalyticsTableCard
                    title="تفاصيل نوع البيع"
                    flag="green"
                    subtitles={<p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>SalesType Breakdown</p>}
                >
                    <AnalyticsTable
                        headers={[
                            { label: 'نوع البيع', align: 'right' },
                            { label: 'صافي المبيعات', align: 'center' },
                            { label: 'حجم المبيعات', align: 'center' },
                            { label: 'الهامش %', align: 'center' },
                        ]}
                    >
                        {(() => {
                            const maxSales = Math.max(...salesTypeRows.map((r) => r.sales), 1);
                            const maxVol = Math.max(...salesTypeRows.map((r) => r.volume), 1);
                            return salesTypeRows.map((r) => (
                                <tr key={r.type} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <td style={{ ...analyticsTdBaseStyle('right') }}>
                                        <div>
                                            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{r.type}</p>
                                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.typeAr}</p>
                                        </div>
                                    </td>
                                    <AnalyticsBarCell value={r.sales} max={maxSales} color="#3b82f6" text={fmt(r.sales)} />
                                    <AnalyticsBarCell value={r.volume} max={maxVol} color="#3b82f6" text={fmt(r.volume)} />
                                    <td style={analyticsTdBaseStyle('center')} dir="ltr">
                                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>{r.margin}%</span>
                                    </td>
                                </tr>
                            ));
                        })()}
                    </AnalyticsTable>
                </AnalyticsTableCard>
            </div>

            {/* اتجاهات شهرية */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ChartCard title="اتجاه طرق الدفع شهرياً" subtitle="تطور استخدام كل طريقة خلال العام" option={methodTrendOption} height="340px" delay={3} />
                <ChartCard title="اتجاه نوع البيع شهرياً" subtitle="ذمم — بيع إلكتروني — دفع فوري" option={salesTypeTrendOption} height="340px" delay={4} />
            </div>

            {/* الإيرادات والهامش */}
            <ChartCard title="الإيرادات وهامش الربح حسب طريقة الدفع" subtitle="مقارنة الإيرادات مع هامش الربح لكل طريقة" option={profitByMethodOption} height="300px" delay={5} />
        </div>
    );
}
