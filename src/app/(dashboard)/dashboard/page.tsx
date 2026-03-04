'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Activity, Zap, Target } from 'lucide-react';
import KPICard from '@/components/ui/KPICard';
import ChartCard from '@/components/ui/ChartCard';
import { getKPIData, getMonthlySalesData, getCategoryDistribution, getBranchData, getRegionalData } from '@/lib/mockData';

export default function DashboardPage() {
    const kpiData = useMemo(() => getKPIData(), []);
    const salesData = useMemo(() => getMonthlySalesData(), []);
    const categories = useMemo(() => getCategoryDistribution(), []);
    const branches = useMemo(() => getBranchData(), []);
    const regions = useMemo(() => getRegionalData(), []);

    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-JO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const revenueTrendOption = {
        xAxis: { type: 'category' as const, data: salesData.map((d) => d.date) },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
        series: [
            {
                name: 'الإيرادات',
                type: 'line',
                data: salesData.map((d) => d.revenue),
                smooth: true,
                lineStyle: { color: '#00e5a0', width: 2 },
                itemStyle: { color: '#00e5a0' },
                areaStyle: {
                    color: {
                        type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(0, 229, 160, 0.18)' },
                            { offset: 1, color: 'rgba(0, 229, 160, 0)' },
                        ],
                    },
                },
            },
            {
                name: 'صافي الإيرادات',
                type: 'line',
                data: salesData.map((d) => d.netRevenue),
                smooth: true,
                lineStyle: { color: '#0891b2', width: 2, type: 'dashed' as const },
                itemStyle: { color: '#0891b2' },
            },
        ],
        legend: { data: ['الإيرادات', 'صافي الإيرادات'], bottom: 0, left: 'center' },
    };

    const topBranches = [...branches].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const branchChartOption = {
        xAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
        yAxis: { type: 'category' as const, data: topBranches.map((b) => b.nameAr), inverse: true },
        series: [{
            type: 'bar',
            data: topBranches.map((b, i) => ({
                value: b.revenue,
                itemStyle: {
                    color: ['#00e5a0', '#00d4ff', '#3b82f6', '#a855f7', '#f59e0b'][i],
                    borderRadius: [0, 4, 4, 0],
                },
            })),
            barWidth: 20,
        }],
        grid: { left: '8%', right: '25%', top: '5%', bottom: '8%' },
    };

    const categoryOption = {
        legend: {
            bottom: 0,
            left: 'center' as const,
            data: categories.map((c) => c.nameAr),
        },
        series: [{
            type: 'pie',
            radius: ['46%', '68%'],
            center: ['50%', '42%'],
            data: categories.map((c) => ({ name: c.nameAr, value: c.value, itemStyle: { color: c.color } })),
            label: { show: true, position: 'outside' as const, color: '#64748b', fontSize: 11, formatter: '{b}: {d}%' },
            labelLine: { lineStyle: { color: '#334155' } },
            emphasis: { itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.3)' } },
        }],
    };

    const regionOption = {
        xAxis: { type: 'category' as const, data: regions.map((r) => r.regionAr) },
        yAxis: [
            { type: 'value' as const, name: 'الإيرادات', axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(0)}M` } },
            { type: 'value' as const, name: 'النمو %', axisLabel: { formatter: (v: number) => `${v}%` } },
        ],
        series: [
            {
                name: 'الإيرادات',
                type: 'bar',
                data: regions.map((r) => r.revenue),
                itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
                barWidth: 30,
            },
            {
                name: 'النمو',
                type: 'line',
                yAxisIndex: 1,
                data: regions.map((r) => r.growth),
                lineStyle: { color: '#00e5a0', width: 2 },
                itemStyle: { color: '#00e5a0' },
            },
        ],
        legend: { data: ['الإيرادات', 'النمو'], bottom: 0, left: 'center' },
    };

    return (
        <div className="space-y-6">
            {/* العنوان */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>نظرة عامة على مركز القيادة</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <Calendar size={13} />{dateStr}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent-green)' }} />
                            <span className="text-[11px] font-medium" style={{ color: 'var(--accent-green)' }}>بيانات مباشرة</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel">
                        <Activity size={14} style={{ color: 'var(--accent-green)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>صحة النظام:</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--accent-green)' }} dir="ltr">98.7%</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel">
                        <Zap size={14} style={{ color: 'var(--accent-amber)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>مهام نشطة:</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--accent-amber)' }}>3</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel">
                        <Target size={14} style={{ color: 'var(--accent-cyan)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>نماذج AI:</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--accent-cyan)' }}>متصل</span>
                    </div>
                </div>
            </motion.div>

            {/* بطاقات KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
                {kpiData.map((kpi, i) => (<KPICard key={kpi.id} data={kpi} delay={i} />))}
            </div>

            {/* الرسوم البيانية */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                    <ChartCard title="اتجاه الإيرادات" subtitle="أداء الإيرادات الشهرية وصافي الإيرادات" option={revenueTrendOption} height="320px" delay={1} />
                </div>
                <ChartCard title="توزيع الفئات" subtitle="توزيع المبيعات حسب فئة المنتج" option={categoryOption} height="320px" delay={2} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ChartCard title="أفضل الفروع أداءً" subtitle="الإيرادات حسب الفرع — أعلى 5" option={branchChartOption} height="300px" delay={3} />
                <ChartCard title="الأداء الإقليمي" subtitle="الإيرادات والنمو حسب المنطقة" option={regionOption} height="300px" delay={4} />
            </div>

            {/* آخر الأنشطة */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel p-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>آخر الأنشطة</h3>
                <div className="space-y-3">
                    {[
                        { icon: '📊', text: 'تم إنشاء تقرير أداء المبيعات للربع الرابع بنجاح', time: 'قبل دقيقتين', color: 'var(--accent-green)' },
                        { icon: '🤖', text: 'تم تحديث نموذج التنبؤ الذكي — الدقة ارتفعت إلى 92.3%', time: 'قبل 15 دقيقة', color: 'var(--accent-cyan)' },
                        { icon: '📈', text: 'فرع عمّان المركزي تجاوز الهدف الربعي بنسبة 12%', time: 'قبل ساعة', color: 'var(--accent-green)' },
                        { icon: '⚠️', text: 'تنبيه سياسة الخصومات: 3 فروع تجاوزت الحد المسموح', time: 'قبل ساعتين', color: 'var(--accent-amber)' },
                        { icon: '🔄', text: 'اكتملت مزامنة البيانات الليلية — تمت معالجة 184 ألف سجل', time: 'قبل 6 ساعات', color: 'var(--accent-blue)' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors" style={{ background: 'transparent' }}>
                            <span className="text-base">{item.icon}</span>
                            <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>{item.text}</span>
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.time}</span>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
