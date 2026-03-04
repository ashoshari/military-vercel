'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, DollarSign, Package, Percent, BarChart3 } from 'lucide-react';
import ChartCard from '@/components/ui/ChartCard';
import EnterpriseTable from '@/components/ui/EnterpriseTable';
import type { TableColumn } from '@/components/ui/EnterpriseTable';

interface Agreement { name: string; partner: string; typeAr: string; value: number; status: string; statusAr: string; materials: number; profitMargin: number; discountRate: number; start: string; end: string;[key: string]: unknown; }

const agreements: Agreement[] = [
    { name: 'شراء بالجملة — أرز', partner: 'شركة المها للتجارة', typeAr: 'مشتريات', value: 1200000, status: 'Active', statusAr: 'نشط', materials: 15, profitMargin: 22, discountRate: 8, start: '2025-01-01', end: '2025-12-31' },
    { name: 'توزيع — الشمال', partner: 'اللوجستيات الشمالية', typeAr: 'توزيع', value: 850000, status: 'Active', statusAr: 'نشط', materials: 0, profitMargin: 15, discountRate: 5, start: '2025-03-01', end: '2026-02-28' },
    { name: 'توريد ألبان', partner: 'شركة الألبان الأردنية', typeAr: 'مشتريات', value: 640000, status: 'Active', statusAr: 'نشط', materials: 12, profitMargin: 18, discountRate: 10, start: '2025-06-01', end: '2026-05-31' },
    { name: 'منتجات تنظيف', partner: 'كلين ماكس', typeAr: 'مشتريات', value: 320000, status: 'Expiring', statusAr: 'قارب الانتهاء', materials: 8, profitMargin: 25, discountRate: 12, start: '2025-01-01', end: '2025-03-31' },
    { name: 'صيانة تقنية', partner: 'تك سيرف الأردن', typeAr: 'خدمات', value: 180000, status: 'Active', statusAr: 'نشط', materials: 0, profitMargin: 0, discountRate: 0, start: '2025-04-01', end: '2026-03-31' },
    { name: 'حملة تسويقية', partner: 'ميديا وركس', typeAr: 'تسويق', value: 450000, status: 'Pending', statusAr: 'قيد الانتظار', materials: 0, profitMargin: 0, discountRate: 0, start: '2026-01-01', end: '2026-06-30' },
];

export default function AgreementsPage() {
    // ── المواد والأرباح والخصومات ──
    const materialsAnalysisOption = {
        xAxis: {
            type: 'category' as const,
            data: agreements.filter((a) => a.materials > 0).map((a) => a.partner.split(' ').slice(0, 2).join(' ')),
            axisLabel: { fontSize: 10 },
        },
        yAxis: [
            { type: 'value' as const, name: 'عدد المواد', nameLocation: 'middle' as const, nameGap: 40 },
            { type: 'value' as const, name: 'الهامش / الخصم %', nameLocation: 'middle' as const, nameGap: 40 },
        ],
        series: [
            {
                name: 'المواد',
                type: 'bar',
                data: agreements
                    .filter((a) => a.materials > 0)
                    .map((a) => ({ value: a.materials, itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } })),
                barWidth: 24,
            },
            {
                name: 'هامش الربح',
                type: 'line',
                yAxisIndex: 1,
                data: agreements.filter((a) => a.materials > 0).map((a) => a.profitMargin),
                lineStyle: { color: '#22c55e', width: 2 },
                itemStyle: { color: '#22c55e' },
            },
            {
                name: 'نسبة الخصم',
                type: 'line',
                yAxisIndex: 1,
                data: agreements.filter((a) => a.materials > 0).map((a) => a.discountRate),
                lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' as const },
                itemStyle: { color: '#f59e0b' },
            },
        ],
        legend: { data: ['المواد', 'هامش الربح', 'نسبة الخصم'], bottom: 0, left: 'center' },
        grid: { left: '14%', right: '14%', top: '12%', bottom: '22%', containLabel: true },
    };

    // ── القيمة حسب النوع ──
    const valueByTypeOption = {
        xAxis: { type: 'category' as const, data: ['مشتريات', 'توزيع', 'خدمات', 'تسويق'] },
        yAxis: { type: 'value' as const, axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` } },
        series: [{
            type: 'bar',
            data: [
                { value: 2160000, itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] } },
                { value: 850000, itemStyle: { color: '#0ea5e9', borderRadius: [4, 4, 0, 0] } },
                { value: 180000, itemStyle: { color: '#6366f1', borderRadius: [4, 4, 0, 0] } },
                { value: 450000, itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] } },
            ],
            barWidth: 40,
        }],
    };

    // ── مجموعات المنتجات حسب الاتفاقية ──
    const productGroupsOption = {
        series: [{
            type: 'pie',
            radius: ['36%', '54%'],
            center: ['50%', '42%'],
            data: [
                { name: 'بقالة (أرز)', value: 35, itemStyle: { color: '#22c55e' } },
                { name: 'ألبان', value: 25, itemStyle: { color: '#3b82f6' } },
                { name: 'منظفات', value: 20, itemStyle: { color: '#6366f1' } },
                { name: 'لحوم', value: 12, itemStyle: { color: '#f59e0b' } },
                { name: 'أخرى', value: 8, itemStyle: { color: '#94a3b8' } },
            ],
            label: { color: '#94a3b8', fontSize: 11 }, labelLine: { lineStyle: { color: '#334155' } },
        }],
    };

    const columns: TableColumn<Agreement>[] = [
        { key: 'name', header: 'الاتفاقية', sortable: true },
        { key: 'partner', header: 'الشريك', sortable: true },
        { key: 'typeAr', header: 'النوع' },
        { key: 'value', header: 'القيمة', sortable: true, align: 'right', format: 'currency' },
        { key: 'materials', header: 'المواد', align: 'center' },
        { key: 'profitMargin', header: 'الهامش %', align: 'center', render: (val: unknown) => <span className="text-xs font-semibold" style={{ color: Number(val) > 0 ? 'var(--accent-green)' : 'var(--text-muted)' }} dir="ltr">{Number(val) > 0 ? `${val}%` : '—'}</span> },
        { key: 'discountRate', header: 'الخصم %', align: 'center', render: (val: unknown) => <span className="text-xs font-semibold" style={{ color: Number(val) > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }} dir="ltr">{Number(val) > 0 ? `${val}%` : '—'}</span> },
        {
            key: 'statusAr', header: 'الحالة', align: 'center', render: (val: unknown, row: Agreement) => {
                const color = row.status === 'Active' ? 'var(--accent-green)' : row.status === 'Expiring' ? 'var(--accent-amber)' : 'var(--accent-blue)';
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: `color-mix(in srgb, ${String(color)} 15%, transparent)`, color: String(color) }}>{String(val)}</span>;
            }
        },
    ];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-1"><FileText size={24} style={{ color: 'var(--accent-green)' }} /><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>الاتفاقيات</h1></div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>تحليل المواد والأرباح والخصومات — التقرير التاسع</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { icon: FileText, label: 'إجمالي الاتفاقيات', value: agreements.length, color: 'var(--accent-green)' },
                    { icon: Package, label: 'المواد المشمولة', value: agreements.reduce((a, b) => a + b.materials, 0), color: 'var(--accent-blue)' },
                    { icon: BarChart3, label: 'متوسط الهامش', value: `${(agreements.filter((a) => a.profitMargin > 0).reduce((a, b) => a + b.profitMargin, 0) / agreements.filter((a) => a.profitMargin > 0).length).toFixed(0)}%`, color: 'var(--accent-green)' },
                    { icon: Percent, label: 'متوسط الخصم', value: `${(agreements.filter((a) => a.discountRate > 0).reduce((a, b) => a + b.discountRate, 0) / agreements.filter((a) => a.discountRate > 0).length).toFixed(0)}%`, color: 'var(--accent-amber)' },
                ].map((s) => (
                    <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-4">
                        <div className="flex items-center gap-2 mb-2"><s.icon size={14} style={{ color: s.color }} /><span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>{s.label}</span></div>
                        <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <ChartCard title="المواد والأرباح والخصومات" subtitle="تحليل لكل شريك تجاري" option={materialsAnalysisOption} height="340px" delay={1} />
                <ChartCard title="القيمة حسب النوع" subtitle="إجمالي قيمة العقود" option={valueByTypeOption} height="340px" delay={2} />
                <ChartCard title="مجموعات المنتجات" subtitle="توزيع المنتجات ضمن الاتفاقيات" option={productGroupsOption} height="340px" delay={3} />
            </div>

            <EnterpriseTable title="دليل الاتفاقيات" columns={columns} data={agreements} pageSize={10} />
        </div>
    );
}
