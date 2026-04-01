"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-scatter";
import dynamic from "next/dynamic";
import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Percent,
  Layers,
  ChevronDown,
  ChevronLeft,
  Check,
  Search,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import { getProductData, type ProductData } from "@/lib/mockData";
import { BRANCH_PRODUCT_ANALYSIS } from "@/lib/branchProductAnalysis";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useThemeStore } from "@/store/themeStore";

function useClickOutside(
  ref: React.RefObject<HTMLDivElement | null>,
  cb: () => void,
) {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

function InlineDropdown({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  accent = "var(--accent-green)",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const display = options.find((o) => o.value === value)?.label ?? label;
  const isChanged = value !== options[0].value;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02]"
        style={{
          background: isChanged
            ? `color-mix(in srgb, ${accent} 15%, transparent)`
            : "var(--bg-elevated)",
          border: `1px solid ${isChanged ? accent : "var(--border-subtle)"}`,
          color: isChanged ? accent : "var(--text-secondary)",
          whiteSpace: "nowrap",
        }}
      >
        <Icon size={12} style={{ color: accent }} />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 160,
          }}
        >
          {display}
        </span>
        <ChevronDown
          size={10}
          style={{
            opacity: 0.6,
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            style={{
              position: "absolute",
              top: "calc(100% + 5px)",
              right: 0,
              zIndex: 1050,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,.4)",
              minWidth: 180,
              overflow: "hidden",
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className="w-full text-right px-3 py-2 text-[11px] transition-colors hover:bg-white/5 block"
                style={{
                  color: o.value === value ? accent : "var(--text-secondary)",
                  fontWeight: o.value === value ? 700 : 400,
                }}
              >
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InlineMultiSelectDropdown({
  icon: Icon,
  label,
  selectedValues,
  options,
  onChange,
  accent = "var(--accent-green)",
  manyLabel,
}: {
  icon: React.ElementType;
  label: string;
  selectedValues: string[];
  options: { value: string; label: string }[];
  onChange: (values: string[]) => void;
  accent?: string;
  manyLabel: (count: number) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const allOption = options[0];
  const rest = options.slice(1);
  const isDefault = selectedValues.length === 0;

  const display = (() => {
    if (isDefault) return allOption.label;
    if (selectedValues.length === 1) {
      return rest.find((o) => o.value === selectedValues[0])?.label ?? label;
    }
    return manyLabel(selectedValues.length);
  })();

  const isChanged = !isDefault;

  const toggle = (value: string) => {
    if (value === allOption.value) {
      onChange([]);
      return;
    }
    const set = new Set(selectedValues);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    onChange([...set]);
  };

  const rowSelected = (value: string) =>
    value === allOption.value ? isDefault : selectedValues.includes(value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02]"
        style={{
          background: isChanged
            ? `color-mix(in srgb, ${accent} 15%, transparent)`
            : "var(--bg-elevated)",
          border: `1px solid ${isChanged ? accent : "var(--border-subtle)"}`,
          color: isChanged ? accent : "var(--text-secondary)",
          whiteSpace: "nowrap",
          maxWidth: 220,
        }}
      >
        <Icon size={12} style={{ color: accent, flexShrink: 0 }} />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {display}
        </span>
        <ChevronDown
          size={10}
          style={{
            opacity: 0.6,
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            className="z-1050"
            transition={{ duration: 0.13 }}
            style={{
              position: "absolute",
              top: "calc(100% + 5px)",
              right: 0,
              zIndex: 1050,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,.4)",
              minWidth: 180,
              maxHeight: 280,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {options.map((o) => {
              const sel = rowSelected(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggle(o.value)}
                  className="w-full text-right px-3 py-2 text-[11px] transition-colors hover:bg-white/5 flex items-center justify-between gap-2"
                  style={{
                    color: sel ? accent : "var(--text-secondary)",
                    fontWeight: sel ? 700 : 400,
                  }}
                >
                  <span className="min-w-0 flex-1">{o.label}</span>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: `1.5px solid ${sel ? accent : "var(--border-subtle)"}`,
                      background: sel
                        ? `color-mix(in srgb, ${accent} 22%, transparent)`
                        : "transparent",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {sel && (
                      <Check
                        size={12}
                        strokeWidth={3}
                        style={{ color: accent }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InlineSearchDropdown({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  accent = "#00d4ff",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => {
    setOpen(false);
    setQ("");
  });

  const filtered = options.filter((o) => o.includes(q));
  const isSet = !!value;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02]"
        style={{
          background: isSet
            ? `color-mix(in srgb, ${accent} 15%, transparent)`
            : "var(--bg-elevated)",
          border: `1px solid ${isSet ? accent : "var(--border-subtle)"}`,
          color: isSet ? accent : "var(--text-secondary)",
          whiteSpace: "nowrap",
          maxWidth: 180,
        }}
      >
        <Icon size={12} style={{ color: accent }} />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 120,
          }}
        >
          {value || label}
        </span>
        <ChevronDown
          size={10}
          style={{
            opacity: 0.6,
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            style={{
              position: "absolute",
              top: "calc(100% + 5px)",
              right: 0,
              zIndex: 1050,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,.4)",
              width: 220,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "8px 8px 4px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  borderRadius: 7,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <Search
                  size={10}
                  style={{ color: "var(--text-muted)", flexShrink: 0 }}
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="بحث..."
                  autoFocus
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: 11,
                    color: "var(--text-primary)",
                    width: "100%",
                    direction: "rtl",
                  }}
                />
              </div>
            </div>
            <div style={{ maxHeight: 180, overflowY: "auto" }}>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                    setQ("");
                  }}
                  className="w-full text-right px-3 py-1.5 text-[10px] transition-colors hover:bg-white/5 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  ✕ إلغاء الاختيار
                </button>
              )}
              {filtered.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                    setQ("");
                  }}
                  className="w-full text-right px-3 py-1.5 text-[11px] transition-colors hover:bg-white/5 block"
                  style={{
                    color: o === value ? accent : "var(--text-secondary)",
                    fontWeight: o === value ? 700 : 400,
                  }}
                >
                  {o}
                </button>
              ))}
              {filtered.length === 0 && (
                <p
                  style={{
                    padding: "8px 12px",
                    fontSize: 10,
                    color: "var(--text-muted)",
                  }}
                >
                  لا توجد نتائج
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const categories = [
  { name: "منتجات غذائية", netSales: 248170, volume: 150240, margin: 38.2 },
  { name: "العناية الشخصية", netSales: 55880, volume: 64300, margin: 42.1 },
  { name: "غير مصنف", netSales: 46000, volume: 38000, margin: 30.5 },
  { name: "فرفاشية", netSales: 240, volume: 480, margin: 25.0 },
  { name: "مستلزمات الأطفال", netSales: 35010, volume: 22800, margin: 44.8 },
  { name: "مستلزمات منزلية", netSales: 10080, volume: 8900, margin: 35.6 },
  { name: "منتجات ورقية", netSales: 22220, volume: 18400, margin: 26.3 },
  { name: "مسطحات", netSales: 8340, volume: 5980, margin: 48.5 },
];

const branchNamesForLegend = BRANCH_PRODUCT_ANALYSIS.map((b) => b.branch).join(
  "، ",
);

const top10 = [
  {
    name: "أرز مطبوخ ممتاز سطح الطرمة 4.5 كجم",
    profit: 8420,
    trend: [520, 580, 610, 640, 700, 750, 680, 720, 810, 850, 880, 920],
  },
  {
    name: "الفراولة تايم تشكيلة ألبو سيرياكس كبير",
    profit: 7680,
    trend: [480, 520, 540, 600, 640, 690, 620, 660, 740, 780, 810, 840],
  },
  {
    name: "معجون بودي ناعم بطاقة 45 غم",
    profit: 6540,
    trend: [400, 430, 470, 510, 530, 580, 560, 600, 640, 670, 690, 720],
  },
  {
    name: "طحينة طعم الأصل 1000 ملل",
    profit: 5890,
    trend: [350, 380, 420, 460, 480, 530, 500, 540, 580, 610, 630, 660],
  },
  {
    name: "شوكولاته توبي مولد كلشيء بلاستيك 30",
    profit: 5240,
    trend: [310, 340, 360, 400, 430, 470, 440, 480, 520, 550, 570, 600],
  },
  {
    name: "شوكولاته ندى تحت الجرب خضراء كار 30",
    profit: 4780,
    trend: [280, 300, 330, 370, 390, 420, 400, 440, 470, 500, 510, 540],
  },
  {
    name: "قرص ويفر 250ملل كيمر بلاستيك",
    profit: 4320,
    trend: [240, 260, 290, 320, 350, 380, 360, 390, 420, 440, 460, 490],
  },
  {
    name: "جبن هروة جاج 18 غم غامق 100 غم",
    profit: 3960,
    trend: [200, 220, 250, 280, 310, 340, 320, 350, 380, 400, 420, 450],
  },
  {
    name: "جبل طيبي 1 كيل طيبي 250 غم",
    profit: 3580,
    trend: [180, 200, 220, 250, 270, 300, 280, 310, 340, 360, 380, 400],
  },
  {
    name: "مكارونة كلاسيك ألبين 15 كجم",
    profit: 3240,
    trend: [150, 170, 190, 220, 240, 270, 250, 280, 310, 330, 340, 360],
  },
];

const bottom10 = [
  {
    name: "سبانخ معلبة هيلو 28 غم",
    profit: 18,
    trend: [5, 4, 3, 2, 3, 2, 1, 2, 1, 1, 1, 1],
  },
  {
    name: "أوكال كوباية لبن كيس 15",
    profit: 22,
    trend: [6, 5, 5, 4, 3, 3, 2, 2, 2, 1, 1, 2],
  },
  {
    name: "معمول بودرة نقاطة 43 غم",
    profit: 24,
    trend: [8, 7, 6, 5, 5, 4, 3, 3, 2, 2, 2, 2],
  },
  {
    name: "طحينة طعم بخل الأصل 1000ملل",
    profit: 31,
    trend: [10, 9, 8, 7, 6, 5, 4, 4, 3, 3, 2, 3],
  },
  {
    name: "شوكولاته توبي ربيع بلاستيك 30",
    profit: 38,
    trend: [14, 12, 11, 9, 8, 7, 6, 5, 5, 4, 3, 4],
  },
  {
    name: "ندى خضراء تحت الشرقي كار باكت",
    profit: 42,
    trend: [18, 16, 14, 12, 10, 9, 8, 7, 6, 5, 5, 4],
  },
  {
    name: "قرص ويفر 250ملل كيمر",
    profit: 47,
    trend: [22, 20, 18, 15, 13, 11, 10, 9, 8, 7, 6, 5],
  },
  {
    name: "مامون كبير 550ملل بلاستيك",
    profit: 51,
    trend: [28, 25, 22, 19, 16, 14, 12, 11, 10, 8, 7, 6],
  },
  {
    name: "فول مطبوخ كامل القمر 500 ملل",
    profit: 56,
    trend: [35, 32, 28, 24, 20, 18, 15, 13, 12, 10, 9, 8],
  },
  {
    name: "محدون اكسل مساسكا 300 مل ستاكس",
    profit: 61,
    trend: [42, 38, 34, 30, 26, 22, 19, 16, 14, 12, 10, 9],
  },
];

const contrib = [
  { name: "دجاج محمد باريال", vol: 2.08, profit: 7.31 },
  { name: "دجاج سنحه نعمه", vol: 3.26, profit: 9.12 },
  { name: "أرز مضغوط نعم", vol: 2.54, profit: 6.84 },
  { name: "أرز هياتي من", vol: 3.02, profit: 8.25 },
  { name: "الفراولة شبكية حلو", vol: 1.59, profit: 5.2 },
  { name: "سامي حلانه شبكي", vol: 1.42, profit: 4.8 },
  { name: "دجاج حلانه", vol: 1.28, profit: 4.1 },
  { name: "صاج التصليح مصمح", vol: 1.15, profit: 3.9 },
  { name: "ريت بناء 12 ق", vol: 1.08, profit: 3.62 },
  { name: "الفراولة شعلي أسر", vol: 0.98, profit: 3.4 },
  { name: "الفراني شام أمو", vol: 0.88, profit: 2.95 },
  { name: "حليب مراعي 2.25", vol: 0.78, profit: 2.6 },
  { name: "الكشك حمص غال", vol: 0.65, profit: 2.1 },
  { name: "معجن ماكد مقلق", vol: 0.52, profit: 1.8 },
  { name: "زيت المنورة شريك", vol: 0.42, profit: 1.45 },
];

const totalNetSales = categories.reduce((a, c) => a + c.netSales, 0);
const totalProfitValue = Math.round(totalNetSales * 0.365);
const totalCostValue = totalNetSales - totalProfitValue;
const totalVolume = categories.reduce((a, c) => a + c.volume, 0);
// const maxBottom = Math.max(...bottom10.map((p) => p.profit));

const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(2)}K` : String(n);

export default function ProductsPage() {
  const palette = useResolvedAnalyticsPalette();
  const catColors = useMemo(
    () => [
      palette.primaryGreen,
      palette.primaryCyan,
      palette.primaryBlue,
      palette.primaryIndigo,
      palette.primaryAmber,
      palette.primaryRed,
      "#0d9488",
      "#059669",
    ],
    [palette],
  );
  const products = useMemo(() => getProductData(), []);
  const productGroup1Options = useMemo(() => {
    const set = new Set(products.map((p) => String(p.categoryAr)));
    return Array.from(set);
  }, [products]);
  const productGroup2Options = useMemo(() => {
    const set = new Set(products.map((p) => String(p.subcategory)));
    return Array.from(set);
  }, [products]);
  const productGroup3Options = useMemo(() => ["مرتفع", "متوسط", "منخفض"], []);
  const productGroup3MultiOptions = useMemo(
    () => [
      { value: "all", label: "كل المجموعة الثالثة" },
      ...productGroup3Options.map((o) => ({ value: o, label: o })),
    ],
    [productGroup3Options],
  );

  const g1Options = useMemo(
    () => [
      { value: "all", label: "كل المجموعة الأولى" },
      ...productGroup1Options.map((o) => ({ value: o, label: o })),
    ],
    [productGroup1Options],
  );
  const g2Options = useMemo(
    () => [
      { value: "all", label: "كل المجموعة الثانية" },
      ...productGroup2Options.map((o) => ({ value: o, label: o })),
    ],
    [productGroup2Options],
  );

  const [selectedG1, setSelectedG1] = useState<string | null>(null);
  const [selectedG2, setSelectedG2] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  /** عندما يتم اختيار منتج: يمكن تصفية المجموعة الثالثة عبر الشرائح */
  const [selectedG3, setSelectedG3] = useState<string[]>([]);

  const productRowsForScatter = useMemo(() => {
    const toG3 = (trend: ProductData["trend"]) =>
      trend === "up" ? "مرتفع" : trend === "stable" ? "متوسط" : "منخفض";

    return products
      .filter((p) => (selectedG1 ? p.categoryAr === selectedG1 : true))
      .filter((p) => (selectedG2 ? p.subcategory === selectedG2 : true))
      .filter((p) => (selectedProduct ? p.nameAr === selectedProduct : true))
      .filter((p) => {
        if (!selectedProduct) return true;
        if (selectedG3.length === 0) return true;
        return selectedG3.includes(toG3(p.trend));
      })
      .map((p) => ({
        key: p.id,
        nameAr: p.nameAr,
        volume: p.unitsSold,
        margin: p.margin,
        g1: p.categoryAr,
        g2: p.subcategory,
        g3: toG3(p.trend),
      }));
  }, [products, selectedG1, selectedG2, selectedProduct, selectedG3]);

  // فلاتر مخطط «حجم المبيعات و الأرباح حسب المنتج»
  const [contribG1, setContribG1] = useState<string | null>(null);
  const [contribG2, setContribG2] = useState<string | null>(null);
  const [contribProduct, setContribProduct] = useState<string | null>(null);

  const productMetaByName = useMemo(() => {
    const map = new Map<string, { g1: string; g2: string }>();
    products.forEach((p) => {
      map.set(p.nameAr, {
        g1: String(p.categoryAr),
        g2: String(p.subcategory),
      });
    });
    return map;
  }, [products]);

  const contribFilteredSorted = useMemo(() => {
    const filtered = contrib.filter((r) => {
      const meta = productMetaByName.get(r.name);
      if (contribG1 && meta?.g1 !== contribG1) return false;
      if (contribG2 && meta?.g2 !== contribG2) return false;
      if (contribProduct && r.name !== contribProduct) return false;
      return true;
    });
    return [...filtered].sort((a, b) => a.profit - b.profit);
  }, [contribG1, contribG2, contribProduct, productMetaByName]);

  const contribProductOptions = useMemo(() => {
    const out = products
      .filter((p) => (contribG1 ? p.categoryAr === contribG1 : true))
      .filter((p) => (contribG2 ? p.subcategory === contribG2 : true))
      .map((p) => p.nameAr);
    return out;
  }, [products, contribG1, contribG2]);
  const [activeKpi, setActiveKpi] = useState<number | null>(null);
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";
  /** Same as ChartCard `hasBarSeries` cartesian enhancement (bar charts only get this automatically). */
  const barChartSpineColor = isDark ? "#64748b" : "#94a3b8";
  const barChartSplitLineColor = isDark
    ? "rgba(148,163,184,0.22)"
    : "rgba(100,116,139,0.3)";

  /** Same grid as «صافي المبيعات حسب الفئة» + line charts (320px / 380px rows). */
  const productsStandardGrid = {
    bottom: "12%", // ✅ not %, use px
    top: "12%",
    left: "3%",
    right: "2%",
    containLabel: true,
  };

  // ── مخطط صافي المبيعات حسب الفئة ──
  const salesByCatOption = {
    tooltip: { trigger: "axis" as const },
    grid: { ...productsStandardGrid },
    xAxis: {
      type: "category" as const,
      data: categories.map((c) => c.name),
      axisLabel: {
        rotate: 28,
        fontSize: 9,
        interval: 0, // 🔥 force show all labels
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
        fontSize: 9,
      },
    },
    series: [
      {
        type: "bar",
        barMaxWidth: 44,
        data: categories.map((c, i) => ({
          value: c.netSales,
          itemStyle: {
            color: catColors[i],
            borderRadius: [6, 6, 0, 0],
          },
          label: {
            show: true,
            position: "top" as const,
            fontSize: 9,
            fontWeight: "bold",
            color: catColors[i],
            formatter: (p: { value: number }) =>
              `${(p.value / 1000).toFixed(1)}K`,
          },
        })),
      },
    ],
  };

  // ── Scatter: حجم المبيعات مقابل هامش الربح ──
  const scatterOption = {
    tooltip: {
      trigger: "item" as const,
      formatter: (p: { data: [number, number, string] }) =>
        `<b>${p.data[2]}</b><br/>الحجم: ${fmtK(p.data[0])}<br/>الهامش: ${p.data[1]}%`,
    },
    xAxis: {
      name: "حجم المبيعات",
      type: "value" as const,
      nameLocation: "middle" as const,
      nameGap: 32,
      nameTextStyle: { fontSize: 9 },
      axisLabel: { formatter: (v: number) => fmtK(v), fontSize: 9 },
      axisTick: { show: false },
      axisLine: {
        show: true,
        lineStyle: { width: 2, color: barChartSpineColor },
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed" as const,
          color: barChartSplitLineColor,
          width: 1,
        },
      },
    },
    yAxis: {
      name: "هامش الربح %",
      type: "value" as const,
      nameLocation: "middle" as const,
      nameGap: 40,
      nameTextStyle: { fontSize: 9 },
      axisLabel: { formatter: "{value}%", fontSize: 9 },
      axisTick: { show: false },
      axisLine: {
        show: true,
        lineStyle: { width: 2, color: barChartSpineColor },
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed" as const,
          color: barChartSplitLineColor,
          width: 1,
        },
      },
    },
    series: [
      {
        type: "scatter",
        symbolSize: (d: number[]) => Math.max(14, Math.sqrt(d[0] / 600)),
        data: productRowsForScatter.map((p) => [p.volume, p.margin, p.nameAr]),
        itemStyle: {
          color: (p: { dataIndex: number }) =>
            catColors[p.dataIndex % catColors.length],
          opacity: 0.85,
          borderWidth: 0,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            formatter: (p: { data: (number | string)[] }) =>
              String(p.data[2]).split(/[ ،]/)[0],
            fontSize: 9,

            position: "top" as const,
          },
        },
      },
    ],
    grid: { ...productsStandardGrid, left: "6%" },
  };

  // ── مخطط أفضل 10 (أشرطة أفقية تدرج) ──
  const months = Array.from({ length: 12 }, (_, i) => `شهر ${i + 1}`);
  const greenTones = palette.greenScale;
  const redTones = [
    "#dc2626",
    "#ef4444",
    "#f97316",
    "#d97706",
    "#b91c1c",
    "#9a3412",
    "#c2410c",
    "#ea580c",
    "#e11d48",
    "#be123c",
  ];

  const top10Option = {
    tooltip: { trigger: "axis" as const },

    legend: {
      type: "scroll" as const,
      bottom: 0,
      textStyle: {
        fontSize: 10,
        lineHeight: 14, // 👈 fixes text clipping
      },
      pageIconColor: palette.primaryGreen,
      pageIconSize: 10,
      // add space between legend and chart
      itemGap: 20,
    },
    grid: { ...productsStandardGrid },
    xAxis: {
      type: "category" as const,
      data: months,
      boundaryGap: false,
      axisLabel: {
        fontSize: 9,
        lineHeight: 12,
        formatter: (v: string) => `{m|${v}}\n{y|2026}`,
        rich: {
          m: { lineHeight: 12 },
          y: { lineHeight: 12, padding: [24, 0, 0, 0] },
        },
      },
      splitLine: { show: false },
      axisLine: {
        show: true,
        lineStyle: { width: 2, color: barChartSpineColor },
      },
      axisTick: {
        show: true,
        length: 5,
        lineStyle: { width: 1, color: barChartSpineColor },
      },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { fontSize: 9 },
      axisTick: { show: false },
      axisLine: {
        show: true,
        lineStyle: { width: 2, color: barChartSpineColor },
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed" as const,
          color: barChartSplitLineColor,
          width: 1,
        },
      },
    },
    series: top10.map((p, i) => ({
      name: p.name,
      type: "line" as const,
      data: p.trend,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: greenTones[i % greenTones.length] },
      itemStyle: { color: greenTones[i % greenTones.length] },
    })),
  };

  const bottom10Option = {
    tooltip: { trigger: "axis" as const },
    legend: {
      type: "scroll" as const,
      bottom: 0,
      textStyle: {
        fontSize: 10,
        lineHeight: 14, // 👈 fixes text clipping
      },
      pageIconSize: 10,
      itemGap: 20,
    },
    grid: { ...productsStandardGrid },
    xAxis: {
      type: "category" as const,
      data: months,
      boundaryGap: false,
      axisLabel: {
        fontSize: 9,
        lineHeight: 12,
        formatter: (v: string) => `{m|${v}}\n{y|2026}`,
        rich: {
          m: { lineHeight: 12 },
          y: { lineHeight: 12, padding: [24, 0, 0, 0] },
        },
      },
      splitLine: { show: false },
      axisLine: {
        show: true,
        lineStyle: { width: 2, color: barChartSpineColor },
      },
      axisTick: {
        show: true,
        length: 5,
        lineStyle: { width: 1, color: barChartSpineColor },
      },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { fontSize: 9 },
      axisTick: { show: false },
      axisLine: {
        show: true,
        lineStyle: { width: 2, color: barChartSpineColor },
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed" as const,
          color: barChartSplitLineColor,
          width: 1,
        },
      },
    },
    series: bottom10.map((p, i) => ({
      name: p.name,
      type: "line" as const,
      data: p.trend,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: redTones[i] },
      itemStyle: { color: redTones[i] },
    })),
  };

  // ── مساهمة الأرباح والحجم ──
  const contribOption = useMemo(
    () => ({
      tooltip: { trigger: "axis" as const },
      legend: {
        data: ["% حجم المبيعات", "% مساهمة الربح"],
        bottom: 0,
        textStyle: { fontSize: 9 },
      },
      grid: {
        left: "3%",
        right: "4%",
        top: "0%",
        bottom: "18%",
        containLabel: true,
      },
      xAxis: {
        type: "value" as const,
        axisLabel: { formatter: "{value}%", fontSize: 9 },
        axisLine: {
          show: true,
          lineStyle: { width: 2, color: barChartSpineColor },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed" as const,
            color: barChartSplitLineColor,
            width: 1,
          },
        },
      },
      yAxis: {
        type: "category" as const,
        data: contribFilteredSorted.map((p) => p.name),
        axisLabel: { fontSize: 10 },
        axisLine: {
          show: true,
          lineStyle: { width: 2, color: barChartSpineColor },
        },
        axisTick: { show: false },
        splitLine: { show: false },
      },
      series: [
        {
          name: "% حجم المبيعات",
          type: "bar" as const,
          stack: "total",
          barWidth: 12,
          barCategoryGap: "40%",
          data: contribFilteredSorted.map((p) => ({
            value: p.vol,
            itemStyle: { color: "#0891b2" },
          })),
          label: {
            show: true,
            position: "inside" as const,
            fontSize: 8,
            fontWeight: "bold",
            color: "#fff",
            formatter: (p: { value: number }) => `${p.value.toFixed(2)}%`,
          },
        },
        {
          name: "% مساهمة الربح",
          type: "bar" as const,
          stack: "total",
          barWidth: 12,
          data: contribFilteredSorted.map((p) => ({
            value: p.profit - p.vol,
            itemStyle: { color: "#047857", borderRadius: [0, 4, 4, 0] },
          })),
          label: {
            show: true,
            position: "right" as const,
            fontSize: 9,
            fontWeight: "bold",
            color: "#047857",
            formatter: (params: { dataIndex: number }) =>
              `${contribFilteredSorted[params.dataIndex].profit.toFixed(2)}%`,
          },
        },
      ],
    }),
    [barChartSpineColor, barChartSplitLineColor, contribFilteredSorted],
  );

  const contribScrollableHeightPx = useMemo(() => {
    const rowPx = 28;
    const headerPad = 140; // legend + margins
    return Math.max(480, headerPad + contribFilteredSorted.length * rowPx);
  }, [contribFilteredSorted.length]);

  // ── جدول المرتجعات (المنتجات) ──
  const returnsOption = {
    tooltip: { trigger: "axis" as const },
    xAxis: {
      type: "category" as const,
      data: products
        .slice(0, 8)
        .map((p) => p.nameAr.split(" ").slice(0, 2).join(" ")),
      axisLabel: { rotate: 30, fontSize: 9 },
      splitLine: { show: false },
    },
    yAxis: { type: "value" as const, axisLabel: { fontSize: 9 } },
    series: [
      {
        name: "المرتجعات",
        type: "bar",
        data: [320, 180, 420, 150, 95, 210, 110, 280].map((v) => ({
          value: v,
          itemStyle: { color: "#dc2626", borderRadius: [4, 4, 0, 0] },
        })),
        barWidth: 20,
      },
    ],
    grid: { bottom: "16%", top: "10%", containLabel: true },
  };

  // ── كتالوج المنتجات (هرمي) ──
  type CatalogRow = {
    name: string;
    categoryAr?: string;
    price?: number;
    netSalesValue: number;
    netSalesPct: number; // 0..100
    soldCount: number;
    marginPct?: number; // 0..100 (leaf: product margin)
    children?: CatalogRow[];
  };

  const catalogTableData: CatalogRow[] = useMemo(() => {
    const total = products.reduce((s, p) => s + Number(p.revenue ?? 0), 0);
    const toG3 = (trend: ProductData["trend"]) =>
      trend === "up" ? "مرتفع" : trend === "stable" ? "متوسط" : "منخفض";

    const g1Map = new Map<string, ProductData[]>();
    for (const p of products) {
      const g1 = String(p.categoryAr ?? "غير مصنف");
      const arr = g1Map.get(g1) ?? [];
      arr.push(p);
      g1Map.set(g1, arr);
    }

    const buildLeaf = (p: ProductData): CatalogRow => {
      const netSalesValue = Number(p.revenue ?? 0);
      const soldCount = Number(p.unitsSold ?? 0);
      const netSalesPct = total > 0 ? (netSalesValue / total) * 100 : 0;
      return {
        name: String(p.nameAr ?? p.name ?? "—"),
        categoryAr: String(p.categoryAr ?? "—"),
        price: Number(p.price ?? 0),
        netSalesValue,
        netSalesPct,
        soldCount,
        marginPct: Number(p.margin ?? 0),
      };
    };

    const buildParent = (
      name: string,
      children: CatalogRow[],
      meta?: { categoryAr?: string },
    ): CatalogRow => {
      const netSalesValue = children.reduce((s, r) => s + r.netSalesValue, 0);
      const soldCount = children.reduce((s, r) => s + r.soldCount, 0);
      const netSalesPct = total > 0 ? (netSalesValue / total) * 100 : 0;
      const marginPct =
        netSalesValue > 0
          ? children.reduce(
              (s, r) =>
                s + (r.marginPct ?? 0) * (r.netSalesValue / netSalesValue),
              0,
            )
          : 0;
      const price =
        soldCount > 0
          ? children.reduce(
              (s, r) => s + (r.price ?? 0) * (r.soldCount / soldCount),
              0,
            )
          : 0;
      return {
        name,
        categoryAr: meta?.categoryAr,
        price,
        netSalesValue,
        netSalesPct,
        soldCount,
        marginPct,
        children,
      };
    };

    const out: CatalogRow[] = [];
    for (const [g1, g1Products] of g1Map.entries()) {
      const g2Map = new Map<string, ProductData[]>();
      for (const p of g1Products) {
        const g2 = String(p.subcategory ?? "غير محدد");
        const arr = g2Map.get(g2) ?? [];
        arr.push(p);
        g2Map.set(g2, arr);
      }

      const g2Rows: CatalogRow[] = [];
      for (const [g2, g2Products] of g2Map.entries()) {
        const g3Map = new Map<string, ProductData[]>();
        for (const p of g2Products) {
          const g3 = toG3(p.trend);
          const arr = g3Map.get(g3) ?? [];
          arr.push(p);
          g3Map.set(g3, arr);
        }

        const g3Rows: CatalogRow[] = [];
        for (const [g3, g3Products] of g3Map.entries()) {
          const leaves = g3Products
            .slice()
            .sort((a, b) => Number(b.revenue ?? 0) - Number(a.revenue ?? 0))
            .map(buildLeaf);
          g3Rows.push(
            buildParent(`المجموعة الثالثة — ${g3}`, leaves, { categoryAr: g3 }),
          );
        }

        g3Rows.sort((a, b) => b.netSalesValue - a.netSalesValue);
        g2Rows.push(
          buildParent(`المجموعة الثانية — ${g2}`, g3Rows, { categoryAr: g2 }),
        );
      }

      g2Rows.sort((a, b) => b.netSalesValue - a.netSalesValue);
      out.push(
        buildParent(`المجموعة الأولى — ${g1}`, g2Rows, { categoryAr: g1 }),
      );
    }

    out.sort((a, b) => b.netSalesValue - a.netSalesValue);
    return out;
  }, [products]);

  const catalogTotals = useMemo(() => {
    const walk = (rows: CatalogRow[]) => {
      let netSalesValue = 0;
      let soldCount = 0;
      for (const r of rows) {
        netSalesValue += r.netSalesValue;
        soldCount += r.soldCount;
      }
      return { netSalesValue, soldCount };
    };
    return walk(catalogTableData);
  }, [catalogTableData]);

  const catalogMaxSoldCount = useMemo(() => {
    const all: CatalogRow[] = [];
    const walk = (r: CatalogRow) => {
      all.push(r);
      r.children?.forEach(walk);
    };
    catalogTableData.forEach(walk);
    return Math.max(1, ...all.map((r) => r.soldCount));
  }, [catalogTableData]);

  const catalogMaxMarginPct = useMemo(() => {
    const all: CatalogRow[] = [];
    const walk = (r: CatalogRow) => {
      all.push(r);
      r.children?.forEach(walk);
    };
    catalogTableData.forEach(walk);
    return Math.max(1, ...all.map((r) => r.marginPct ?? 0));
  }, [catalogTableData]);

  const [catalogExpanded, setCatalogExpanded] = useState<
    Record<string, boolean>
  >({});

  const toggleCatalogRow = (rowKey: string) => {
    setCatalogExpanded((prev) => ({
      ...prev,
      [rowKey]: !(prev[rowKey] === true),
    }));
  };

  const fmtPct = (v: number) => `${v.toFixed(2)}%`;
  const fmtInt = (v: number) => Math.round(v).toLocaleString("en-US");
  const fmtCurrency = (v: number) => `${Number(v).toLocaleString("en-US")} د.أ`;

  const renderCatalogRow = (
    row: CatalogRow,
    level: number,
    parentKey: string,
    idx: number,
  ) => {
    const key = `${parentKey}-${idx}`;
    const hasChildren = !!row.children?.length;
    const isOpen = catalogExpanded[key] === true;
    const indent = level * 24;

    // Match DrillDownTable (/sales) colors/backgrounds
    const levelColors = [
      "var(--text-secondary)", // المجموعة الأولى
      "var(--accent-green)", // المجموعة الثانية
      "var(--accent-blue)", // المجموعة الثالثة
      "var(--text-secondary)", // المواد
    ];
    const chevronIconOpen = [
      "var(--accent-green)",
      "var(--accent-cyan)",
      "var(--accent-blue)",
    ];
    const colorIdx = Math.min(level, levelColors.length - 1);
    const chevronIdx = Math.min(level, chevronIconOpen.length - 1);

    const rowBgByLevel = [
      // المجموعة الأولى
      isOpen ? "rgba(4,120,87,0.04)" : "rgba(4,120,87,0.02)",
      // المجموعة الثانية
      isOpen ? "rgba(8,145,178,0.04)" : "rgba(8,145,178,0.02)",
      // المجموعة الثالثة
      "rgba(8,145,178,0.02)",
      // المواد
      "transparent",
    ];

    const rows: React.ReactNode[] = [];
    rows.push(
      <tr
        key={key}
        className={
          hasChildren
            ? "cursor-pointer hover:bg-white/1.5 transition-colors"
            : undefined
        }
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: rowBgByLevel[Math.min(level, rowBgByLevel.length - 1)],
        }}
        onClick={() => hasChildren && toggleCatalogRow(key)}
      >
        <td
          style={{
            ...analyticsTdBaseStyle("right"),
            paddingRight: `${indent + 12}px`,
          }}
        >
          <div className="flex items-center gap-1.5">
            {hasChildren ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "16px",
                  height: "16px",
                  borderRadius: "4px",
                  background: isOpen
                    ? "rgba(0,229,160,0.11)"
                    : "var(--bg-elevated)",
                  transition: "all 0.2s",
                }}
              >
                {isOpen ? (
                  <ChevronDown
                    size={11}
                    style={{ color: chevronIconOpen[chevronIdx] }}
                  />
                ) : (
                  <ChevronLeft
                    size={11}
                    style={{ color: "var(--text-muted)" }}
                  />
                )}
              </span>
            ) : (
              <span style={{ width: "16px", display: "inline-block" }} />
            )}
            <span
              className="text-xs font-medium"
              style={{ color: levelColors[colorIdx] }}
            >
              {row.name}
            </span>
          </div>
        </td>

        <td style={analyticsTdBaseStyle("center")}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            {row.categoryAr ?? "—"}
          </span>
        </td>
        <td style={analyticsTdBaseStyle("center")}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
            dir="ltr"
          >
            {fmtCurrency(row.price ?? 0)}
          </span>
        </td>
        <AnalyticsBarCell
          value={row.netSalesPct}
          max={100}
          color="#3b82f6"
          text={fmtPct(row.netSalesPct)}
        />
        <AnalyticsBarCell
          value={row.soldCount}
          max={catalogMaxSoldCount}
          color="#22c55e"
          text={fmtInt(row.soldCount)}
        />
        <AnalyticsBarCell
          value={row.marginPct ?? 0}
          max={catalogMaxMarginPct}
          color="#a855f7"
          text={fmtPct(row.marginPct ?? 0)}
        />
      </tr>,
    );

    if (hasChildren && isOpen) {
      row.children!.forEach((child, ci) => {
        rows.push(...renderCatalogRow(child, level + 1, key, ci));
      });
    }

    return rows;
  };

  const kpis = [
    {
      icon: DollarSign,
      label: "صافي المبيعات",
      sub: "Net Sales",
      value: fmtK(totalNetSales),
      color: "var(--accent-green)",
      dim: "rgba(4,120,87,0.1)",
    },
    {
      icon: TrendingUp,
      label: "قيمة الربح",
      sub: "Profit Value",
      value: fmtK(totalProfitValue),
      color: "var(--accent-cyan)",
      dim: "rgba(8,145,178,0.1)",
    },
    {
      icon: BarChart3,
      label: "قيمة التكلفة",
      sub: "Cost Value",
      value: fmtK(totalCostValue),
      color: "var(--accent-blue)",
      dim: "rgba(37,99,235,0.1)",
    },
    {
      icon: ShoppingCart,
      label: "متوسط قيمة المعاملة",
      sub: "Avg. Transaction Value (ATV)",
      value: "36.76",
      color: "var(--accent-amber)",
      dim: "rgba(217,119,6,0.1)",
    },
    {
      icon: Package,
      label: "متوسط حجم السلة",
      sub: "Average Basket Size",
      value: "27",
      color: "var(--accent-purple)",
      dim: "rgba(124,58,237,0.1)",
    },
    {
      icon: Layers,
      label: "حجم مبيعات المنتجات",
      sub: "Product Sales Volume",
      value: fmtK(totalVolume),
      color: "var(--accent-cyan)",
      dim: "rgba(8,145,178,0.1)",
    },
    {
      icon: Percent,
      label: "هامش الربح %",
      sub: "% Profit Margin",
      value: "36.51%",
      color: "var(--accent-green)",
      dim: "rgba(4,120,87,0.1)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <Package size={22} style={{ color: "var(--accent-green)" }} />
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            أداء المنتجات
          </h1>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--accent-green)" }}
            />
            <span
              className="text-[10px]"
              style={{ color: "var(--accent-green)" }}
            >
              التقرير السادس
            </span>
          </div>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          تحليل شامل: مبيعات الفئات، هوامش الربح، أفضل/أدنى المنتجات، وشبكة
          الارتباط
        </p>
      </motion.div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setActiveKpi(activeKpi === i ? null : i)}
            className="glass-panel p-4 relative overflow-hidden cursor-pointer transition-all"
            style={{
              borderColor:
                activeKpi === i ? k.color + "55" : "var(--border-subtle)",
              boxShadow: activeKpi === i ? `0 0 18px ${k.color}22` : undefined,
            }}
          >
            <div
              className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl"
              style={{ background: k.color, opacity: 0.12 }}
            />
            <div className="relative">
              <div
                className="p-1.5 rounded-lg w-fit mb-2"
                style={{ background: k.dim }}
              >
                <k.icon size={12} style={{ color: k.color }} />
              </div>
              <p
                className="text-[15px] font-bold"
                style={{ color: k.color }}
                dir="ltr"
              >
                {k.value}
              </p>
              <p
                className="text-[9px] font-semibold mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {k.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── صافي المبيعات حسب الفئة + Scatter ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="صافي المبيعات حسب الفئة"
          titleFlag="green"
          subtitle={`Net Sales by Category • الفروع: ${branchNamesForLegend}`}
          option={salesByCatOption}
          height="320px"
          delay={1}
        />
        <ChartCard
          title="حجم المبيعات مقابل هامش الربح"
          titleFlag="green"
          subtitle="Product Volume & % Profit Margin by Category"
          option={scatterOption}
          headerExtra={
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>
                  الفلاتر:
                </span>

                <InlineDropdown
                  icon={Layers}
                  label="المجموعة الأولى"
                  value={selectedG1 ?? "all"}
                  options={g1Options}
                  onChange={(v) => {
                    const next = v === "all" ? null : v;
                    setSelectedG1(next);
                    setSelectedProduct(null);
                    setSelectedG3([]);
                  }}
                  accent="var(--accent-amber)"
                />

                <InlineDropdown
                  icon={Layers}
                  label="المجموعة الثانية"
                  value={selectedG2 ?? "all"}
                  options={g2Options}
                  onChange={(v) => {
                    const next = v === "all" ? null : v;
                    setSelectedG2(next);
                    setSelectedProduct(null);
                    setSelectedG3([]);
                  }}
                  accent="#f59e0b"
                />

                <InlineSearchDropdown
                  icon={Package}
                  label="المنتجات"
                  value={selectedProduct ?? ""}
                  options={products.map((p) => p.nameAr)}
                  onChange={(v) => {
                    setSelectedProduct(v || null);
                    setSelectedG3([]);
                  }}
                  accent="#00d4ff"
                />
              </div>

              {selectedProduct && (
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <InlineMultiSelectDropdown
                    icon={Layers}
                    label="المجموعة الثالثة"
                    selectedValues={selectedG3}
                    options={productGroup3MultiOptions}
                    onChange={setSelectedG3}
                    accent="#ea580c"
                    manyLabel={(n) => `${n} اختيارات`}
                  />
                </div>
              )}
            </div>
          }
          className=""
          height="320px"
          delay={2}
        />
      </div>

      {/* ── أفضل 10 + أدنى 10 — حسب الشهر ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="أفضل 10 منتجات من حيث الربح"
          titleFlag="green"
          subtitle="Top 10 Products — Monthly Profit Trend"
          option={top10Option}
          height="380px"
          delay={1}
        />
        <ChartCard
          title="أدنى 10 منتجات من حيث الربح"
          titleFlag="green"
          subtitle="Bottom 10 Products — Monthly Profit Trend"
          option={bottom10Option}
          height="380px"
          delay={2}
        />
      </div>

      {/* ── مساهمة الأرباح + المرتجعات ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="حجم المبيعات و الأرباح حسب المنتج"
          titleFlag="green"
          subtitle="Sales Volume Contribution & Profit Contribution by Product %"
          option={contribOption}
          plotOverflowY="auto"
          innerChartHeight={`${contribScrollableHeightPx}px`}
          headerExtra={
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>
                  الفلاتر:
                </span>

                <InlineDropdown
                  icon={Layers}
                  label="المجموعة الأولى"
                  value={contribG1 ?? "all"}
                  options={g1Options}
                  onChange={(v) => {
                    setContribG1(v === "all" ? null : v);
                    setContribProduct(null);
                  }}
                  accent="var(--accent-amber)"
                />

                <InlineDropdown
                  icon={Layers}
                  label="المجموعة الثانية"
                  value={contribG2 ?? "all"}
                  options={g2Options}
                  onChange={(v) => {
                    setContribG2(v === "all" ? null : v);
                    setContribProduct(null);
                  }}
                  accent="#f59e0b"
                />

                <InlineSearchDropdown
                  icon={Package}
                  label="المنتجات"
                  value={contribProduct ?? ""}
                  options={contribProductOptions}
                  onChange={(v) => setContribProduct(v || null)}
                  accent="#00d4ff"
                />
              </div>
            </div>
          }
          className=""
          height="480px"
          delay={1}
        />
        <ChartCard
          title="المرتجعات حسب المنتج"
          titleFlag="green"
          subtitle="عدد المرتجعات مع نسبة الإرجاع"
          option={returnsOption}
          height="480px"
          delay={2}
        />
      </div>

      {/* ── كتالوج المنتجات ── */}
      <AnalyticsTableCard
        title="كتالوج المنتجات"
        flag="green"
        subtitles={
          <>
            <p
              className="text-[11px] mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              الهرم: المجموعة الأولى — المجموعة الثانية — المجموعة الثالثة —
              المواد
            </p>
            <p
              className="text-[11px] mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              صافي المبيعات هنا كنسبة من إجمالي صافي المبيعات • اضغط على أي صف
              للتوسّع
            </p>
          </>
        }
      >
        <AnalyticsTable
          minWidth="980px"
          headers={[
            { label: "المنتج", align: "right", width: "360px" },
            { label: "الفئة", align: "center", width: "160px" },
            { label: "السعر", align: "center", width: "140px" },
            { label: "صافي المبيعات", align: "center", width: "160px" },
            { label: "عدد المواد المباعة", align: "center", width: "160px" },
            { label: "الهامش", align: "center", width: "140px" },
          ]}
        >
          {catalogTableData.flatMap((r, i) => renderCatalogRow(r, 0, "cat", i))}

          {/* Total row */}
          <tr
            style={{
              background: "var(--accent-green-dim)",
              borderTop: "2px solid rgba(0,229,160,0.3)",
            }}
          >
            <td style={analyticsTdBaseStyle("right")}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--accent-green)",
                }}
              >
                الإجمالي — Total
              </span>
            </td>
            <td style={analyticsTdBaseStyle("center")}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
              >
                —
              </span>
            </td>
            <td style={analyticsTdBaseStyle("center")}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
                dir="ltr"
              >
                —
              </span>
            </td>
            <td style={analyticsTdBaseStyle("center")}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
                dir="ltr"
              >
                {fmtPct(100)}
              </span>
            </td>
            <td style={analyticsTdBaseStyle("center")}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
                dir="ltr"
              >
                {fmtInt(catalogTotals.soldCount)}
              </span>
            </td>
            <td style={analyticsTdBaseStyle("center")}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
                dir="ltr"
              >
                —
              </span>
            </td>
          </tr>
        </AnalyticsTable>
      </AnalyticsTableCard>
    </div>
  );
}
