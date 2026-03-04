'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';

// ── بنية البيانات ──
interface TreeNode {
    id: string;
    label: string;
    labelEn?: string;
    value: number;
    children?: TreeNode[];
}

// ── Deterministic seed-based pseudo-random ──
let _seed = 42;
const srand = () => { _seed = (_seed * 16807 + 0) % 2147483647; return (_seed & 0x7fffffff) / 2147483647; };

// ── Product names pool ──
const PROD_NAMES = [
    'أرز بسمتي ممتاز', 'أرز حبة متوسطة', 'أرز مطبوخ فاخر', 'أرز أصفر سنوات الخير',
    'زيت زيتون بكر', 'زيت عباد شمس 2ل', 'زيت ذرة 1ل', 'زيت نباتي 3ل',
    'حليب طازج كامل', 'حليب قليل الدسم', 'لبن زبادي 1ك', 'لبنة طازجة 500غ',
    'سكر أبيض 1كغ', 'سكر بني عضوي', 'ملح طعام ناعم', 'ملح يود مدعم',
    'شاي أخضر فاخر', 'شاي أسود سيلاني', 'قهوة عربية 250غ', 'نسكافيه كلاسيك',
    'معكرونة سباغيتي', 'معكرونة بيني', 'فتوتشيني 400غ', 'لازانيا جاهزة',
    'صابون غسيل 3ك', 'منظف أرضيات', 'مبيض ملابس 2ل', 'معطر أقمشة',
    'شامبو ضد القشرة', 'بلسم شعر مغذي', 'كريم مرطب يومي', 'واقي شمس SPF50',
    'حفاضات مقاس 3', 'حفاضات مقاس 4', 'مناديل مبللة 80ق', 'زجاجة رضاعة',
    'تونة معلبة 185غ', 'فول مدمس 400غ', 'حمص بالطحينة', 'ذرة حلوة معلبة',
    'عصير برتقال 1ل', 'عصير تفاح طبيعي', 'مياه معدنية 1.5ل', 'مشروب غازي 330مل',
    'دجاج مجمد 1200غ', 'صدور دجاج طازج', 'لحمة مفرومة 1ك', 'ستيك عجل 500غ',
    'خبز عربي 6 أرغفة', 'خبز توست أبيض', 'كعك بالسمسم', 'صامولي 8 حبات',
];

const SUB_MAP: Record<string, string[]> = {
    'منتجات غذائية': ['حبوب وأرز', 'زيوت', 'حليب وألبان', 'سكر وملح', 'شاي وقهوة', 'معكرونة', 'بقوليات', 'معلبات', 'خبز ومعجنات', 'بهارات وتوابل', 'صلصات', 'عسل ومربى'],
    'مستلزمات منزلية': ['منظفات', 'أدوات مطبخ', 'أكياس وأغلفة', 'إسفنج وفرش', 'معطرات جو', 'ورق ألمنيوم'],
    'العناية الشخصية': ['شامبو وبلسم', 'كريمات بشرة', 'معجون أسنان', 'مزيل عرق', 'عطور', 'حلاقة رجالية'],
    'مشروبات': ['عصائر طبيعية', 'مياه معدنية', 'مشروبات غازية', 'مشروبات طاقة', 'شاي مثلج'],
    'لحوم ودواجن': ['دجاج طازج', 'لحم عجل', 'لحم خروف', 'لحوم مجمدة', 'نقانق ومرتديلا'],
    'مستلزمات الأطفال': ['حفاضات', 'حليب أطفال', 'طعام أطفال', 'زجاجات وأدوات'],
    'منتجات ورقية': ['مناديل', 'ورق تواليت', 'فوط صحية', 'ورق مطبخ'],
    'أجهزة وإلكترونيات': ['بطاريات', 'إضاءة LED', 'توصيلات كهرباء', 'شواحن'],
    'حلويات وسناكات': ['شوكولاتة', 'بسكويت', 'شيبس', 'مكسرات', 'حلاوة طحينية', 'فشار'],
    'منتجات تجميل': ['مكياج', 'طلاء أظافر', 'مرطبات شفاه', 'كحل وماسكارا'],
};

const CATS = [
    { label: 'منتجات غذائية', pct: 0.36 },
    { label: 'مستلزمات منزلية', pct: 0.14 },
    { label: 'العناية الشخصية', pct: 0.11 },
    { label: 'مشروبات', pct: 0.09 },
    { label: 'لحوم ودواجن', pct: 0.08 },
    { label: 'حلويات وسناكات', pct: 0.07 },
    { label: 'مستلزمات الأطفال', pct: 0.05 },
    { label: 'منتجات ورقية', pct: 0.04 },
    { label: 'منتجات تجميل', pct: 0.03 },
    { label: 'أجهزة وإلكترونيات', pct: 0.02 },
    { label: 'غير مصنف', pct: 0.01 },
];

const BRANCHES = [
    { label: 'سوق المنارة المركزي', pct: 0.18 },
    { label: 'سوق سطح النجم', pct: 0.12 },
    { label: 'فرع عمّان الغربي', pct: 0.10 },
    { label: 'فرع إربد الرئيسي', pct: 0.09 },
    { label: 'فرع الزرقاء الشمالي', pct: 0.08 },
    { label: 'فرع العقبة الميناء', pct: 0.07 },
    { label: 'فرع مادبا المدينة', pct: 0.07 },
    { label: 'فرع السلط وسط البلد', pct: 0.06 },
    { label: 'فرع الكرك الجنوبي', pct: 0.06 },
    { label: 'فرع المفرق الشمالي', pct: 0.06 },
    { label: 'فرع جرش التراث', pct: 0.06 },
    { label: 'فرع الطفيلة', pct: 0.05 },
];

// ── Build tree deterministically ──
const TOTAL = 1847520;
_seed = 42; // reset seed for deterministic output

const treeData: TreeNode = {
    id: 'root',
    label: 'صافي المبيعات',
    labelEn: 'Net Sales',
    value: TOTAL,
    children: BRANCHES.map((b, bi) => {
        const bVal = Math.round(TOTAL * b.pct + srand() * 5000);
        return {
            id: `b${bi}`, label: b.label, value: bVal,
            children: CATS.map((c, ci) => {
                const cVal = Math.round(bVal * c.pct + srand() * 2000);
                const subs = SUB_MAP[c.label] || ['متفرقات', 'عام', 'أخرى'];
                return {
                    id: `b${bi}-c${ci}`, label: c.label, value: cVal,
                    children: subs.map((s, si) => {
                        const sVal = Math.round(cVal / subs.length * (1 - si * 0.07) + srand() * 800);
                        const pCount = 12 + Math.round(srand() * 6);
                        return {
                            id: `b${bi}-c${ci}-s${si}`, label: s, value: sVal,
                            children: Array.from({ length: pCount }, (_, pi) => ({
                                id: `b${bi}-c${ci}-s${si}-p${pi}`,
                                label: PROD_NAMES[pi % PROD_NAMES.length],
                                value: Math.round(sVal / pCount * (1 - pi * 0.05) + srand() * 200),
                            })),
                        };
                    }),
                };
            }),
        };
    }),
};

type Level = { label: string; node: TreeNode };

// ── مكوّن عنصر الشجرة ──
function TreeItem({ node, max, selected, onClick }: {
    node: TreeNode;
    max: number;
    selected: boolean;
    onClick: () => void;
}) {
    const pct = Math.round((node.value / max) * 100);
    return (
        <button
            onClick={onClick}
            className="w-full text-right transition-all rounded-md p-2 mb-1"
            style={{
                background: selected ? 'rgba(37,99,235,0.12)' : 'transparent',
                border: `1px solid ${selected ? '#2563eb' : 'transparent'}`,
            }}
        >
            {/* شريط التقدم الأزرق */}
            <div className="mb-1.5 h-[5px] rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: selected ? '#2563eb' : '#3b82f6' }}
                />
            </div>
            <p className="text-[11px] font-medium leading-tight text-right truncate max-w-[140px]" style={{ color: selected ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                {node.label}
            </p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: selected ? 'var(--accent-blue)' : 'var(--text-muted)' }} dir="ltr">
                {node.value.toLocaleString('en-US')}
            </p>
        </button>
    );
}

// ── المكوّن الرئيسي ──
export default function TreeDrillDown() {
    // مسار الحفر: [ { label: column-title, node: selected } ]
    const [path, setPath] = useState<Level[]>([]);

    // الأعمدة الحالية
    const columns: { title: string; titleAr: string; nodes: TreeNode[] }[] = [];

    // أضف البيانات الجذرية كعمود أول
    const rootChildren = treeData.children || [];
    columns.push({ title: 'Branch', titleAr: 'الفرع', nodes: rootChildren });

    // أعمدة ديناميكية بناءً على المسار
    for (let i = 0; i < path.length; i++) {
        const children = path[i].node.children;
        if (children && children.length > 0) {
            const nextTitles = ['Category', 'SubCategory', 'Product Na...'];
            const nextTitlesAr = ['الفئة', 'الفئة الفرعية', 'المنتج'];
            columns.push({
                title: nextTitles[i] || `Level ${i + 2}`,
                titleAr: nextTitlesAr[i] || `المستوى ${i + 2}`,
                nodes: children,
            });
        }
    }

    // القيمة القصوى لكل عمود
    const getMax = (nodes: TreeNode[]) => Math.max(...nodes.map(n => n.value));

    const handleSelect = (colIdx: number, node: TreeNode) => {
        // إذا نقر على نفس العنصر المحدد → إلغاء
        if (path[colIdx]?.node.id === node.id) {
            setPath(path.slice(0, colIdx));
        } else {
            setPath([...path.slice(0, colIdx), { label: columns[colIdx].title, node }]);
        }
    };

    const removeFilter = (idx: number) => {
        setPath(path.slice(0, idx));
    };

    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = 0; // RTL: scroll to start
        }
    }, [path.length]);

    return (
        <div className="glass-panel overflow-hidden">
            {/* رأس */}
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Decomposition Tree — التحليل الهرمي للمبيعات
                </h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    اضغط على أي عنصر للتعمق في التفاصيل • الفرع ← الفئة ← الفئة الفرعية ← المنتج
                </p>
            </div>

            {/* شريط الفلاتر */}
            <AnimatePresence>
                {path.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex items-center gap-2 px-5 py-2 border-b flex-wrap"
                        style={{ borderColor: 'var(--border-subtle)' }}
                    >
                        {path.map((lvl, i) => (
                            <span key={lvl.node.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                                style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', color: 'var(--accent-blue)' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{lvl.label}</span>
                                <span style={{ color: 'var(--accent-blue)' }}>{lvl.node.label}</span>
                                <button onClick={() => removeFilter(i)} className="opacity-60 hover:opacity-100 transition-opacity">
                                    <X size={10} />
                                </button>
                            </span>
                        ))}
                        {path.length > 0 && (
                            <button onClick={() => setPath([])} className="text-[10px] underline" style={{ color: 'var(--text-muted)' }}>
                                مسح الكل
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* جسم الشجرة */}
            <div ref={scrollRef} className="flex overflow-x-auto p-5 gap-0 items-start" dir="ltr">

                {/* عمود الجذر: Net Sales */}
                <div className="flex-shrink-0 flex flex-col items-start justify-center ml-2" style={{ minWidth: '110px' }}>
                    <div className="p-2 rounded-md" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)' }}>
                        <p className="text-[10px] font-semibold" style={{ color: 'var(--accent-blue)' }}>Net Sales</p>
                        <p className="text-sm font-bold" style={{ color: 'var(--accent-blue)' }} dir="ltr">
                            {treeData.value.toLocaleString('en-US')}
                        </p>
                    </div>
                </div>

                {/* خط توصيل من الجذر */}
                <ConnectorLine />

                {/* أعمدة ديناميكية */}
                {columns.map((col, colIdx) => {
                    const selectedNode = path[colIdx]?.node;
                    const maxVal = getMax(col.nodes);
                    return (
                        <React.Fragment key={`col-${colIdx}`}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: colIdx * 0.05 }}
                                className="flex-shrink-0"
                                style={{ minWidth: '160px', maxWidth: '160px' }}
                            >
                                {/* رأس العمود */}
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                                        {col.title}
                                    </span>
                                    {selectedNode && colIdx < path.length && (
                                        <button onClick={() => removeFilter(colIdx)}
                                            className="p-0.5 rounded transition-colors"
                                            style={{ color: 'var(--text-muted)' }}>
                                            <X size={10} />
                                        </button>
                                    )}
                                </div>

                                {/* العناصر */}
                                <div
                                    className="space-y-0 overflow-y-auto"
                                    style={{ maxHeight: '650px', paddingRight: '2px' }}
                                >
                                    {col.nodes.map((node) => (
                                        <TreeItem
                                            key={node.id}
                                            node={node}
                                            max={maxVal}
                                            selected={selectedNode?.id === node.id}
                                            onClick={() => handleSelect(colIdx, node)}
                                        />
                                    ))}
                                </div>
                            </motion.div>

                            {/* خطوط التوصيل بين الأعمدة */}
                            {colIdx < columns.length - 1 && (
                                <ConnectorLine selected={!!selectedNode} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

// ── خط التوصيل ──
function ConnectorLine({ selected = true }: { selected?: boolean }) {
    return (
        <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '28px', paddingTop: '40px' }}>
            <div style={{
                width: '24px',
                height: '2px',
                background: selected ? 'rgba(37,99,235,0.6)' : 'var(--border-subtle)',
                transition: 'background 0.3s',
            }} />
        </div>
    );
}
