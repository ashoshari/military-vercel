'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserCircle, ShoppingBag, Repeat, TrendingUp, Heart, CreditCard, Clock } from 'lucide-react';
import ChartCard from '@/components/ui/ChartCard';
import CustomerInsightsTable from '@/components/ui/CustomerInsightsTable';

export default function CustomersPage() {
    // ── Heatmap أوقات الذروة ──
    const hours = ['6ص', '7ص', '8ص', '9ص', '10ص', '11ص', '12م', '1م', '2م', '3م', '4م', '5م', '6م', '7م', '8م', '9م'];
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const heatmapData: number[][] = [];
    hours.forEach((_, hi) => {
        days.forEach((_, di) => {
            let val = 20 + Math.random() * 30;
            if (hi >= 4 && hi <= 8) val += 40; // 10am-2pm rush
            if (hi >= 11 && hi <= 13) val += 25; // 5pm-7pm rush
            if (di === 4) val -= 15; // Thursday less
            if (di === 5) val *= 0.5; // Friday
            heatmapData.push([hi, di, Math.round(Math.max(5, val))]);
        });
    });

    const heatmapOption = {
        grid: { left: '12%', right: '12%', top: '5%', bottom: '15%' },
        xAxis: { type: 'category' as const, data: hours, splitArea: { show: true }, axisLabel: { fontSize: 10 } },
        yAxis: { type: 'category' as const, data: days, splitArea: { show: true }, axisLabel: { fontSize: 10 } },
        visualMap: {
            min: 5, max: 95, calculable: true, orient: 'horizontal' as const, left: 'center', bottom: '0%',
            inRange: { color:['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#14532d'] },
            textStyle: { color: 'var(--text-muted)' },
        },
        series: [{
            type: 'heatmap',
            data: heatmapData,
            label: { show: true, fontSize: 9 },
            emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } },
        }],
    };

    // ── طريقة الدفع ──
    const paymentMethodOption = {
        series: [{
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['50%', '45%'],
            data: [
                { name: 'نقدي', value: 45, itemStyle: { color: '#22c55e' } },   // green
                { name: 'فيزا', value: 25, itemStyle: { color: '#0ea5e9' } },   // cyan/blue
                { name: 'محفظة إلكترونية', value: 18, itemStyle: { color: '#6366f1' } }, // indigo
                { name: 'دفع لاحق', value: 8, itemStyle: { color: '#f59e0b' } }, // amber
                { name: 'آخر', value: 4, itemStyle: { color: '#94a3b8' } },     // muted slate
            ],
            label: { color: '#94a3b8', fontSize: 11 }, labelLine: { lineStyle: { color: '#334155' } },
        }],
    };

    // ── استفادة من الخصومات والكوبونات ──
    const discountUsageOption = {
        xAxis: { type: 'category' as const, data: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'] },
        yAxis: [
            { type: 'value' as const, name: 'العملاء', axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` } },
            { type: 'value' as const, name: 'الاستفادة %' },
        ],
        series: [
            {
                name: 'مستخدمي الخصومات',
                type: 'bar',
                data: [12000, 14000, 18000, 15000, 16000, 22000, 20000, 19000, 24000, 21000, 28000, 35000].map((v) => ({
                    value: v,
                    itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] }, // normalized green
                })),
                barWidth: 18,
            },
            {
                name: 'نسبة الاستفادة',
                type: 'line',
                yAxisIndex: 1,
                data: [13, 15, 19, 16, 17, 24, 22, 21, 26, 23, 30, 38],
                lineStyle: { color: '#0ea5e9', width: 2 }, // normalized cyan/blue
                itemStyle: { color: '#0ea5e9' },
            },
        ],
        legend: { data: ['مستخدمي الخصومات', 'نسبة الاستفادة'], bottom: 0, left: 'center' },
    };

    // ── قيمة الفاتورة ──
    const invoiceValueOption = {
        xAxis: { type: 'category' as const, data: ['<20', '20-50', '50-100', '100-200', '200-500', '500+'] },
        yAxis: { type: 'value' as const, name: 'العملاء', axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` } },
        series: [{
            type: 'bar',
            data: [8000, 22000, 32000, 18000, 9000, 3500].map((v, i) => ({
                value: v,
                itemStyle: {
                    color: ['#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#166534'][i], // light→dark greens
                    borderRadius: [4, 4, 0, 0],
                },
            })),
            barWidth: 32,
        }],
    };

    // ── Transaction Frequency vs ATV ──
    const txScatterData: number[][] = [];
    const seedHash = (s: number) => { let h = s * 2654435761; h = ((h >>> 16) ^ h) * 0x45d9f3b; return ((h >>> 16) ^ h) >>> 0; };
    for (let i = 0; i < 200; i++) {
        const h = seedHash(i + 7);
        const totalTx = (h % 650) + 1;
        const atv = totalTx > 300 ? 2 + (seedHash(i + 99) % 12) : totalTx > 100 ? 3 + (seedHash(i + 55) % 30) : 5 + (seedHash(i + 33) % 130);
        const avgVal = (seedHash(i + 200) % 1880) / 1000;
        const sz = Math.max(4, Math.min(25, (seedHash(i + 300) % 20) + 4));
        txScatterData.push([totalTx, atv, avgVal, sz]);
    }
    const txFreqOption = {
        grid: { left: '10%', right: '14%', top: '12%', bottom: '15%' },
        xAxis: { type: 'value' as const, name: 'إجمالي المعاملات لكل عميل', nameLocation: 'center' as const, nameGap: 30, max: 700 },
        yAxis: { type: 'value' as const, name: 'ATV لكل عميل', nameLocation: 'center' as const, nameGap: 35, max: 140 },
        visualMap: {
            show: true, dimension: 2, min: 0, max: 1.88, calculable: true,
            orient: 'horizontal' as const, left: 'center', top: 0,
            inRange: { color: ['#dcfce7', '#86efac', '#22c55e', '#14532d'] },
            text: ['1.88K', '0.00K'], textStyle: { fontSize: 9, color: 'var(--text-muted)' },
            formatter: (v: number) => `${v.toFixed(2)}K`,
        },
        series: [{
            type: 'scatter',
            data: txScatterData,
            symbolSize: (d: number[]) => d[3],
            encode: { x: 0, y: 1 },
            itemStyle: { opacity: 0.75 },
        }],
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-1"><UserCircle size={24} style={{ color: 'var(--accent-green)' }} /><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>سلوك العملاء</h1></div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>تحليل المستهلك: الفاتورة، الذروة، الخصومات، الدفع — التقرير الخامس</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { icon: UserCircle, label: 'إجمالي العملاء', value: '92.5K', color: 'var(--accent-green)' },
                    { icon: ShoppingBag, label: 'متوسط الفاتورة', value: '133 د.أ', color: 'var(--accent-cyan)' },
                    { icon: Clock, label: 'ساعة الذروة', value: '10-12 ص', color: 'var(--accent-amber)' },
                    { icon: Repeat, label: 'معدل العودة', value: '89%', color: 'var(--accent-blue)' },
                    { icon: CreditCard, label: 'الدفع النقدي', value: '45%', color: 'var(--accent-green)' },
                ].map((s) => (
                    <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-4 text-center">
                        <s.icon size={18} className="mx-auto mb-2" style={{ color: s.color }} />
                        <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[10px] font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    </motion.div>
                ))}
            </div>

            <ChartCard title="خريطة حرارية — أوقات الذروة" subtitle="كثافة العملاء حسب اليوم والساعة (Heatmap)" option={heatmapOption} height="340px" delay={1} />

            <ChartCard title="تكرار المعاملات مقابل متوسط قيمة المعاملة" subtitle="Transaction Frequency vs. Average Transaction Value" option={txFreqOption} height="400px" delay={2} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <ChartCard title="طريقة الدفع" subtitle="توزيع طرق الدفع للمستهلكين" option={paymentMethodOption} height="340px" delay={3} />
                <ChartCard title="توزيع قيمة الفاتورة" subtitle="عدد العملاء حسب قيمة الفاتورة (د.أ)" option={invoiceValueOption} height="340px" delay={4} />
            </div>

            <ChartCard title="استفادة من الخصومات والكوبونات" subtitle="عدد المستخدمين ونسبة الاستفادة الشهرية" option={discountUsageOption} height="300px" delay={5} />

            <CustomerInsightsTable />
        </div>
    );
}
