'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileBarChart, Download, RefreshCw, Clock, CheckCircle,
    AlertCircle, Loader2, X, Eye, TrendingUp, TrendingDown, BarChart3
} from 'lucide-react';
import ChartCard from '@/components/ui/ChartCard';
import ReportPreviewModal from '@/components/ui/ReportPreviewModal';
import { getReportJobs } from '@/lib/mockData';
import { useRouter } from 'next/navigation';

// ── بيانات المعاينة ──────────────────────────────────────────────────────────
interface PreviewRow { market: string; revenue: number; cost: number; profit: number; orders: number; growth: number; }
const previewData: PreviewRow[] = [
    { market: 'عمّان المركزي', revenue: 4250000, cost: 2810000, profit: 1440000, orders: 32500, growth: 12.3 },
    { market: 'إربد الرئيسي', revenue: 3180000, cost: 2120000, profit: 1060000, orders: 24800, growth: 8.7 },
    { market: 'فرع الزرقاء', revenue: 2840000, cost: 1920000, profit: 920000, orders: 21200, growth: 6.2 },
    { market: 'العقبة الميناء', revenue: 2410000, cost: 1590000, profit: 820000, orders: 18400, growth: 14.5 },
    { market: 'السلط', revenue: 1920000, cost: 1340000, profit: 580000, orders: 14200, growth: -2.1 },
    { market: 'مادبا المدينة', revenue: 1560000, cost: 1090000, profit: 470000, orders: 11800, growth: 4.8 },
    { market: 'الكرك', revenue: 1340000, cost: 960000, profit: 380000, orders: 9600, growth: 3.1 },
    { market: 'جرش', revenue: 1120000, cost: 810000, profit: 310000, orders: 8100, growth: 7.9 },
];

export default function ReportsPage() {
    const router = useRouter();
    const reports = useMemo(() => getReportJobs(), []);
    const [viewingReport, setViewingReport] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string | null>(null);

    const statusConfig: Record<string, { icon: React.ElementType; label: string; cls: string; color: string }> = {
        pending: { icon: Clock, label: 'قيد الانتظار', cls: 'status-pending', color: 'var(--accent-amber)' },
        processing: { icon: Loader2, label: 'قيد المعالجة', cls: 'status-processing', color: 'var(--accent-purple)' },
        ready: { icon: CheckCircle, label: 'جاهز', cls: 'status-ready', color: 'var(--accent-green)' },
        failed: { icon: AlertCircle, label: 'فشل', cls: 'status-failed', color: 'var(--accent-red)' },
    };

    const reportNamesAr: Record<string, string> = {
        'rpt-001': 'تقرير أداء المبيعات — الربع الرابع 2025',
        'rpt-002': 'تحليل مقارنة الفروع — المنطقة الشمالية',
        'rpt-003': 'دراسة معمّقة لفئة المنتجات — البقالة',
        'rpt-004': 'بطاقة أداء الموظفين — الربع الرابع',
        'rpt-005': 'التنبؤ الذكي بالمبيعات — يناير 2026',
        'rpt-006': 'تحليل تأثير الخصومات — السنة الكاملة 2025',
    };

    const typeLabels: Record<string, string> = {
        sales: 'مبيعات', branch: 'فروع', product: 'منتجات',
        employee: 'موظفين', forecast: 'تنبؤ', custom: 'مخصص',
    };

    // مخططات المعاينة
    const previewChartOption = {
        xAxis: { type: 'category' as const, data: previewData.map(d => d.market.split(' ')[0]), axisLabel: { fontSize: 10 } },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
        series: [
            {
                name: 'الإيرادات',
                type: 'bar',
                data: previewData.map(d => ({
                    value: d.revenue,
                    itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] },
                })),
                barWidth: 16,
            },
            {
                name: 'التكلفة',
                type: 'bar',
                data: previewData.map(d => ({
                    value: d.cost,
                    itemStyle: { color: '#94a3b8', borderRadius: [4, 4, 0, 0] },
                })),
                barWidth: 16,
            },
            {
                name: 'الأرباح',
                type: 'line',
                data: previewData.map(d => d.profit),
                lineStyle: { color: '#0ea5e9', width: 2 },
                itemStyle: { color: '#0ea5e9' },
            },
        ],
        legend: { data: ['الإيرادات', 'التكلفة', 'الأرباح'], top: 0, left: 0 },
    };

    const previewPieOption = {
        series: [{
            type: 'pie', radius: ['40%', '70%'],
            data: previewData.slice(0, 5).map((d, i) => ({
                name: d.market.split(' ')[0],
                value: d.revenue,
                itemStyle: { color: ['#22c55e', '#3b82f6', '#6366f1', '#f59e0b', '#0ea5e9'][i] },
            })),
            label: { color: '#94a3b8', fontSize: 11 }, labelLine: { lineStyle: { color: '#334155' } },
        }],
    };

    const formatN = (n: number) => new Intl.NumberFormat('en-US').format(n);

    return (
        <div className="space-y-6">

            {/* ── رأس الصفحة ── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <FileBarChart size={24} style={{ color: 'var(--accent-green)' }} />
                        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>مركز التقارير</h1>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        تتبّع حالة التقارير المطلوبة — يتم إنشاؤها تلقائيًا من شريط الفلاتر
                    </p>
                </div>
            </motion.div>

            {/* ── KPIs ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'إجمالي التقارير', value: reports.length, color: 'var(--accent-green)' },
                    { label: 'جاهزة', value: reports.filter(r => r.status === 'ready').length, color: 'var(--accent-green)' },
                    { label: 'قيد المعالجة', value: reports.filter(r => r.status === 'processing').length, color: 'var(--accent-purple)' },
                    { label: 'قيد الانتظار', value: reports.filter(r => r.status === 'pending').length, color: 'var(--accent-amber)' },
                ].map(s => (
                    <motion.div key={s.label} initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-4">
                        <p className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* ── قائمة التقارير ── */}
            <div className="space-y-3">
                {reports.map((report, i) => {
                    const cfg = statusConfig[report.status];
                    const StatusIcon = cfg.icon;
                    const isViewing = viewingReport === report.id;

                    return (
                        <motion.div key={report.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                            <div
                                className={`glass-panel p-5 transition-colors ${isViewing ? '' : 'hover:border-[var(--border-default)]'}`}
                                style={isViewing ? { borderColor: 'var(--accent-green)', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : {}}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${cfg.cls}`}>
                                                <span className="flex items-center gap-1">
                                                    <StatusIcon size={11} className={report.status === 'processing' ? 'animate-spin' : ''} />
                                                    {cfg.label}
                                                </span>
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                                                style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                                                {typeLabels[report.type] ?? report.type}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                            {reportNamesAr[report.id] || report.name}
                                        </h3>
                                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                            تم الطلب: {new Date(report.createdAt).toLocaleDateString('ar-JO')}
                                        </p>
                                        {(report.status === 'processing' || report.status === 'pending') && (
                                            <div className="mt-3 progress-bar w-64">
                                                <div className="progress-bar-fill" style={{ width: `${report.progress}%`, background: cfg.color }} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {report.status === 'ready' && (
                                            <>
                                                <button
                                                    onClick={() => router.push('/sales')}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all"
                                                    style={{
                                                        background: isViewing ? 'var(--accent-green-dim)' : 'var(--bg-elevated)',
                                                        border: `1px solid ${isViewing ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
                                                        color: isViewing ? 'var(--accent-green)' : 'var(--text-secondary)',
                                                    }}>
                                                    <Eye size={12} /> عرض
                                                </button>
                                                {report.formats.map(f => (
                                                    <button key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors"
                                                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                                                        <Download size={12} />{f.toUpperCase()}
                                                    </button>
                                                ))}
                                            </>
                                        )}
                                        {report.status === 'failed' && (
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium"
                                                style={{ background: 'rgba(220,38,38,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(220,38,38,0.2)' }}>
                                                <RefreshCw size={12} /> إعادة المحاولة
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* تفاصيل التقرير المُعاين */}
                            <AnimatePresence>
                                {isViewing && report.status === 'ready' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <div className="border border-t-0 rounded-b-xl p-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-green)' }}>

                                            {/* رأس المعاينة */}
                                            <div className="flex items-center justify-between mb-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-green-dim)' }}>
                                                        <BarChart3 size={16} style={{ color: 'var(--accent-green)' }} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>معاينة التقرير</h4>
                                                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{reportNamesAr[report.id] || report.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] px-2 py-1 rounded-md" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                                                        {previewData.length} سجل
                                                    </span>
                                                    <button onClick={() => setViewingReport(null)} className="p-1.5 rounded-md" style={{ color: 'var(--text-muted)' }}>
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* KPI ملخص */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                                                {[
                                                    { label: 'إجمالي الإيرادات', value: formatN(previewData.reduce((a, b) => a + b.revenue, 0)), icon: TrendingUp, color: 'var(--accent-green)' },
                                                    { label: 'إجمالي التكلفة', value: formatN(previewData.reduce((a, b) => a + b.cost, 0)), icon: TrendingDown, color: 'var(--accent-red)' },
                                                    { label: 'صافي الأرباح', value: formatN(previewData.reduce((a, b) => a + b.profit, 0)), icon: BarChart3, color: 'var(--accent-cyan)' },
                                                    { label: 'الطلبات', value: formatN(previewData.reduce((a, b) => a + b.orders, 0)), icon: FileBarChart, color: 'var(--accent-amber)' },
                                                ].map(m => (
                                                    <div key={m.label} className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                                                        <div className="flex items-center gap-1.5 mb-1"><m.icon size={12} style={{ color: m.color }} /><span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.label}</span></div>
                                                        <p className="text-sm font-bold" style={{ color: m.color }} dir="ltr">{m.value}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* مخططات */}
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
                                                <ChartCard title="الإيرادات والتكلفة والأرباح" subtitle="لكل سوق" option={previewChartOption} height="280px" />
                                                <ChartCard title="توزيع الإيرادات" subtitle="الأسواق الخمسة الأولى" option={previewPieOption} height="280px" />
                                            </div>

                                            {/* جدول */}
                                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                                                <div className="overflow-x-auto">
                                                    <table className="enterprise-table">
                                                        <thead>
                                                            <tr>
                                                                <th>#</th><th>السوق</th>
                                                                <th style={{ textAlign: 'left' }}>الإيرادات</th>
                                                                <th style={{ textAlign: 'left' }}>التكلفة</th>
                                                                <th style={{ textAlign: 'left' }}>الأرباح</th>
                                                                <th style={{ textAlign: 'left' }}>الطلبات</th>
                                                                <th style={{ textAlign: 'center' }}>النمو</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {previewData.map((row, idx) => (
                                                                <tr key={row.market}>
                                                                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                                                                    <td><span className="font-medium" style={{ color: 'var(--text-primary)' }}>{row.market}</span></td>
                                                                    <td style={{ textAlign: 'left' }}><span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }} dir="ltr">{formatN(row.revenue)} د.أ</span></td>
                                                                    <td style={{ textAlign: 'left' }}><span className="text-xs" style={{ color: 'var(--text-secondary)' }} dir="ltr">{formatN(row.cost)} د.أ</span></td>
                                                                    <td style={{ textAlign: 'left' }}><span className="text-xs font-semibold" style={{ color: 'var(--accent-green)' }} dir="ltr">{formatN(row.profit)} د.أ</span></td>
                                                                    <td style={{ textAlign: 'left' }}><span className="text-xs" style={{ color: 'var(--text-secondary)' }} dir="ltr">{formatN(row.orders)}</span></td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold"
                                                                            style={{ color: row.growth >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }} dir="ltr">
                                                                            {row.growth >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                                                            {row.growth >= 0 ? '+' : ''}{row.growth}%
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* تذييل */}
                                            <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                                                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                                    تم الإنشاء: {new Date(report.createdAt).toLocaleDateString('ar-JO', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {report.formats.map(f => (
                                                        <button key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium transition-colors"
                                                            style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}>
                                                            <Download size={11} /> تحميل {f.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Modal للعرض الكامل */}
            {previewType && (
                <ReportPreviewModal
                    type={previewType}
                    reportName={previewType}
                    filters={{}}
                    onClose={() => setPreviewType(null)}
                />
            )}
        </div>
    );
}
