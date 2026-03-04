'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronLeft } from 'lucide-react';

// ── Deterministic seeded random ──
let _s = 77;
const sr = () => { _s = (_s * 16807) % 2147483647; return (_s & 0x7fffffff) / 2147483647; };

// ── Types ──
interface RowData {
    name: string;
    grossSales: number;
    netSales: number;
    nonDiscNetSales: number;
    discNetSales: number;
    voidSales: number;
    productVolume: number;
    nonDiscVolume: number;
    discVolume: number;
    avgPrice: number;
    avgDiscRate: number;
    children?: RowData[];
}

// ── Generate data ──
const PRODUCTS = [
    'أرز بسمتي ممتاز', 'أرز حبة متوسطة', 'زيت زيتون بكر', 'زيت عباد شمس',
    'حليب طازج كامل', 'لبن زبادي', 'سكر أبيض 1كغ', 'شاي أسود سيلاني',
    'معكرونة سباغيتي', 'تونة معلبة', 'فول مدمس', 'حمص بالطحينة',
    'دجاج مجمد', 'صدور دجاج', 'لحمة مفرومة', 'خبز عربي',
    'صابون غسيل', 'منظف أرضيات', 'شامبو ضد القشرة', 'حفاضات أطفال',
    'مياه معدنية', 'عصير برتقال', 'مشروب غازي', 'بسكويت شوكولاتة',
    'شيبس مملح', 'مكسرات مشكلة', 'بطاريات AA', 'مناديل ورقية',
];

const CATEGORIES = [
    'منتجات غذائية', 'مستلزمات منزلية', 'العناية الشخصية', 'مشروبات',
    'لحوم ودواجن', 'حلويات وسناكات', 'مستلزمات الأطفال', 'منتجات ورقية',
];

const BRANCHES = ['سوق المنارة', 'سوق سلاح الجو', 'فرع عمّان الغربي', 'فرع إربد', 'فرع الزرقاء'];

function mkRow(name: string, base: number): Omit<RowData, 'children'> {
    const gross = Math.round(base + sr() * base * 0.3);
    const net = Math.round(gross * (0.95 + sr() * 0.04));
    const discNet = Math.round(net * (0.15 + sr() * 0.1));
    const nonDiscNet = net - discNet;
    const voidSales = Math.round(gross * (0.001 + sr() * 0.003));
    const vol = Math.round(gross / (1.5 + sr() * 3));
    const discVol = Math.round(vol * (0.15 + sr() * 0.15));
    const nonDiscVol = vol - discVol;
    const avgPrice = Number((gross / vol).toFixed(2));
    const avgDiscRate = Number((discNet / net * 100).toFixed(2));
    return { name, grossSales: gross, netSales: net, nonDiscNetSales: nonDiscNet, discNetSales: discNet, voidSales, productVolume: vol, nonDiscVolume: nonDiscVol, discVolume: discVol, avgPrice, avgDiscRate };
}

_s = 77;
const tableData: RowData[] = BRANCHES.map(branch => {
    const bBase = 40000 + sr() * 160000;
    const cats: RowData[] = CATEGORIES.map(cat => {
        const cBase = bBase / CATEGORIES.length * (0.5 + sr());
        const prods: RowData[] = [];
        const pCount = 3 + Math.round(sr() * 4);
        for (let p = 0; p < pCount; p++) {
            prods.push(mkRow(PRODUCTS[(Math.round(sr() * 1000)) % PRODUCTS.length], cBase / pCount * (0.5 + sr())));
        }
        const catRow = mkRow(cat, cBase);
        // Sum children values into category
        catRow.grossSales = prods.reduce((s, r) => s + r.grossSales, 0);
        catRow.netSales = prods.reduce((s, r) => s + r.netSales, 0);
        catRow.nonDiscNetSales = prods.reduce((s, r) => s + r.nonDiscNetSales, 0);
        catRow.discNetSales = prods.reduce((s, r) => s + r.discNetSales, 0);
        catRow.voidSales = prods.reduce((s, r) => s + r.voidSales, 0);
        catRow.productVolume = prods.reduce((s, r) => s + r.productVolume, 0);
        catRow.nonDiscVolume = prods.reduce((s, r) => s + r.nonDiscVolume, 0);
        catRow.discVolume = prods.reduce((s, r) => s + r.discVolume, 0);
        catRow.avgPrice = Number((catRow.grossSales / catRow.productVolume).toFixed(2));
        catRow.avgDiscRate = Number((catRow.discNetSales / catRow.netSales * 100).toFixed(2));
        return { ...catRow, children: prods };
    });
    const branchRow = mkRow(branch, bBase);
    branchRow.grossSales = cats.reduce((s, r) => s + r.grossSales, 0);
    branchRow.netSales = cats.reduce((s, r) => s + r.netSales, 0);
    branchRow.nonDiscNetSales = cats.reduce((s, r) => s + r.nonDiscNetSales, 0);
    branchRow.discNetSales = cats.reduce((s, r) => s + r.discNetSales, 0);
    branchRow.voidSales = cats.reduce((s, r) => s + r.voidSales, 0);
    branchRow.productVolume = cats.reduce((s, r) => s + r.productVolume, 0);
    branchRow.nonDiscVolume = cats.reduce((s, r) => s + r.nonDiscVolume, 0);
    branchRow.discVolume = cats.reduce((s, r) => s + r.discVolume, 0);
    branchRow.avgPrice = Number((branchRow.grossSales / branchRow.productVolume).toFixed(2));
    branchRow.avgDiscRate = Number((branchRow.discNetSales / branchRow.netSales * 100).toFixed(2));
    return { ...branchRow, children: cats };
});

// ── Columns definition ──
const COLUMNS = [
    { key: 'grossSales', label: 'إجمالي المبيعات', labelEn: 'Gross Sales' },
    { key: 'netSales', label: 'صافي المبيعات', labelEn: 'Net Sales' },
    { key: 'nonDiscNetSales', label: 'مبيعات بدون خصم', labelEn: 'Non Disc. Net Sales' },
    { key: 'discNetSales', label: 'مبيعات مخصومة', labelEn: 'Discount Net Sales' },
    { key: 'voidSales', label: 'مبيعات ملغاة', labelEn: 'Void Sales' },
    { key: 'productVolume', label: 'حجم المنتجات', labelEn: 'Product Volume' },
    { key: 'nonDiscVolume', label: 'حجم غير مخصوم', labelEn: 'Non Disc. Volume' },
    { key: 'discVolume', label: 'حجم مخصوم', labelEn: 'Disc. Volume' },
    { key: 'avgPrice', label: 'متوسط السعر', labelEn: 'Avg. Price' },
    { key: 'avgDiscRate', label: 'متوسط الخصم %', labelEn: 'Avg. Disc. Rate' },
];

// ── MiniBar component ──
function MiniBar({ value, max, color = 'var(--accent-blue)' }: { value: number; max: number; color?: string }) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div style={{ display: 'inline-block', width: '50px', height: '6px', borderRadius: '3px', background: 'var(--bg-elevated)', verticalAlign: 'middle', marginRight: '6px' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: '3px', background: color, transition: 'width 0.3s' }} />
        </div>
    );
}

// ── Main Component ──
export default function DrillDownTable() {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggle = (key: string) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Compute totals
    const totals = useMemo(() => {
        const t: Record<string, number> = {};
        COLUMNS.forEach(c => { t[c.key] = 0; });
        tableData.forEach(b => {
            COLUMNS.forEach(c => { t[c.key] += (b as any)[c.key]; });
        });
        t.avgPrice = Number((t.grossSales / t.productVolume).toFixed(2));
        t.avgDiscRate = Number((t.discNetSales / t.netSales * 100).toFixed(2));
        return t;
    }, []);

    const maxGross = useMemo(() => Math.max(...tableData.map(b => b.grossSales)), []);

    const fmt = (v: number, key: string) => {
        if (key === 'avgPrice') return v.toFixed(2);
        if (key === 'avgDiscRate') return `${v.toFixed(2)}%`;
        if (key === 'voidSales') return v.toFixed(2);
        return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const renderRow = (row: RowData, level: number, parentKey: string, idx: number) => {
        const key = `${parentKey}-${idx}`;
        const hasChildren = row.children && row.children.length > 0;
        const isOpen = expanded[key];
        const indent = level * 24;

        // ألوان الخلفية لكل مستوى (فرع → فئة → منتج) متناسقة مع جداول الخصومات / العمليات
        const bgColors = [
            'transparent',                       // Branch row
            'rgba(4,120,87,0.02)',               // Category level (خفيف أخضر)
            'rgba(8,145,178,0.02)',              // Product level (خفيف سماوي)
        ];

        const levelColors = [
            'var(--text-primary)',               // Branch name
            'var(--accent-cyan)',                // Category name
            'var(--text-secondary)',             // Product name
        ];

        const rows: React.ReactNode[] = [];

        rows.push(
            <tr
                key={key}
                style={{
                    background: bgColors[level] || 'transparent',
                    cursor: hasChildren ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                }}
                onClick={() => hasChildren && toggle(key)}
                onMouseEnter={(e) => {
                    if (hasChildren) {
                        (e.currentTarget as HTMLElement).style.background =
                            level === 0 ? 'rgba(0,229,160,0.06)' : level === 1 ? 'rgba(8,145,178,0.06)' : 'rgba(148,163,184,0.06)';
                    }
                }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = bgColors[level] || 'transparent'; }}
            >
                {/* Name column */}
                <td style={{ paddingRight: `${indent + 12}px`, whiteSpace: 'nowrap' }}>
                    <div className="flex items-center gap-1.5">
                        {hasChildren ? (
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '4px',
                                    background:
                                        level === 0
                                            ? (isOpen ? 'rgba(0,229,160,0.15)' : 'var(--bg-elevated)')
                                            : (isOpen ? 'rgba(8,145,178,0.12)' : 'var(--bg-elevated)'),
                                    transition: 'all 0.2s',
                                }}
                            >
                                {isOpen ? (
                                    <ChevronDown
                                        size={11}
                                        style={{ color: level === 0 ? 'var(--accent-green)' : 'var(--accent-cyan)' }}
                                    />
                                ) : (
                                    <ChevronLeft size={11} style={{ color: 'var(--text-muted)' }} />
                                )}
                            </span>
                        ) : (
                            <span style={{ width: '16px', display: 'inline-block' }} />
                        )}
                        <span className="text-xs font-medium" style={{ color: levelColors[level] }}>
                            {row.name}
                        </span>
                    </div>
                </td>

                {/* Data columns */}
                {COLUMNS.map(col => {
                    const val = (row as any)[col.key] as number;
                    const showBar = level === 0 && (col.key === 'grossSales' || col.key === 'netSales');
                    const isVoid = col.key === 'voidSales';
                    const isDisc = col.key === 'avgDiscRate';

                    return (
                        <td key={col.key} style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                            <div className="flex items-center gap-1">
                                {showBar && (
                                    <MiniBar
                                        value={val}
                                        max={maxGross}
                                        color={col.key === 'grossSales' ? 'var(--accent-blue)' : 'var(--accent-green)'}
                                    />
                                )}
                                <span
                                    className="text-xs font-medium"
                                    style={{
                                        color:
                                            isVoid && val > 100
                                                ? 'var(--accent-red)'
                                                : isDisc
                                                    ? 'var(--accent-amber)'
                                                    : level === 0
                                                        ? 'var(--text-primary)'
                                                        : 'var(--text-secondary)',
                                    }}
                                    dir="ltr"
                                >
                                    {fmt(val, col.key)}
                                </span>
                            </div>
                        </td>
                    );
                })}
            </tr>
        );

        // Render children
        if (hasChildren && isOpen) {
            row.children!.forEach((child, ci) => {
                rows.push(...renderRow(child, level + 1, key, ci));
            });
        }

        return rows;
    };

    return (
        <div className="glass-panel overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    تحليل المبيعات التفصيلي — سوق / فئة / منتج
                </h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    اضغط على أي صف للتوسع • إجمالي ← صافي ← خصومات ← حجم المنتجات
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="enterprise-table" style={{ minWidth: '1200px' }}>
                    <thead>
                        <tr>
                            <th style={{ minWidth: '160px', textAlign: 'right' }}>الاسم</th>
                            {COLUMNS.map(col => (
                                <th key={col.key} style={{ textAlign: 'left', minWidth: '110px', fontSize: '10px', lineHeight: '1.3' }}>
                                    <div>{col.label}</div>
                                    <div style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '9px' }}>{col.labelEn}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((branch, bi) => renderRow(branch, 0, 'root', bi))}

                        {/* Total row */}
                        <tr
                            style={{
                                background: 'var(--accent-green-dim)',
                                borderTop: '2px solid rgba(0,229,160,0.3)',
                            }}
                        >
                            <td>
                                <span className="text-xs font-bold" style={{ color: 'var(--accent-green)', paddingRight: '12px' }}>
                                    الإجمالي — Total
                                </span>
                            </td>
                            {COLUMNS.map(col => (
                                <td key={col.key} style={{ textAlign: 'left' }}>
                                    <span className="text-xs font-bold" style={{ color: 'var(--accent-green)' }} dir="ltr">
                                        {fmt(totals[col.key], col.key)}
                                    </span>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
