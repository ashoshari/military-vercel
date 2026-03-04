'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Settings2, Truck, Package, Clock, CheckCircle, BarChart3, Undo2, ShoppingCart } from 'lucide-react';
import ChartCard from '@/components/ui/ChartCard';

export default function OperationsPage() {
    const operationalKPIs = [
        { icon: BarChart3, label: 'الأرباح', value: '8.6M', sublabel: 'صافي الأرباح', color: 'var(--accent-green)' },
        { icon: Truck, label: 'المبيعات', value: '24.6M', sublabel: 'إجمالي المبيعات', color: 'var(--accent-cyan)' },
        { icon: Undo2, label: 'المرتجعات', value: '1.2M', sublabel: 'قيمة المرتجعات', color: 'var(--accent-red)' },
        { icon: Package, label: 'الفواتير', value: '184.5K', sublabel: 'عدد الفواتير', color: 'var(--accent-blue)' },
        { icon: CheckCircle, label: 'هامش الربح', value: '34.9%', sublabel: 'متوسط الهامش', color: 'var(--accent-green)' },
        { icon: Clock, label: 'متوسط المعالجة', value: '2.4 س', sublabel: 'وقت الطلب', color: 'var(--accent-amber)' },
    ];

    // ── مخطط الأرباح السنوي ──
    const annualProfitOption = {
        xAxis: { type: 'category' as const, data: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'] },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` } },
        series: [{
            name: 'الأرباح',
            type: 'line',
            smooth: true,
            data: [580000, 620000, 710000, 680000, 720000, 840000, 790000, 810000, 870000, 830000, 920000, 980000],
            lineStyle: { color: '#00e5a0', width: 3 },
            itemStyle: { color: '#00e5a0' },
            areaStyle: {
                color: {
                    type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [
                        { offset: 0, color: 'rgba(0,229,160,0.18)' },
                        { offset: 1, color: 'rgba(0,229,160,0)' },
                    ],
                },
            },
        }],
    };

    // ── أسباب المرتجعات حسب المنتج ──
    const returnsReasonsOption = {
        xAxis: {
            type: 'value' as const,
            name: 'عدد المرتجعات',
            nameLocation: 'middle' as const,
            nameGap: 32,
        },
        yAxis: { type: 'category' as const, data: ['عيب تصنيع', 'انتهاء صلاحية', 'خطأ طلب', 'تلف أثناء النقل', 'عدم مطابقة', 'أخرى'], inverse: true },
        series: [{
            type: 'bar',
            data: [1200, 980, 750, 620, 450, 380].map((v, i) => ({
                value: v,
                itemStyle: { color: ['#dc2626', '#d97706', '#2563eb', '#7c3aed', '#0891b2', '#64748b'][i], borderRadius: [0, 4, 4, 0] },
            })),
            barWidth: 16,
        }],
        grid: { left: '20%', right: '8%', top: '5%', bottom: '8%' },
    };

    // ── تحليل السلة الشرائية: عدد المواد وقيمتها ──
    const basketAnalysisOption = {
        xAxis: { type: 'category' as const, data: ['1-3 مواد', '4-6 مواد', '7-10 مواد', '11-15 مواد', '16-20 مواد', '20+ مواد'] },
        yAxis: [
            { type: 'value' as const, name: 'الفواتير', axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` } },
            { type: 'value' as const, name: 'متوسط القيمة', axisLabel: { formatter: (v: number) => `${v} د.أ` } },
        ],
        series: [
            {
                name: 'عدد الفواتير',
                type: 'bar',
                data: [45000, 52000, 38000, 24000, 15000, 10500].map((v) => ({
                    value: v,
                    itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
                })),
                barWidth: 28,
            },
            {
                name: 'متوسط القيمة',
                type: 'line',
                yAxisIndex: 1,
                data: [28, 65, 115, 178, 245, 380],
                lineStyle: { color: '#00e5a0', width: 2 },
                itemStyle: { color: '#00e5a0' },
            },
        ],
        legend: { data: ['عدد الفواتير', 'متوسط القيمة'], bottom: 0, left: 'center' },
    };

    // ── المبيعات والقيمة لكل منتج ──
    const productPerformanceOption = {
        xAxis: { type: 'category' as const, data: ['أرز', 'زيت زيتون', 'دجاج', 'سكر', 'حليب', 'منظفات', 'تونة', 'حفاضات'], axisLabel: { fontSize: 10 } },
        yAxis: [
            { type: 'value' as const, name: 'الوحدات', axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` } },
            { type: 'value' as const, name: 'القيمة', axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` } },
        ],
        series: [
            {
                name: 'عدد الوحدات',
                type: 'bar',
                data: [72000, 45000, 38000, 55000, 62000, 28000, 32000, 18000].map((v) => ({
                    value: v,
                    itemStyle: { color: '#00d4ff', borderRadius: [4, 4, 0, 0] },
                })),
                barWidth: 16,
            },
            {
                name: 'القيمة المادية',
                type: 'bar',
                data: [360000, 315000, 285000, 110000, 93000, 196000, 128000, 234000].map((v) => ({
                    value: v,
                    itemStyle: { color: '#00e5a0', borderRadius: [4, 4, 0, 0] },
                })),
                barWidth: 16,
            },
        ],
        legend: { data: ['عدد الوحدات', 'القيمة المادية'], bottom: 0, left: 'center' },
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-1"><Settings2 size={24} style={{ color: 'var(--accent-green)' }} /><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>العمليات وأداء الفروع</h1></div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>تحليل الأداء التشغيلي حسب الأسواق — التقرير الثالث</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {operationalKPIs.map((kpi, i) => (
                    <motion.div key={kpi.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="glass-panel p-4 text-center">
                        <kpi.icon size={20} className="mx-auto mb-2" style={{ color: kpi.color }} />
                        <p className="text-xl font-bold" style={{ color: kpi.color }} dir="ltr">{kpi.value}</p>
                        <p className="text-[10px] font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{kpi.sublabel}</p>
                    </motion.div>
                ))}
            </div>

            <ChartCard title="مخطط الأرباح السنوي" subtitle="صافي الأرباح الشهرية" option={annualProfitOption} height="320px" delay={1} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ChartCard title="أسباب المرتجعات" subtitle="تحليل أسباب المرتجعات حسب النوع" option={returnsReasonsOption} height="320px" delay={2} />
                <ChartCard title="تحليل السلة الشرائية" subtitle="عدد المواد وقيمتها داخل السلة" option={basketAnalysisOption} height="320px" delay={3} />
            </div>

            <ChartCard title="عدد المبيعات والقيمة المادية" subtitle="لكل منتج — الوحدات المباعة مقابل القيمة" option={productPerformanceOption} height="320px" delay={4} />
        </div>
    );
}
