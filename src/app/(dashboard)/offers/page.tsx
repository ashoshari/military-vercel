"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-scatter";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Percent,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Tag,
  BarChart3,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useThemeStore } from "@/store/themeStore";
import SectionTitleWithFlag from "@/components/ui/SectionTitleWithFlag";
import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";

function useClickOutside(
  ref: React.RefObject<HTMLDivElement | null>,
  cb: () => void,
) {
  React.useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

function InlineSearchDropdown({
  label,
  value,
  options,
  onChange,
  accent = "var(--accent-cyan)",
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = React.useRef<HTMLDivElement>(null);
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
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
        style={{
          background: isSet
            ? `color-mix(in srgb, ${accent} 15%, transparent)`
            : "var(--bg-elevated)",
          color: isSet ? accent : "var(--text-muted)",
          border: `1px solid ${isSet ? accent : "var(--border-subtle)"}`,
          whiteSpace: "nowrap",
          maxWidth: 180,
        }}
      >
        <Search size={11} style={{ color: accent, flexShrink: 0 }} />
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
              left: 0,
              zIndex: 1050,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              boxShadow: "0 8px 30px rgba(0,0,0,.45)",
              width: 240,
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
            <div style={{ maxHeight: 260, overflowY: "auto" }}>
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
                  ✕ كل الأصناف
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

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── بيانات الفئات ──
const categories = [
  {
    name: "أجهزة والكترونيات",
    withMargin: 72.73,
    withSales: 0.09,
    noMargin: 57.21,
    noSales: 0.09,
    products: [
      {
        name: 'شاشة سامسونج 32"',
        withMargin: 75.1,
        withSales: 0.04,
        noMargin: 58.2,
        noSales: 0.04,
      },
      {
        name: "مكيف سبليت 1.5طن",
        withMargin: 69.5,
        withSales: 0.03,
        noMargin: 55.8,
        noSales: 0.03,
      },
      {
        name: "طباعة ليزر HP",
        withMargin: 73.8,
        withSales: 0.02,
        noMargin: 57.6,
        noSales: 0.02,
      },
    ],
  },
  {
    name: "العناية الشخصية",
    withMargin: 26.19,
    withSales: 1.06,
    noMargin: 22.11,
    noSales: 0.59,
    products: [
      {
        name: "شامبو هيد آند شولدرز",
        withMargin: 28.4,
        withSales: 0.35,
        noMargin: 23.1,
        noSales: 0.2,
      },
      {
        name: "كريم نيفيا للجسم",
        withMargin: 24.8,
        withSales: 0.42,
        noMargin: 21.3,
        noSales: 0.22,
      },
      {
        name: "معجون أسنان كولجيت",
        withMargin: 25.3,
        withSales: 0.29,
        noMargin: 21.9,
        noSales: 0.17,
      },
    ],
  },
  {
    name: "غير مصنف",
    withMargin: 30.25,
    withSales: 0.25,
    noMargin: 13.11,
    noSales: 0.16,
    products: [
      {
        name: "منتج متنوع أ",
        withMargin: 32.1,
        withSales: 0.12,
        noMargin: 14.2,
        noSales: 0.08,
      },
      {
        name: "منتج متنوع ب",
        withMargin: 28.4,
        withSales: 0.13,
        noMargin: 12.0,
        noSales: 0.08,
      },
    ],
  },
  {
    name: "فرفاشية",
    withMargin: 72.4,
    withSales: 1.42,
    noMargin: 44.64,
    noSales: 2.17,
    products: [
      {
        name: "مثلجات كيه دي دي",
        withMargin: 74.2,
        withSales: 0.55,
        noMargin: 45.8,
        noSales: 0.88,
      },
      {
        name: "حلوى شوكولاته مكس",
        withMargin: 70.8,
        withSales: 0.52,
        noMargin: 43.4,
        noSales: 0.82,
      },
      {
        name: "سناكس متنوعة",
        withMargin: 72.2,
        withSales: 0.35,
        noMargin: 44.7,
        noSales: 0.47,
      },
    ],
  },
  {
    name: "مستلزمات الأطفال",
    withMargin: 22.63,
    withSales: 0.05,
    noMargin: 13.52,
    noSales: 0.17,
    products: [
      {
        name: "حفاضات بامبرز",
        withMargin: 23.8,
        withSales: 0.02,
        noMargin: 14.1,
        noSales: 0.07,
      },
      {
        name: "مناشف رطبة للأطفال",
        withMargin: 21.4,
        withSales: 0.03,
        noMargin: 12.9,
        noSales: 0.1,
      },
    ],
  },
  {
    name: "مستلزمات منزلية",
    withMargin: 38.03,
    withSales: 0.52,
    noMargin: 24.17,
    noSales: 0.08,
    products: [
      {
        name: "منظف أريال مسحوق",
        withMargin: 39.2,
        withSales: 0.2,
        noMargin: 25.4,
        noSales: 0.03,
      },
      {
        name: "صابون صحون فيري",
        withMargin: 37.5,
        withSales: 0.18,
        noMargin: 23.8,
        noSales: 0.03,
      },
      {
        name: "ليف مطبخ",
        withMargin: 37.4,
        withSales: 0.14,
        noMargin: 23.3,
        noSales: 0.02,
      },
    ],
  },
  {
    name: "منتجات ورقية",
    withMargin: 44.55,
    withSales: 0.4,
    noMargin: 41.39,
    noSales: 0.39,
    products: [
      {
        name: "مناديل كلينكس",
        withMargin: 46.2,
        withSales: 0.18,
        noMargin: 43.1,
        noSales: 0.18,
      },
      {
        name: "ورق طباعة A4",
        withMargin: 42.8,
        withSales: 0.14,
        noMargin: 39.6,
        noSales: 0.13,
      },
      {
        name: "أكياس قمامة",
        withMargin: 44.6,
        withSales: 0.08,
        noMargin: 41.5,
        noSales: 0.08,
      },
    ],
  },
  {
    name: "مسطحات",
    withMargin: 33.22,
    withSales: 0.08,
    noMargin: 47.55,
    noSales: 0.23,
    products: [
      {
        name: "عصير برتقال طبيعي",
        withMargin: 34.1,
        withSales: 0.04,
        noMargin: 48.2,
        noSales: 0.12,
      },
      {
        name: "مياه معدنية 1.5L",
        withMargin: 32.3,
        withSales: 0.04,
        noMargin: 46.9,
        noSales: 0.11,
      },
    ],
  },
  {
    name: "غير مصنف 2",
    withMargin: 38.41,
    withSales: 0.88,
    noMargin: 21.4,
    noSales: 0.21,
    products: [
      {
        name: "منتج متنوع أ",
        withMargin: 39.5,
        withSales: 0.45,
        noMargin: 22.3,
        noSales: 0.11,
      },
      {
        name: "منتج متنوع ب",
        withMargin: 37.3,
        withSales: 0.43,
        noMargin: 20.5,
        noSales: 0.1,
      },
    ],
  },
  {
    name: "منتجات غذائية",
    withMargin: 27.75,
    withSales: 7.69,
    noMargin: 21.4,
    noSales: 0.21,
    products: [
      {
        name: "أرز عنبر 5كجم",
        withMargin: 29.4,
        withSales: 2.1,
        noMargin: 22.8,
        noSales: 0.06,
      },
      {
        name: "زيت نباتي 1.8L",
        withMargin: 26.8,
        withSales: 1.95,
        noMargin: 20.6,
        noSales: 0.05,
      },
      {
        name: "سكر أبيض 2كجم",
        withMargin: 27.1,
        withSales: 1.8,
        noMargin: 21.1,
        noSales: 0.04,
      },
      {
        name: "شاي ليبتون 100كيس",
        withMargin: 28.2,
        withSales: 1.84,
        noMargin: 21.1,
        noSales: 0.06,
      },
    ],
  },
  {
    name: "مستلزمات الأعمال",
    withMargin: 38.51,
    withSales: 0.15,
    noMargin: 21.4,
    noSales: 0.21,
    products: [
      {
        name: "ورق طباعة مكتبي",
        withMargin: 40.2,
        withSales: 0.08,
        noMargin: 22.5,
        noSales: 0.11,
      },
      {
        name: "أقلام حبر جاف",
        withMargin: 36.8,
        withSales: 0.07,
        noMargin: 20.3,
        noSales: 0.1,
      },
    ],
  },
  {
    name: "مسطحات غذائية",
    withMargin: 38.43,
    withSales: 3.24,
    noMargin: 21.4,
    noSales: 0.21,
    products: [
      {
        name: "عصير مانجو 1L",
        withMargin: 39.1,
        withSales: 1.2,
        noMargin: 22.1,
        noSales: 0.08,
      },
      {
        name: "مشروب ليمون 500مل",
        withMargin: 37.8,
        withSales: 1.04,
        noMargin: 20.8,
        noSales: 0.07,
      },
      {
        name: "ماء كوكاكولا 600مل",
        withMargin: 38.4,
        withSales: 1.0,
        noMargin: 21.3,
        noSales: 0.06,
      },
    ],
  },
];

const discountRanges = [
  {
    range: "0%",
    netSales: 352410,
    profitValue: 155520,
    totalDiscount: 0,
    avgRate: 0.0,
  },
  {
    range: "1-2%",
    netSales: 4830,
    profitValue: 1240,
    totalDiscount: 2146.83,
    avgRate: 1.01,
  },
  {
    range: "2-5%",
    netSales: 12147,
    profitValue: 3210,
    totalDiscount: 41022.07,
    avgRate: 3.06,
  },
  {
    range: "5-10%",
    netSales: 38321,
    profitValue: 9870,
    totalDiscount: 43122.97,
    avgRate: 6.15,
  },
  {
    range: "11-25%",
    netSales: 80000,
    profitValue: 22100,
    totalDiscount: 82855.13,
    avgRate: 14.68,
  },
];

type BranchBaseRow = {
  name: string;
  invoices: number;
  discInv: number;
  discRate: number;
  noDiscInv: number;
  avgDisc: number;
  discSales: number;
  discVol: number;
  netSales: number;
  appDisc: number;
  utilRate: number;
  avgDiscRate: number;
};
type BranchProductRow = BranchBaseRow;
type BranchSubRow = BranchBaseRow & { products: BranchProductRow[] };
type BranchRow = BranchBaseRow & { subs?: BranchSubRow[] };

const branches: BranchRow[] = [
  {
    name: "عمّان",
    invoices: 79.0,
    discInv: 38,
    discRate: 68.0,
    noDiscInv: 40,
    avgDisc: 0,
    discSales: 0,
    discVol: 43,
    netSales: 0,
    appDisc: 0.3,
    utilRate: 0.0,
    avgDiscRate: 0.0,
    subs: [
      {
        name: "منتجات غذائية",
        invoices: 42,
        discInv: 22,
        discRate: 52.38,
        noDiscInv: 20,
        avgDisc: 0.15,
        discSales: 0,
        discVol: 24,
        netSales: 0,
        appDisc: 0.15,
        utilRate: 0.0,
        avgDiscRate: 0.0,
        products: [
          {
            name: "أرز عنبر 5كجم",
            invoices: 18,
            discInv: 10,
            discRate: 55.56,
            noDiscInv: 8,
            avgDisc: 0.1,
            discSales: 0,
            discVol: 12,
            netSales: 0,
            appDisc: 0.1,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
          {
            name: "زيت نباتي 1.8L",
            invoices: 14,
            discInv: 7,
            discRate: 50.0,
            noDiscInv: 7,
            avgDisc: 0.05,
            discSales: 0,
            discVol: 7,
            netSales: 0,
            appDisc: 0.05,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
          {
            name: "سكر أبيض 2كجم",
            invoices: 10,
            discInv: 5,
            discRate: 50.0,
            noDiscInv: 5,
            avgDisc: 0.0,
            discSales: 0,
            discVol: 5,
            netSales: 0,
            appDisc: 0.0,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
        ],
      },
      {
        name: "مستلزمات منزلية",
        invoices: 22,
        discInv: 10,
        discRate: 45.45,
        noDiscInv: 12,
        avgDisc: 0.1,
        discSales: 0,
        discVol: 12,
        netSales: 0,
        appDisc: 0.1,
        utilRate: 0.0,
        avgDiscRate: 0.0,
        products: [
          {
            name: "منظف أريال مسحوق",
            invoices: 12,
            discInv: 6,
            discRate: 50.0,
            noDiscInv: 6,
            avgDisc: 0.05,
            discSales: 0,
            discVol: 7,
            netSales: 0,
            appDisc: 0.05,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
          {
            name: "صابون صحون فيري",
            invoices: 10,
            discInv: 4,
            discRate: 40.0,
            noDiscInv: 6,
            avgDisc: 0.05,
            discSales: 0,
            discVol: 5,
            netSales: 0,
            appDisc: 0.05,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
        ],
      },
      {
        name: "العناية الشخصية",
        invoices: 15,
        discInv: 6,
        discRate: 40.0,
        noDiscInv: 9,
        avgDisc: 0.05,
        discSales: 0,
        discVol: 7,
        netSales: 0,
        appDisc: 0.05,
        utilRate: 0.0,
        avgDiscRate: 0.0,
        products: [
          {
            name: "شامبو هيد آند شولدرز",
            invoices: 8,
            discInv: 3,
            discRate: 37.5,
            noDiscInv: 5,
            avgDisc: 0.03,
            discSales: 0,
            discVol: 4,
            netSales: 0,
            appDisc: 0.03,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
          {
            name: "كريم نيفيا للجسم",
            invoices: 7,
            discInv: 3,
            discRate: 42.86,
            noDiscInv: 4,
            avgDisc: 0.02,
            discSales: 0,
            discVol: 3,
            netSales: 0,
            appDisc: 0.02,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
        ],
      },
    ],
  },
  {
    name: "الكرك",
    invoices: 1.0,
    discInv: 1,
    discRate: 90.0,
    noDiscInv: 0,
    avgDisc: 1.9,
    discSales: 1,
    discVol: 1,
    netSales: 1,
    appDisc: 1.9,
    utilRate: 4.0,
    avgDiscRate: 4.4,
    subs: [
      {
        name: "منتجات غذائية",
        invoices: 1,
        discInv: 1,
        discRate: 100.0,
        noDiscInv: 0,
        avgDisc: 1.9,
        discSales: 1,
        discVol: 1,
        netSales: 1,
        appDisc: 1.9,
        utilRate: 4.0,
        avgDiscRate: 4.4,
        products: [
          {
            name: "أرز عنبر 5كجم",
            invoices: 1,
            discInv: 1,
            discRate: 100.0,
            noDiscInv: 0,
            avgDisc: 1.9,
            discSales: 1,
            discVol: 1,
            netSales: 1,
            appDisc: 1.9,
            utilRate: 4.0,
            avgDiscRate: 4.4,
          },
        ],
      },
    ],
  },
  {
    name: "المفرق",
    invoices: 1.0,
    discInv: 1,
    discRate: 80.0,
    noDiscInv: 0,
    avgDisc: 1.3,
    discSales: 0,
    discVol: 1,
    netSales: 0,
    appDisc: 1.3,
    utilRate: 3.0,
    avgDiscRate: 3.0,
    subs: [
      {
        name: "فرفاشية",
        invoices: 1,
        discInv: 1,
        discRate: 80.0,
        noDiscInv: 0,
        avgDisc: 1.3,
        discSales: 0,
        discVol: 1,
        netSales: 0,
        appDisc: 1.3,
        utilRate: 3.0,
        avgDiscRate: 3.0,
        products: [
          {
            name: "حلوى شوكولاته مكس",
            invoices: 1,
            discInv: 1,
            discRate: 80.0,
            noDiscInv: 0,
            avgDisc: 1.3,
            discSales: 0,
            discVol: 1,
            netSales: 0,
            appDisc: 1.3,
            utilRate: 3.0,
            avgDiscRate: 3.0,
          },
        ],
      },
    ],
  },
  {
    name: "اربد",
    invoices: 4.0,
    discInv: 1,
    discRate: 60.0,
    noDiscInv: 3,
    avgDisc: 0.5,
    discSales: 0,
    discVol: 1,
    netSales: 0,
    appDisc: 0.5,
    utilRate: 4.0,
    avgDiscRate: 0.46,
    subs: [
      {
        name: "مسطحات غذائية",
        invoices: 2,
        discInv: 1,
        discRate: 50.0,
        noDiscInv: 1,
        avgDisc: 0.3,
        discSales: 0,
        discVol: 1,
        netSales: 0,
        appDisc: 0.3,
        utilRate: 2.0,
        avgDiscRate: 0.3,
        products: [
          {
            name: "عصير مانجو 1L",
            invoices: 2,
            discInv: 1,
            discRate: 50.0,
            noDiscInv: 1,
            avgDisc: 0.3,
            discSales: 0,
            discVol: 1,
            netSales: 0,
            appDisc: 0.3,
            utilRate: 2.0,
            avgDiscRate: 0.3,
          },
        ],
      },
      {
        name: "منتجات غذائية",
        invoices: 2,
        discInv: 0,
        discRate: 0.0,
        noDiscInv: 2,
        avgDisc: 0.2,
        discSales: 0,
        discVol: 0,
        netSales: 0,
        appDisc: 0.2,
        utilRate: 2.0,
        avgDiscRate: 0.16,
        products: [
          {
            name: "شاي ليبتون 100كيس",
            invoices: 2,
            discInv: 0,
            discRate: 0.0,
            noDiscInv: 2,
            avgDisc: 0.2,
            discSales: 0,
            discVol: 0,
            netSales: 0,
            appDisc: 0.2,
            utilRate: 2.0,
            avgDiscRate: 0.16,
          },
        ],
      },
    ],
  },
  {
    name: "الزرقاء",
    invoices: 9.0,
    discInv: 2,
    discRate: 50.0,
    noDiscInv: 7,
    avgDisc: 0.8,
    discSales: 1,
    discVol: 2,
    netSales: 1,
    appDisc: 0.8,
    utilRate: 0.0,
    avgDiscRate: 0.0,
    subs: [
      {
        name: "العناية الشخصية",
        invoices: 5,
        discInv: 1,
        discRate: 20.0,
        noDiscInv: 4,
        avgDisc: 0.4,
        discSales: 0,
        discVol: 1,
        netSales: 0,
        appDisc: 0.4,
        utilRate: 0.0,
        avgDiscRate: 0.0,
        products: [
          {
            name: "معجون أسنان كولجيت",
            invoices: 5,
            discInv: 1,
            discRate: 20.0,
            noDiscInv: 4,
            avgDisc: 0.4,
            discSales: 0,
            discVol: 1,
            netSales: 0,
            appDisc: 0.4,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
        ],
      },
      {
        name: "مستلزمات الأطفال",
        invoices: 4,
        discInv: 1,
        discRate: 25.0,
        noDiscInv: 3,
        avgDisc: 0.4,
        discSales: 1,
        discVol: 1,
        netSales: 1,
        appDisc: 0.4,
        utilRate: 0.0,
        avgDiscRate: 0.0,
        products: [
          {
            name: "حفاضات بامبرز",
            invoices: 4,
            discInv: 1,
            discRate: 25.0,
            noDiscInv: 3,
            avgDisc: 0.4,
            discSales: 1,
            discVol: 1,
            netSales: 1,
            appDisc: 0.4,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
        ],
      },
    ],
  },
  {
    name: "الإجمالي",
    invoices: 79.0,
    discInv: 38,
    discRate: 68.0,
    noDiscInv: 40,
    avgDisc: 0.94,
    discSales: 2,
    discVol: 43,
    netSales: 2,
    appDisc: 4.8,
    utilRate: 4.0,
    avgDiscRate: 4.45,
  },
];

const fmt2 = (n: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
const fmtK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(2)}K` : fmt2(n));

export default function OffersPage() {
  const palette = useResolvedAnalyticsPalette();
  const isDark = useThemeStore((s) => s.mode === "dark");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [discountPeriod, setDiscountPeriod] = useState<
    "شهري" | "ربعي" | "سنوي"
  >("شهري");

  // ── /time-compare (ported): month vs month (left/right) ──
  const monthOptions = Array.from({ length: 12 }, (_, i) => `شهر ${i + 1}`);
  const [tcLeftMonth, setTcLeftMonth] = useState<string>(monthOptions[0] ?? "");
  const [tcRightMonth, setTcRightMonth] = useState<string>(
    monthOptions[1] ?? monthOptions[0] ?? "",
  );

  // ── هامش الربح حسب الفئة و نوع الخصم: مستوى الفئات ──
  const [profitCatLevel, setProfitCatLevel] = useState<
    "level1" | "level2" | "level3"
  >("level1");
  /** Optional single pick to avoid huge lists (can be 100+). Empty = all. */
  const [profitCatPick, setProfitCatPick] = useState<string>("");

  const profitCatLevelOptions = [
    { value: "level1", label: "الفئة الأولى" },
    { value: "level2", label: "الفئة الثانية" },
    { value: "level3", label: "الفئة الثالثة" },
  ] as const;

  const toggleCat = (name: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // ── هامش الربح حسب الفئة و نوع الخصم ──
  const discountTypes = [
    "رفقاء السلاح - 10%",
    "خصم التربية و التعليم 7%",
    "خصم الضمان الاجتماعي 5%",
    "خصم البريد الاردني 2%",
  ] as const;
  /**
   * Static but realistic-looking distributions (each row totals 100%).
   * Represents how margin share is distributed across discount types per category.
   */
  // deterministic helper for synthetic distributions (sum to 100)
  const stableHash = (s: string) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  const dist100 = (key: string): [number, number, number, number] => {
    const h = stableHash(key);
    const a = 10 + (h % 55);
    const b = 8 + ((h >>> 8) % 35);
    const c = 6 + ((h >>> 16) % 25);
    const sum = a + b + c;
    const d = Math.max(0, 100 - sum);
    // if d got too big/small, normalize lightly
    const raw: number[] = [a, b, c, d];
    const total = raw.reduce((s, n) => s + n, 0) || 1;
    const norm = raw.map((n) => Math.round((n / total) * 100));
    // fix rounding drift
    const drift = 100 - norm.reduce((s, n) => s + n, 0);
    norm[0] += drift;
    return norm as [number, number, number, number];
  };

  const tcBranches = branches
    .filter((b) => b.name !== "الإجمالي")
    .map((b) => b.name);

  const monthIdx = (label: string) =>
    Math.max(
      0,
      monthOptions.indexOf(label) === -1 ? 0 : monthOptions.indexOf(label),
    );

  const noDiscNetSalesFor = (branchName: string, m: string) => {
    const mi = monthIdx(m);
    const base = 22000 + (stableHash(`nd_net_${branchName}_${mi}`) % 140000);
    // "بدون خصم" tends to be lower than total; keep stable but seasonal-ish
    const season = 0.78 + (mi % 6) * 0.035;
    return Math.round(base * season);
  };
  const noDiscProfitFor = (branchName: string, m: string) => {
    const net = noDiscNetSalesFor(branchName, m);
    const mi = monthIdx(m);
    const margin =
      0.11 + (stableHash(`nd_margin_${branchName}_${mi}`) % 90) / 1000;
    return Math.round(net * margin);
  };
  const offerDiscountFor = (branchName: string, m: string) => {
    const mi = monthIdx(m);
    const net = noDiscNetSalesFor(branchName, m);
    const rate =
      0.015 + (stableHash(`off_rate_${branchName}_${mi}`) % 28) / 1000;
    return Math.round(net * rate);
  };

  const noDiscNetSalesByBranchOption = {
    tooltip: { trigger: "axis" as const },
    legend: {
      data: [tcLeftMonth, tcRightMonth, "الخصم الخاص بالعروض"],
      bottom: 0,
      type: "scroll" as const,
      left: "center" as const,
      textStyle: { fontSize: 9, color: "var(--text-muted)" },
    },
    grid: { left: "8%", right: "4%", top: "12%", bottom: "18%" },
    xAxis: {
      type: "category" as const,
      data: tcBranches,
      axisLabel: { fontSize: 9, color: "#94a3b8" },
      axisLine: { lineStyle: { color: palette.primarySlate } },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
        fontSize: 9,
        color: "#64748b",
      },
      splitLine: { lineStyle: { color: "#1e293b" } },
    },
    series: [
      {
        name: tcLeftMonth,
        type: "bar" as const,
        barWidth: 28,
        itemStyle: {
          color: "#047857",
          borderRadius: [4, 4, 0, 0],
        },
        data: tcBranches.map((br) => noDiscNetSalesFor(br, tcLeftMonth)),
      },
      {
        name: tcRightMonth,
        type: "bar" as const,
        barWidth: 28,
        itemStyle: {
          color: "#3b82f6",
          borderRadius: [4, 4, 0, 0],
        },
        data: tcBranches.map((br) => noDiscNetSalesFor(br, tcRightMonth)),
      },
      {
        name: "الخصم الخاص بالعروض",
        type: "bar" as const,
        barWidth: 28,
        itemStyle: {
          color: palette.primaryAmber,
          borderRadius: [4, 4, 0, 0],
        },
        data: tcBranches.map((br) => offerDiscountFor(br, tcRightMonth)),
      },
    ],
  };

  const noDiscProfitByBranchOption = {
    tooltip: { trigger: "axis" as const },
    legend: {
      data: [tcLeftMonth, tcRightMonth],
      bottom: 0,
      type: "scroll" as const,
      left: "center" as const,
      textStyle: { fontSize: 9, color: "var(--text-muted)" },
    },
    grid: { left: "8%", right: "4%", top: "12%", bottom: "18%" },
    xAxis: {
      type: "category" as const,
      data: tcBranches,
      axisLabel: { fontSize: 9, color: "#94a3b8" },
      axisLine: { lineStyle: { color: palette.primarySlate } },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
        fontSize: 9,
        color: "#64748b",
      },
      splitLine: { lineStyle: { color: "#1e293b" } },
    },
    series: [
      {
        name: tcLeftMonth,
        type: "bar" as const,
        barWidth: 28,
        itemStyle: {
          color: "#047857",
          borderRadius: [4, 4, 0, 0],
        },
        data: tcBranches.map((br) => noDiscProfitFor(br, tcLeftMonth)),
      },
      {
        name: tcRightMonth,
        type: "bar" as const,
        barWidth: 28,
        itemStyle: {
          color: "#3b82f6",
          borderRadius: [4, 4, 0, 0],
        },
        data: tcBranches.map((br) => noDiscProfitFor(br, tcRightMonth)),
      },
    ],
  };

  const level1Names = categories.map((c) => c.name);
  const level2Names = Array.from(
    new Set(
      categories.flatMap((c) =>
        c.products.map((p) => p.name.split(" ").slice(0, 2).join(" ")),
      ),
    ),
  );
  const level3Names = Array.from(
    new Set(categories.flatMap((c) => c.products.map((p) => p.name))),
  );

  const yAxisCats = (() => {
    const list =
      profitCatLevel === "level1"
        ? level1Names
        : profitCatLevel === "level2"
          ? level2Names
          : level3Names;
    if (!profitCatPick) return list;
    return list.filter((n) => n === profitCatPick);
  })();

  const seriesDataByDiscountType = yAxisCats.map((name) =>
    dist100(`${profitCatLevel}|${name}`),
  );

  const profitMarginByCatOption = {
    tooltip: {
      trigger: "axis" as const,
      axisPointer: { type: "shadow" as const },
      backgroundColor: "#1a2035",
      borderColor: "#1e293b",
      textStyle: { color: "#e2e8f0", fontSize: 10 },
    },
    legend: {
      data: [...discountTypes],
      bottom: 0,
      left: "center",
      textStyle: { color: "#64748b", fontSize: 8 },
    },
    grid: {
      left: "4%",
      right: "3%",
      top: "14%",
      bottom: "18%",
      containLabel: true,
    },
    xAxis: {
      type: "value" as const,
      max: 100,
      axisLabel: { formatter: "{value}%", fontSize: 8, color: "#64748b" },
      axisLine: {
        show: true,
        lineStyle: { color: palette.primarySlate, width: 1.5 },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: isDark ? "#1e293b" : "rgba(100, 116, 139, 0.35)",
        },
      },
    },
    yAxis: {
      type: "category" as const,
      data: yAxisCats,
      axisLabel: { fontSize: 9, color: "#94a3b8" },
      axisLine: {
        show: true,
        lineStyle: { color: palette.primarySlate, width: 1.5 },
      },
      axisTick: { show: false },
    },
    series: [
      {
        name: discountTypes[0],
        type: "bar" as const,
        stack: "total",
        barMaxWidth: 18,
        data: seriesDataByDiscountType.map((d) => d[0]),
        itemStyle: { color: palette.primaryGreen },
        label: {
          show: true,
          fontSize: 7,
          color: "#fff",
          formatter: (p: { value: number }) =>
            p.value > 5 ? `${p.value}%` : "",
        },
      },
      {
        name: discountTypes[1],
        type: "bar" as const,
        stack: "total",
        barMaxWidth: 18,
        data: seriesDataByDiscountType.map((d) => d[1]),
        itemStyle: { color: palette.primaryCyan },
      },
      {
        name: discountTypes[2],
        type: "bar" as const,
        stack: "total",
        barMaxWidth: 18,
        data: seriesDataByDiscountType.map((d) => d[2]),
        itemStyle: { color: palette.primaryRed },
      },
      {
        name: discountTypes[3],
        type: "bar" as const,
        stack: "total",
        barMaxWidth: 18,
        data: seriesDataByDiscountType.map((d) => d[3]),
        itemStyle: { color: palette.primaryAmber },
      },
    ],
  };

  // ── Scatter: نسب الخصم × حجم المبيعات ──
  const scatterOption = {
    tooltip: {
      trigger: "item" as const,
      backgroundColor: "#1a2035",
      borderColor: "#1e293b",
      textStyle: { color: "#e2e8f0", fontSize: 10 },
      formatter: (p: { data: [number, number, string] }) =>
        `<b style="color:#00e5a0">${p.data[2]}</b><br/>نسبة الخصم: ${p.data[0]}%<br/>حجم المبيعات: ${p.data[1]}K`,
    },
    xAxis: {
      name: "نسبة الخصم %",
      type: "value" as const,
      nameLocation: "middle" as const,
      nameGap: 32,
      nameTextStyle: { color: "#64748b", fontSize: 9 },
      axisLabel: { formatter: "{value}%", fontSize: 9, color: "#64748b" },
      splitLine: { lineStyle: { color: "#1e293b" } },
    },
    yAxis: {
      name: "حجم مبيعات المنتجات",
      type: "value" as const,
      nameLocation: "middle" as const,
      nameGap: 40,
      nameTextStyle: { color: "#64748b", fontSize: 9 },
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
        fontSize: 9,
        color: "#64748b",
      },
      splitLine: { lineStyle: { color: "#1e293b" } },
    },
    series: [
      {
        type: "scatter",
        symbolSize: (d: number[]) => Math.max(10, Math.sqrt(d[1] / 100)),
        data: categories.map((c) => [
          c.withSales * 5,
          c.withMargin * 1000,
          c.name,
        ]),
        itemStyle: {
          color: palette.primaryGreen,
          opacity: 0.8,
          borderColor: hexToRgba(palette.primaryGreen, 0.25),
          borderWidth: 1,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            formatter: (p: { data: (number | string)[] }) =>
              String(p.data[2]).split(/[ ،]/)[0],
            fontSize: 9,
            color: "#e2e8f0",
            position: "top" as const,
          },
        },
      },
    ],
    grid: { bottom: "0%", top: "14%", left: "8%", right: "5%" },
  };

  // ── صافي المبيعات حسب نطاق الخصم ──
  const rangeBarOption = {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "#1a2035",
      borderColor: "#1e293b",
      textStyle: { color: "#e2e8f0", fontSize: 10 },
    },
    legend: {
      data: ["صافي المبيعات", "قيمة الربح", "إجمالي الخصومات"],
      bottom: 0,
      textStyle: { color: "#64748b", fontSize: 9 },
    },
    grid: {
      bottom: "18%",
      top: "10%",
      left: "3%",
      right: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category" as const,
      data: discountRanges.map((r) => r.range),
      axisLabel: { fontSize: 10, color: "#64748b" },
      axisLine: { lineStyle: { color: "#334155" } },
    },
    yAxis: [
      {
        type: "value" as const,
        name: "اجمالي المبيعات",
        nameLocation: "end" as const,
        nameGap: 10,
        nameTextStyle: { color: "#64748b", fontSize: 12 },
        axisLabel: {
          formatter: (v: number) => fmtK(v),
          fontSize: 9,
          color: "#64748b",
        },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      {
        type: "value" as const,
        name: "معدل الخصم %",
        nameLocation: "end" as const,
        nameGap: 10,
        nameTextStyle: { color: "#64748b", fontSize: 12 },
        axisLabel: { formatter: "{value}%", fontSize: 9, color: "#64748b" },
      },
    ],
    series: [
      {
        name: "صافي المبيعات",
        type: "bar",
        data: discountRanges.map((r) => ({
          value: r.netSales,
          itemStyle: {
            color: palette.primaryGreen,
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 32,
      },
      {
        name: "قيمة الربح",
        type: "bar",
        data: discountRanges.map((r) => ({
          value: r.profitValue,
          itemStyle: { color: palette.primaryCyan, borderRadius: [4, 4, 0, 0] },
        })),
        barMaxWidth: 32,
      },
      {
        name: "إجمالي الخصومات",
        type: "bar",
        data: discountRanges.map((r) => ({
          value: r.totalDiscount,
          itemStyle: {
            color: palette.primaryAmber,
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 32,
      },
      {
        name: "معدل الخصم %",
        type: "line",
        yAxisIndex: 1,
        data: discountRanges.map((r) => r.avgRate),
        lineStyle: { color: palette.primaryRed, width: 2 },
        itemStyle: { color: palette.primaryRed },
        smooth: true,
      },
    ],
  };

  // ── إجمالي الخصومات بمرور الوقت ──
  const periodData = {
    شهري: {
      labels: Array.from({ length: 12 }, (_, i) => `شهر ${i + 1}`),
      values: [
        153000, 118500, 353000, 185000, 206000, 139500, 112000, 404000, 225000,
        178000, 478000, 571000,
      ],
    },
    ربعي: {
      labels: ["الربع الأول", "الربع الثاني", "الربع الثالث", "الربع الرابع"],
      values: [624500, 530500, 741000, 1227000],
    },
    سنوي: {
      labels: ["2021", "2022", "2023", "2024"],
      values: [1850000, 2340000, 2780000, 3123000],
    },
  };
  const pData = periodData[discountPeriod];
  const discountTrendOption = {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "#1a2035",
      borderColor: "#1e293b",
      textStyle: { color: "#e2e8f0", fontSize: 11 },
      formatter: (params: { name: string; value: number }[]) =>
        `${params[0].name}<br/>إجمالي الخصومات: <b style="color:${palette.primaryAmber}">${fmtK(params[0].value)}</b>`,
    },
    grid: {
      bottom: "10%",
      top: "8%",
      left: "3%",
      right: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category" as const,
      data: pData.labels,
      axisLabel: { fontSize: 9, color: "#64748b" },
      axisLine: {
        show: true,
        lineStyle: { color: palette.primarySlate, width: 1.5 },
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        formatter: (v: number) => fmtK(v),
        fontSize: 9,
        color: "#64748b",
      },
      axisLine: {
        show: true,
        lineStyle: { color: palette.primarySlate, width: 1.5 },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: isDark ? "#1e293b" : "rgba(100, 116, 139, 0.35)",
        },
      },
    },
    series: [
      {
        type: "line" as const,
        smooth: true,
        showSymbol: true,
        symbolSize: 7,
        data: pData.values,
        lineStyle: { color: palette.primaryAmber, width: 2.5 },
        itemStyle: {
          color: palette.primaryAmber,
          borderColor: "#1a2035",
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(245,158,11,0.25)" },
              { offset: 1, color: "rgba(245,158,11,0.02)" },
            ],
          },
        },
      },
    ],
  };

  // ── تحليل المبيعات حسب نسبة الخصم (من صفحة المبيعات) ──
  const salesByDiscountOption = {
    xAxis: {
      type: "category" as const,
      data: ["بدون خصم", "5%", "10%", "15%", "20%", "25%+"],
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
    },
    series: [
      {
        name: "المبيعات",
        type: "bar" as const,
        data: [8200000, 5100000, 4300000, 3600000, 2100000, 1300000],
        itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] },
        barWidth: 28,
      },
      {
        name: "الأرباح",
        type: "bar" as const,
        data: [2050000, 1120000, 730000, 468000, 189000, 52000],
        itemStyle: { color: palette.primaryCyan, borderRadius: [4, 4, 0, 0] },
        barWidth: 28,
      },
    ],
    legend: { data: ["المبيعات", "الأرباح"], bottom: 0, left: "center" },
  };

  const kpis = [
    {
      icon: DollarSign,
      label: "صافي المبيعات",
      value: "425.92K",
      color: palette.primaryGreen,
      dim: hexToRgba(palette.primaryGreen, 0.1),
    },
    {
      icon: TrendingUp,
      label: "قيمة الربح",
      value: "155.52K",
      color: palette.primaryCyan,
      dim: hexToRgba(palette.primaryCyan, 0.1),
    },
    {
      icon: BarChart3,
      label: "قيمة التكلفة",
      value: "78.28K",
      color: palette.primaryBlue,
      dim: hexToRgba(palette.primaryBlue, 0.1),
    },
    {
      icon: Tag,
      label: "إجمالي الخصومات المطبقة",
      value: "169.47K",
      color: palette.primaryAmber,
      dim: hexToRgba(palette.primaryAmber, 0.1),
    },
    {
      icon: TrendingDown,
      label: "ربح المنتجات المخصومة",
      value: "43.61K",
      color: "#a855f7",
      dim: "rgba(168,85,247,0.1)",
    },
    {
      icon: Percent,
      label: "% مبيعات مخصومة",
      value: "21.31%",
      color: palette.primaryRed,
      dim: hexToRgba(palette.primaryRed, 0.1),
    },
    {
      icon: AlertCircle,
      label: "متوسط نسبة الخصم",
      value: "1.97%",
      color: "#0891b2",
      dim: "rgba(8,145,178,0.1)",
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
          <Percent size={22} style={{ color: "var(--accent-amber)" }} />
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            تحليل الخصومات
          </h1>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--accent-amber)" }}
            />
            <span
              className="text-[10px]"
              style={{ color: "var(--accent-amber)" }}
            >
              التقرير السابع
            </span>
          </div>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          تحليل الخصومات: الهوامش، نطاقات الخصم، أداء الفروع، والمواسم
        </p>
      </motion.div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel p-4 relative overflow-hidden"
          >
            <div
              className="absolute -top-4 -right-4 w-14 h-14 rounded-full blur-2xl"
              style={{ background: k.color, opacity: 0.15 }}
            />
            <div className="relative">
              <div
                className="p-1.5 rounded-lg w-fit mb-2"
                style={{ background: k.dim }}
              >
                <k.icon size={11} style={{ color: k.color }} />
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

      {/* ── هامش الربح + Scatter ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="هامش الربح حسب الفئة و نوع الخصم"
          titleFlag="green"
          subtitle="Profit Margin by Category and Discount Type"
          option={profitMarginByCatOption}
          headerExtra={
            <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
              <div className="flex items-center gap-0.5 flex-wrap justify-end">
                <span
                  className="text-[9px] shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  المستوى:
                </span>
                {profitCatLevelOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setProfitCatLevel(value);
                      setProfitCatPick("");
                    }}
                    className="px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
                    style={{
                      background:
                        profitCatLevel === value
                          ? "var(--accent-green-dim)"
                          : "var(--bg-elevated)",
                      color:
                        profitCatLevel === value
                          ? "var(--accent-green)"
                          : "var(--text-muted)",
                      border: `1px solid ${
                        profitCatLevel === value
                          ? "var(--accent-green)"
                          : "var(--border-subtle)"
                      }`,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div
                className="hidden sm:block h-5 w-px shrink-0"
                style={{ background: "var(--border-subtle)" }}
                aria-hidden
              />
              <div>
                <InlineSearchDropdown
                  label="كل الأصناف"
                  value={profitCatPick}
                  options={
                    profitCatLevel === "level1"
                      ? level1Names
                      : profitCatLevel === "level2"
                        ? level2Names
                        : level3Names
                  }
                  onChange={setProfitCatPick}
                  accent="var(--accent-cyan)"
                />
              </div>
            </div>
          }
          height="360px"
          delay={1}
        />
        <ChartCard
          title="نسب الخصم وحجم مبيعات المجموعات"
          titleFlag="green"
          subtitle="Discount Percentages & Product Sales Volume by Category"
          option={scatterOption}
          height="360px"
          delay={2}
        />
      </div>

      {/* ── صافي المبيعات حسب نطاق الخصم ── */}
      <ChartCard
        title="صافي المبيعات وقيمة الربح والخصومات حسب نطاق الخصم"
        subtitle="Net Sales, Profit Value, Total Applied Discounts & Average Discount Rate by Discount Range"
        option={rangeBarOption}
        height="320px"
        delay={1}
      />

      {/* ── /time-compare (ported): صافي المبيعات/الربح بدون خصم حسب الفرع (شهر يسار/يمين) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="صافي المبيعات و الأرباح مع خصم"
          titleFlag="green"
          subtitle="قيمة المبيعات + الخصم الخاص بالعروض حسب الفرع والفترة"
          option={noDiscNetSalesByBranchOption}
          height="340px"
          delay={2}
          headerExtra={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <InlineSearchDropdown
                label="الفترة اليسرى"
                value={tcLeftMonth}
                options={monthOptions}
                onChange={setTcLeftMonth}
                accent="#047857"
              />
              <InlineSearchDropdown
                label="الفترة اليمنى"
                value={tcRightMonth}
                options={monthOptions}
                onChange={setTcRightMonth}
                accent="#3b82f6"
              />
            </div>
          }
        />
        <ChartCard
          title="صافي المبيعات و الأرباح بدون خصم"
          titleFlag="green"
          subtitle="قيمة الربح حسب الفرع والفترة"
          option={noDiscProfitByBranchOption}
          height="340px"
          delay={3}
          headerExtra={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <InlineSearchDropdown
                label="الفترة اليسرى"
                value={tcLeftMonth}
                options={monthOptions}
                onChange={setTcLeftMonth}
                accent="#047857"
              />
              <InlineSearchDropdown
                label="الفترة اليمنى"
                value={tcRightMonth}
                options={monthOptions}
                onChange={setTcRightMonth}
                accent="#3b82f6"
              />
            </div>
          }
        />
      </div>

      {/* ── جدول مقارنة الفئات ── */}
      <div className="glass-panel overflow-hidden">
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <SectionTitleWithFlag title="مقارنة أداء فئات الخصم" />
          <p
            className="text-[10px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Discount Category Comparison — مع/بدون خصومات
          </p>
        </div>
        <div className="overflow-x-auto">
          <AnalyticsTable
            headers={[]}
            thead={
              <>
                <tr
                  style={{
                    background: "var(--bg-elevated)",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <th
                    style={{
                      padding: "9px 12px",
                      textAlign: "right",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      minWidth: 150,
                      whiteSpace: "nowrap",
                    }}
                  >
                    فئة الخصم
                  </th>
                  <th
                    colSpan={2}
                    style={{
                      padding: "9px 12px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      borderLeft: "1px solid var(--border-subtle)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    مع خصومات
                  </th>
                  <th
                    colSpan={2}
                    style={{
                      padding: "9px 12px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      borderLeft: "1px solid var(--border-subtle)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    بدون خصومات
                  </th>
                </tr>
                <tr
                  style={{
                    background: "var(--bg-elevated)",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <th
                    style={{
                      padding: "7px 12px",
                      textAlign: "right",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  />
                  <th
                    style={{
                      padding: "7px 12px",
                      textAlign: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      borderLeft: "1px solid var(--border-subtle)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    % هامش الربح
                  </th>
                  <th
                    style={{
                      padding: "7px 12px",
                      textAlign: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    % مساهمة المبيعات
                  </th>
                  <th
                    style={{
                      padding: "7px 12px",
                      textAlign: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      borderLeft: "1px solid var(--border-subtle)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    % هامش الربح
                  </th>
                  <th
                    style={{
                      padding: "7px 12px",
                      textAlign: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    % مساهمة المبيعات
                  </th>
                </tr>
              </>
            }
          >
            {categories.map((c) => {
              const isOpen = expandedCats.has(c.name);
              return (
                <React.Fragment key={c.name}>
                  {/* صف الفئة */}
                  <tr
                    onClick={() => toggleCat(c.name)}
                    className="transition-colors cursor-pointer"
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      background: isOpen
                        ? "rgba(0,229,160,0.04)"
                        : "transparent",
                    }}
                  >
                    <td
                      style={{
                        ...analyticsTdBaseStyle("right"),
                        padding: "8px 12px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            color: "var(--accent-green)",
                            transition: "transform 0.2s",
                            display: "inline-block",
                            transform: isOpen
                              ? "rotate(0deg)"
                              : "rotate(-90deg)",
                          }}
                        >
                          <ChevronDown size={13} />
                        </span>
                        {c.name}
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{
                            background: "var(--bg-elevated)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {c.products.length}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        ...analyticsTdBaseStyle("center"),
                        padding: "8px 12px",
                        borderLeft: "1px solid var(--border-subtle)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color:
                            c.withMargin > 50
                              ? "var(--accent-green)"
                              : c.withMargin > 30
                                ? "var(--accent-amber)"
                                : "var(--accent-red)",
                        }}
                        dir="ltr"
                      >
                        {fmt2(c.withMargin)}%
                      </span>
                    </td>
                    <td
                      style={{
                        ...analyticsTdBaseStyle("center"),
                        padding: "8px 12px",
                      }}
                    >
                      <span
                        style={{ fontSize: 10, color: "var(--text-secondary)" }}
                        dir="ltr"
                      >
                        {fmt2(c.withSales)}%
                      </span>
                    </td>
                    <td
                      style={{
                        ...analyticsTdBaseStyle("center"),
                        padding: "8px 12px",
                        borderLeft: "1px solid var(--border-subtle)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color:
                            c.noMargin > 50
                              ? "var(--accent-green)"
                              : c.noMargin > 30
                                ? "var(--accent-amber)"
                                : "var(--text-muted)",
                        }}
                        dir="ltr"
                      >
                        {fmt2(c.noMargin)}%
                      </span>
                    </td>
                    <td
                      style={{
                        ...analyticsTdBaseStyle("center"),
                        padding: "8px 12px",
                      }}
                    >
                      <span
                        style={{ fontSize: 10, color: "var(--text-muted)" }}
                        dir="ltr"
                      >
                        {fmt2(c.noSales)}%
                      </span>
                    </td>
                  </tr>

                  {/* صفوف المنتجات */}
                  <AnimatePresence initial={false}>
                    {isOpen &&
                      c.products.map((p, pi) => (
                        <motion.tr
                          key={p.name}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18, delay: pi * 0.03 }}
                          style={{
                            borderBottom: "1px solid var(--border-subtle)",
                            background: "rgba(0,229,160,0.02)",
                          }}
                        >
                          <td
                            style={{
                              ...analyticsTdBaseStyle("right"),
                              padding: "6px 12px 6px 30px",
                              fontSize: 10,
                              color: "var(--text-secondary)",
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <ChevronRight
                                size={10}
                                style={{
                                  color: "var(--accent-green)",
                                  opacity: 0.5,
                                }}
                              />
                              {p.name}
                            </div>
                          </td>
                          <td
                            style={{
                              ...analyticsTdBaseStyle("center"),
                              padding: "6px 12px",
                              borderLeft: "1px solid var(--border-subtle)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 600,
                                color:
                                  p.withMargin > 50
                                    ? "var(--accent-green)"
                                    : p.withMargin > 30
                                      ? "var(--accent-amber)"
                                      : "var(--accent-red)",
                              }}
                              dir="ltr"
                            >
                              {fmt2(p.withMargin)}%
                            </span>
                          </td>
                          <td
                            style={{
                              ...analyticsTdBaseStyle("center"),
                              padding: "6px 12px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 9.5,
                                color: "var(--text-muted)",
                              }}
                              dir="ltr"
                            >
                              {fmt2(p.withSales)}%
                            </span>
                          </td>
                          <td
                            style={{
                              ...analyticsTdBaseStyle("center"),
                              padding: "6px 12px",
                              borderLeft: "1px solid var(--border-subtle)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 600,
                                color:
                                  p.noMargin > 50
                                    ? "var(--accent-green)"
                                    : p.noMargin > 30
                                      ? "var(--accent-amber)"
                                      : "var(--text-muted)",
                              }}
                              dir="ltr"
                            >
                              {fmt2(p.noMargin)}%
                            </span>
                          </td>
                          <td
                            style={{
                              ...analyticsTdBaseStyle("center"),
                              padding: "6px 12px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 9.5,
                                color: "var(--text-muted)",
                              }}
                              dir="ltr"
                            >
                              {fmt2(p.noSales)}%
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </AnalyticsTable>
        </div>
      </div>

      {/* ── إجمالي الخصومات بمرور الوقت ── */}
      <div className="glass-panel overflow-hidden">
        <div
          className="px-5 py-3 border-b flex items-center justify-between flex-wrap gap-2"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div>
            <h3
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              إجمالي الخصومات بمرور الوقت
            </h3>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Total Discounts Over Time
            </p>
          </div>
          <div
            className="flex items-center gap-1 p-0.5 rounded-lg"
            style={{ background: "var(--bg-elevated)" }}
          >
            {(["شهري", "ربعي", "سنوي"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setDiscountPeriod(p)}
                className="px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all"
                style={{
                  background:
                    discountPeriod === p
                      ? "rgba(245,158,11,0.15)"
                      : "transparent",
                  color: discountPeriod === p ? "#f59e0b" : "var(--text-muted)",
                  border:
                    discountPeriod === p
                      ? "1px solid rgba(245,158,11,0.3)"
                      : "1px solid transparent",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <ChartCard title="" option={discountTrendOption} height="260px" />
      </div>

      {/* ── جدول أداء الفروع ── */}
      <div className="glass-panel overflow-hidden">
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <SectionTitleWithFlag title="تفاصيل أداء الخصومات حسب الفرع" />
          <p
            className="text-[10px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Branch Discount Performance Details
          </p>
        </div>
        <div className="overflow-x-auto">
          <AnalyticsTable
            headers={[
              { label: "الفرع", align: "right" },
              { label: "الفواتير", align: "center" },
              { label: "ف. مخصومة", align: "center" },
              { label: "% الفواتير المخصومة", align: "center" },
              { label: "ف. بدون خصم", align: "center" },
              { label: "متوسط الخصم", align: "center" },
              { label: "مبيعات مخصومة", align: "center" },
              { label: "حجم مخصوم", align: "center" },
              { label: "صافي المبيعات", align: "center" },
              { label: "الخصومات المطبقة", align: "center" },
              { label: "% الاستخدام", align: "center" },
              { label: "متوسط % الخصم", align: "center" },
            ]}
          >
            {branches.map((b) => {
              const isTotal = b.name === "الإجمالي";
              const hasSubs = Array.isArray(b.subs) && b.subs.length > 0;
              const brKey = `br_${b.name}`;
              const isBrOpen = expandedCats.has(brKey);

              const renderCells = (row: BranchBaseRow, isProd = false) => (
                <>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.invoices.toFixed(isProd ? 0 : 2)}
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.discInv}
                    </span>
                  </td>
                  <AnalyticsBarCell
                    value={row.discRate}
                    max={100}
                    color="#3b82f6"
                    text={`${row.discRate.toFixed(2)}%`}
                  />
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.noDiscInv}
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.avgDisc.toFixed(2)}
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.discSales.toFixed(2)}
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.discVol}
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.netSales.toFixed(2)}
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.appDisc.toFixed(2)}
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.utilRate.toFixed(2)}%
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.avgDiscRate.toFixed(2)}%
                    </span>
                  </td>
                </>
              );

              return (
                <React.Fragment key={b.name}>
                  {/* صف الفرع */}
                  <tr
                    onClick={() => (hasSubs ? toggleCat(brKey) : undefined)}
                    className={
                      isTotal ? "" : "hover:bg-white/1.5 transition-colors"
                    }
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      background: isTotal
                        ? "var(--accent-green-dim)"
                        : isBrOpen
                          ? "rgba(4,120,87,0.04)"
                          : "transparent",
                      fontWeight: isTotal ? 700 : 400,
                      cursor: hasSubs ? "pointer" : "default",
                    }}
                  >
                    <td
                      style={{
                        ...analyticsTdBaseStyle("right"),
                        fontSize: 11,
                        fontWeight: isTotal ? 700 : 600,
                        color: isTotal
                          ? "var(--accent-green)"
                          : "var(--text-primary)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {hasSubs && (
                          <span
                            style={{
                              color: "var(--accent-green)",
                              transition: "transform 0.2s",
                              display: "inline-block",
                              transform: isBrOpen
                                ? "rotate(0deg)"
                                : "rotate(-90deg)",
                            }}
                          >
                            <ChevronDown size={13} />
                          </span>
                        )}
                        {b.name}
                        {hasSubs && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{
                              background: "var(--bg-elevated)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {b.subs?.length ?? 0}
                          </span>
                        )}
                      </div>
                    </td>
                    {renderCells(b)}
                  </tr>

                  {/* صفوف الفئات (sub) */}
                  <AnimatePresence initial={false}>
                    {isBrOpen &&
                      hasSubs &&
                      b.subs!.map((sub, si: number) => {
                        const subKey = `brs_${b.name}_${sub.name}`;
                        const isSubOpen = expandedCats.has(subKey);
                        return (
                          <React.Fragment key={sub.name}>
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.18, delay: si * 0.03 }}
                              onClick={() => toggleCat(subKey)}
                              className="cursor-pointer hover:bg-white/1.5 transition-colors"
                              style={{
                                borderBottom: "1px solid var(--border-subtle)",
                                background: isSubOpen
                                  ? "rgba(8,145,178,0.04)"
                                  : "rgba(4,120,87,0.02)",
                              }}
                            >
                              <td
                                style={{
                                  ...analyticsTdBaseStyle("right"),
                                  padding: "6px 10px 6px 28px",
                                  fontSize: 10,
                                  color: "var(--text-secondary)",
                                }}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span
                                    style={{
                                      color: "var(--accent-cyan)",
                                      transition: "transform 0.2s",
                                      display: "inline-block",
                                      transform: isSubOpen
                                        ? "rotate(0deg)"
                                        : "rotate(-90deg)",
                                    }}
                                  >
                                    <ChevronDown size={11} />
                                  </span>
                                  {sub.name}
                                  <span
                                    className="text-[8px] px-1 py-0.5 rounded"
                                    style={{
                                      background: "var(--bg-elevated)",
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    {sub.products.length}
                                  </span>
                                </div>
                              </td>
                              {renderCells(sub, true)}
                            </motion.tr>

                            {/* صفوف المنتجات (sub al sub) */}
                            <AnimatePresence initial={false}>
                              {isSubOpen &&
                                sub.products.map((prod, pi: number) => (
                                  <motion.tr
                                    key={prod.name}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{
                                      duration: 0.15,
                                      delay: pi * 0.03,
                                    }}
                                    style={{
                                      borderBottom:
                                        "1px solid var(--border-subtle)",
                                      background: "rgba(8,145,178,0.02)",
                                    }}
                                  >
                                    <td
                                      style={{
                                        ...analyticsTdBaseStyle("right"),
                                        padding: "5px 10px 5px 48px",
                                        fontSize: 9.5,
                                        color: "var(--text-muted)",
                                      }}
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <ChevronRight
                                          size={9}
                                          style={{
                                            color: "var(--accent-amber)",
                                            opacity: 0.6,
                                          }}
                                        />
                                        {prod.name}
                                      </div>
                                    </td>
                                    {renderCells(prod, true)}
                                  </motion.tr>
                                ))}
                            </AnimatePresence>
                          </React.Fragment>
                        );
                      })}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </AnalyticsTable>
        </div>
      </div>

      <ChartCard
        title="تحليل المبيعات حسب نسبة الخصم"
        titleLeading={<ChartTitleFlagBadge flag="green" size="sm" />}
        titleFlag="red"
        titleFlagNumber={1}
        subtitle="تأثير الخصومات على المبيعات والأرباح"
        option={salesByDiscountOption}
        height="300px"
        delay={1}
      />
    </div>
  );
}
