"use client";

import "@/lib/echarts/register-bar-line-pie";
import dynamic from "next/dynamic";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft, Check, MapPin } from "lucide-react";
import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import { motion, AnimatePresence } from "framer-motion";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
import EnterpriseTable from "@/components/ui/EnterpriseTable";
import type { TableColumn } from "@/components/ui/EnterpriseTable";
import { getBranchData, type BranchData } from "@/lib/mockData";
import BranchMap from "@/components/ui/BranchMap";
import MetricsBubblePlot, {
  type MetricsBubblePoint,
} from "@/components/ui/MetricsBubblePlot";
import { BRANCH_PRODUCT_ANALYSIS } from "@/lib/branchProductAnalysis";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import DrillDownTable from "@/components/ui/DrillDownTable";
import {
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import Heading from "./components/heading/Heading";
import BranchesStats from "./components/branches-stats/BranchesStats";
import BranchPerformanceEvaluation from "./components/branch-performance-evaluation/BranchPerformanceEvaluation";
import OverallBranchesPerformance from "./components/overall-branches-performance/OverallBranchesPerformance";
import ProductCategoryPerformanceByBranch from "./components/product-category-performance-by-branch/ProductCategoryPerformanceByBranch";

/** Mock period scores around each branch’s annual score (demo data). */

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

/** Multi-select dropdown styled like `GlobalFilterBar` (empty = "all"). */
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
          maxWidth: 240,
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
              zIndex: 2050,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,.4)",
              minWidth: 200,
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

export default function BranchesPage() {
  const palette = useResolvedAnalyticsPalette();
  const branchChartColors = useMemo(
    () =>
      [
        palette.primaryGreen,
        palette.primaryCyan,
        palette.primaryBlue,
        palette.primaryPurple,
        palette.primaryAmber,
        palette.primaryRed,
        "#0891b2",
        "#d97706",
      ] as const,
    [palette],
  );
  const branches = useMemo(() => getBranchData(), []);

  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [basketPriceActiveBranches, setBasketPriceActiveBranches] = useState<
    string[]
  >(() => BRANCH_PRODUCT_ANALYSIS.map((b) => b.branch));
  const [basketPriceCategory, setBasketPriceCategory] = useState<string | null>(
    null,
  );

  // ألوان الفئات (مطابقة لصفحة /products)
  const categoryColors = useMemo(
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

  // صافي الأرباح التقريبي حسب الفئة عبر جميع الفروع
  const profitByCategory = useMemo(() => {
    const map = new Map<string, number>();
    BRANCH_PRODUCT_ANALYSIS.forEach((b) => {
      b.cats.forEach((c) => {
        // تقدير ربح تقريبي للفئة بناءً على حجم السلة و ATv
        const estProfit = c.atv * c.basket * c.vol * 0.12;
        map.set(c.name, (map.get(c.name) ?? 0) + estProfit);
      });
    });
    const entries = Array.from(map.entries());
    return {
      labels: entries.map(([name]) => name),
      values: entries.map(([, v]) => Math.round(v)),
    };
  }, []);

  const profitByCategoryOption = useMemo(
    () => ({
      tooltip: { trigger: "axis" as const },
      grid: {
        bottom: "0%",
        top: "12%",
        left: "3%",
        right: "2%",
        containLabel: true,
      },
      xAxis: {
        type: "category" as const,
        data: profitByCategory.labels,
        axisLabel: {
          rotate: 28,
          fontSize: 9,
          interval: 0,
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
          type: "bar" as const,
          barMaxWidth: 44,
          data: profitByCategory.values.map((v, i) => ({
            value: v,
            itemStyle: {
              color: categoryColors[i % categoryColors.length],
              borderRadius: [6, 6, 0, 0],
            },
            label: {
              show: true,
              position: "top" as const,
              fontSize: 9,
              fontWeight: "bold" as const,
              color: categoryColors[i % categoryColors.length],
              formatter: (p: { value: number }) =>
                `${(p.value / 1000).toFixed(1)}K`,
            },
          })),
        },
      ],
    }),
    [categoryColors, profitByCategory],
  );

  const netSalesByBranchOption = useMemo(() => {
    // ── صافي المبيعات عبر الزمن لكل فرع ──
    const months = Array.from({ length: 12 }, (_, i) => `شهر ${i + 1}`);
    const netSalesData: Record<string, number[]> = {
      "سوق المنارة": [
        18250, 17520, 16980, 16200, 15840, 15210, 14890, 14550, 14020, 13680,
        13230, 12800,
      ],
      "سوق العليا": [
        20500, 21050, 21600, 22100, 22850, 23400, 24050, 24700, 25300, 25950,
        26600, 27250,
      ],
      "مول التحلية": [
        17600, 18100, 18750, 19300, 19850, 20300, 20950, 21500, 22050, 22600,
        23150, 23800,
      ],
      "مول الشاطئ": [
        14200, 13800, 13350, 12900, 12550, 12100, 11800, 11450, 11000, 10650,
        10300, 9950,
      ],
      "سوق المدينة": [
        16400, 16850, 17200, 17650, 18100, 18550, 19000, 19450, 19900, 20350,
        20800, 21250,
      ],
      "سوق الرياض": [
        21500, 22000, 22600, 23200, 23800, 24400, 25000, 25600, 26200, 26800,
        27400, 28000,
      ],
      "سوق الدمام": [
        19800, 19200, 18600, 18000, 17400, 16800, 16200, 15600, 15000, 14400,
        13800, 13200,
      ],
      "سوق الطائف": [
        15200, 14800, 14400, 14000, 13600, 13200, 12800, 12400, 12000, 11600,
        11200, 10800,
      ],
      "سوق القصيم": [
        17500, 18000, 18600, 19200, 19800, 20400, 21000, 21600, 22200, 22800,
        23400, 24000,
      ],
      "سوق أبها": [
        18600, 18200, 17800, 17400, 17000, 16600, 16200, 15800, 15400, 15000,
        14600, 14200,
      ],
      "سوق نجران": [
        13200, 12800, 12400, 12000, 11600, 11200, 10800, 10400, 10000, 9600,
        9200, 8800,
      ],
      "سوق حائل": [
        14500, 14200, 13900, 13600, 13300, 13000, 12700, 12400, 12100, 11800,
        11500, 11200,
      ],
      "سوق الجوف": [
        13800, 13500, 13200, 12900, 12600, 12300, 12000, 11700, 11400, 11100,
        10800, 10500,
      ],
      "سوق تبوك": [
        16000, 15600, 15200, 14800, 14400, 14000, 13600, 13200, 12800, 12400,
        12000, 11600,
      ],
      "سوق ينبع": [
        14900, 14500, 14100, 13700, 13300, 12900, 12500, 12100, 11700, 11300,
        10900, 10500,
      ],
      "سوق بيشة": [
        12000, 11800, 11600, 11400, 11200, 11000, 10800, 10600, 10400, 10200,
        10000, 9800,
      ],
      "سوق عرعر": [
        11000, 10800, 10600, 10400, 10200, 10000, 9800, 9600, 9400, 9200, 9000,
        8800,
      ],
      "سوق الباحة": [
        13000, 12800, 12600, 12400, 12200, 12000, 11800, 11600, 11400, 11200,
        11000, 10800,
      ],
      "سوق سكاكا": [
        12500, 12300, 12100, 11900, 11700, 11500, 11300, 11100, 10900, 10700,
        10500, 10300,
      ],
      "سوق الخرج": [
        14000, 13800, 13600, 13400, 13200, 13000, 12800, 12600, 12400, 12200,
        12000, 11800,
      ],
      "سوق الجبيل": [
        15500, 15200, 14900, 14600, 14300, 14000, 13700, 13400, 13100, 12800,
        12500, 12200,
      ],
      "سوق القطيف": [
        14800, 14500, 14200, 13900, 13600, 13300, 13000, 12700, 12400, 12100,
        11800, 11500,
      ],
      "سوق الهفوف": [
        17000, 16800, 16600, 16400, 16200, 16000, 15800, 15600, 15400, 15200,
        15000, 14800,
      ],
      "سوق خميس مشيط": [
        16200, 16000, 15800, 15600, 15400, 15200, 15000, 14800, 14600, 14400,
        14200, 14000,
      ],
      "سوق جازان": [
        13500, 13300, 13100, 12900, 12700, 12500, 12300, 12100, 11900, 11700,
        11500, 11300,
      ],
      "سوق بريدة": [
        17800, 17600, 17400, 17200, 17000, 16800, 16600, 16400, 16200, 16000,
        15800, 15600,
      ],
      "سوق عنيزة": [
        15000, 14800, 14600, 14400, 14200, 14000, 13800, 13600, 13400, 13200,
        13000, 12800,
      ],
      "سوق الزلفي": [
        14200, 14000, 13800, 13600, 13400, 13200, 13000, 12800, 12600, 12400,
        12200, 12000,
      ],
      "سوق الرس": [
        13900, 13700, 13500, 13300, 13100, 12900, 12700, 12500, 12300, 12100,
        11900, 11700,
      ],
      "سوق المجمعة": [
        14600, 14400, 14200, 14000, 13800, 13600, 13400, 13200, 13000, 12800,
        12600, 12400,
      ],
      "سوق الخفجي": [
        12800, 12600, 12400, 12200, 12000, 11800, 11600, 11400, 11200, 11000,
        10800, 10600,
      ],
      "سوق رأس تنورة": [
        13400, 13200, 13000, 12800, 12600, 12400, 12200, 12000, 11800, 11600,
        11400, 11200,
      ],
      "سوق حفر الباطن": [
        16000, 15800, 15600, 15400, 15200, 15000, 14800, 14600, 14400, 14200,
        14000, 13800,
      ],
      "سوق البطنية": [
        12400, 12200, 12000, 11800, 11600, 11400, 11200, 11000, 10800, 10600,
        10400, 10200,
      ],
      "سوق الروضة": [
        15200, 15000, 14800, 14600, 14400, 14200, 14000, 13800, 13600, 13400,
        13200, 13000,
      ],
      "سوق العزيزية": [
        16800, 16600, 16400, 16200, 16000, 15800, 15600, 15400, 15200, 15000,
        14800, 14600,
      ],
      "سوق المنفوحة": [
        14900, 14700, 14500, 14300, 14100, 13900, 13700, 13500, 13300, 13100,
        12900, 12700,
      ],
      "سوق السويدي": [
        17100, 16900, 16700, 16500, 16300, 16100, 15900, 15700, 15500, 15300,
        15100, 14900,
      ],
      "سوق الروابي": [
        15300, 15100, 14900, 14700, 14500, 14300, 14100, 13900, 13700, 13500,
        13300, 13100,
      ],
      "سوق الشفا": [
        16000, 15800, 15600, 15400, 15200, 15000, 14800, 14600, 14400, 14200,
        14000, 13800,
      ],
      "سوق البديعة": [
        14500, 14300, 14100, 13900, 13700, 13500, 13300, 13100, 12900, 12700,
        12500, 12300,
      ],
      "سوق النزهة": [
        15200, 15000, 14800, 14600, 14400, 14200, 14000, 13800, 13600, 13400,
        13200, 13000,
      ],
      "سوق الحمراء": [
        16700, 16500, 16300, 16100, 15900, 15700, 15500, 15300, 15100, 14900,
        14700, 14500,
      ],
      "سوق الملك فهد": [
        18200, 18000, 17800, 17600, 17400, 17200, 17000, 16800, 16600, 16400,
        16200, 16000,
      ],
      "سوق الفاروق": [
        13900, 13700, 13500, 13300, 13100, 12900, 12700, 12500, 12300, 12100,
        11900, 11700,
      ],
      "سوق الشفاء": [
        14800, 14600, 14400, 14200, 14000, 13800, 13600, 13400, 13200, 13000,
        12800, 12600,
      ],
      "سوق الأندلس": [
        17300, 17100, 16900, 16700, 16500, 16300, 16100, 15900, 15700, 15500,
        15300, 15100,
      ],
      "سوق الخليج": [
        16200, 16000, 15800, 15600, 15400, 15200, 15000, 14800, 14600, 14400,
        14200, 14000,
      ],
      "سوق النهضة": [
        15400, 15200, 15000, 14800, 14600, 14400, 14200, 14000, 13800, 13600,
        13400, 13200,
      ],
      "سوق التعاون": [
        16900, 16700, 16500, 16300, 16100, 15900, 15700, 15500, 15300, 15100,
        14900, 14700,
      ],
      "سوق النرجس": [
        17800, 17600, 17400, 17200, 17000, 16800, 16600, 16400, 16200, 16000,
        15800, 15600,
      ],
      "سوق الملقا": [
        18300, 18100, 17900, 17700, 17500, 17300, 17100, 16900, 16700, 16500,
        16300, 16100,
      ],
      "سوق الياسمين": [
        17600, 17400, 17200, 17000, 16800, 16600, 16400, 16200, 16000, 15800,
        15600, 15400,
      ],
      "سوق النرجس الشمالي": [
        16900, 16700, 16500, 16300, 16100, 15900, 15700, 15500, 15300, 15100,
        14900, 14700,
      ],
      "سوق الحزم": [
        15800, 15600, 15400, 15200, 15000, 14800, 14600, 14400, 14200, 14000,
        13800, 13600,
      ],
      "سوق السويدي الغربي": [
        14700, 14500, 14300, 14100, 13900, 13700, 13500, 13300, 13100, 12900,
        12700, 12500,
      ],
      "سوق اليرموك": [
        16500, 16300, 16100, 15900, 15700, 15500, 15300, 15100, 14900, 14700,
        14500, 14300,
      ],
      "سوق الربيع": [
        15200, 15000, 14800, 14600, 14400, 14200, 14000, 13800, 13600, 13400,
        13200, 13000,
      ],
      "سوق الشروق": [
        16100, 15900, 15700, 15500, 15300, 15100, 14900, 14700, 14500, 14300,
        14100, 13900,
      ],
      "سوق المشرق": [
        17000, 16800, 16600, 16400, 16200, 16000, 15800, 15600, 15400, 15200,
        15000, 14800,
      ],
      "سوق المنارة الشمالية": [
        18250, 18050, 17850, 17650, 17450, 17250, 17050, 16850, 16650, 16450,
        16250, 16050,
      ],
      "سوق العليا الشمالية": [
        20500, 20300, 20100, 19900, 19700, 19500, 19300, 19100, 18900, 18700,
        18500, 18300,
      ],
      "مول التحلية الجديدة": [
        17600, 17400, 17200, 17000, 16800, 16600, 16400, 16200, 16000, 15800,
        15600, 15400,
      ],
      "مول الشاطئ الجديد": [
        14200, 14000, 13800, 13600, 13400, 13200, 13000, 12800, 12600, 12400,
        12200, 12000,
      ],
      "سوق المدينة الجديدة": [
        16400, 16200, 16000, 15800, 15600, 15400, 15200, 15000, 14800, 14600,
        14400, 14200,
      ],
      "سوق الرياض الجديدة": [
        21500, 21300, 21100, 20900, 20700, 20500, 20300, 20100, 19900, 19700,
        19500, 19300,
      ],
      "سوق الدمام الجديدة": [
        19800, 19600, 19400, 19200, 19000, 18800, 18600, 18400, 18200, 18000,
        17800, 17600,
      ],
      "سوق الطائف الجديدة": [
        15200, 15000, 14800, 14600, 14400, 14200, 14000, 13800, 13600, 13400,
        13200, 13000,
      ],
      "سوق القصيم الجديدة": [
        17500, 17300, 17100, 16900, 16700, 16500, 16300, 16100, 15900, 15700,
        15500, 15300,
      ],
      "سوق أبها الجديدة": [
        18600, 18400, 18200, 18000, 17800, 17600, 17400, 17200, 17000, 16800,
        16600, 16400,
      ],
      "سوق نجران الجديدة": [
        13200, 13000, 12800, 12600, 12400, 12200, 12000, 11800, 11600, 11400,
        11200, 11000,
      ],
      "سوق حائل الجديدة": [
        14500, 14300, 14100, 13900, 13700, 13500, 13300, 13100, 12900, 12700,
        12500, 12300,
      ],
      "سوق الجوف الجديدة": [
        13800, 13600, 13400, 13200, 13000, 12800, 12600, 12400, 12200, 12000,
        11800, 11600,
      ],
      "سوق تبوك الجديدة": [
        16000, 15800, 15600, 15400, 15200, 15000, 14800, 14600, 14400, 14200,
        14000, 13800,
      ],
      "سوق ينبع الجديدة": [
        14900, 14700, 14500, 14300, 14100, 13900, 13700, 13500, 13300, 13100,
        12900, 12700,
      ],
      "سوق بيشة الجديدة": [
        12000, 11800, 11600, 11400, 11200, 11000, 10800, 10600, 10400, 10200,
        10000, 9800,
      ],
      "سوق عرعر الجديدة": [
        11000, 10800, 10600, 10400, 10200, 10000, 9800, 9600, 9400, 9200, 9000,
        8800,
      ],
      "سوق الباحة الجديدة": [
        13000, 12800, 12600, 12400, 12200, 12000, 11800, 11600, 11400, 11200,
        11000, 10800,
      ],
      "سوق سكاكا الجديدة": [
        12500, 12300, 12100, 11900, 11700, 11500, 11300, 11100, 10900, 10700,
        10500, 10300,
      ],
      "سوق الخرج الجديدة": [
        14000, 13800, 13600, 13400, 13200, 13000, 12800, 12600, 12400, 12200,
        12000, 11800,
      ],
      "سوق الجبيل الجديدة": [
        15500, 15300, 15100, 14900, 14700, 14500, 14300, 14100, 13900, 13700,
        13500, 13300,
      ],
      "سوق القطيف الجديدة": [
        14800, 14600, 14400, 14200, 14000, 13800, 13600, 13400, 13200, 13000,
        12800, 12600,
      ],
      "سوق الهفوف الجديدة": [
        17000, 16800, 16600, 16400, 16200, 16000, 15800, 15600, 15400, 15200,
        15000, 14800,
      ],
      "سوق خميس مشيط الجديدة": [
        16200, 16000, 15800, 15600, 15400, 15200, 15000, 14800, 14600, 14400,
        14200, 14000,
      ],
      "سوق جازان الجديدة": [
        13500, 13300, 13100, 12900, 12700, 12500, 12300, 12100, 11900, 11700,
        11500, 11300,
      ],
      "سوق بريدة الجديدة": [
        17800, 17600, 17400, 17200, 17000, 16800, 16600, 16400, 16200, 16000,
        15800, 15600,
      ],
      "سوق عنيزة الجديدة": [
        15000, 14800, 14600, 14400, 14200, 14000, 13800, 13600, 13400, 13200,
        13000, 12800,
      ],
      "سوق الزلفي الجديدة": [
        14200, 14000, 13800, 13600, 13400, 13200, 13000, 12800, 12600, 12400,
        12200, 12000,
      ],
      "سوق الرس الجديدة": [
        13900, 13700, 13500, 13300, 13100, 12900, 12700, 12500, 12300, 12100,
        11900, 11700,
      ],
    };

    return {
      tooltip: { trigger: "axis" as const },
      legend: {
        data: Object.keys(netSalesData),
        bottom: 0,
        textStyle: { fontSize: 9 },
        type: "scroll" as const,
      },
      grid: {
        top: "8%",
        bottom: "20%",
        left: "3%",
        right: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category" as const,
        data: months,
        axisLabel: { fontSize: 9 },
        boundaryGap: false,
      },
      yAxis: {
        type: "value" as const,
        axisLabel: {
          fontSize: 9,
          formatter: (v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`,
        },
      },
      series: Object.entries(netSalesData).map(([name, data], i) => ({
        name,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
        lineStyle: { width: 2 },
        itemStyle: { color: branchChartColors[i] },
        data,
        endLabel: {
          show: true,
          formatter: (p: { value: number }) =>
            `${(p.value / 1000).toFixed(1)}K`,
          fontSize: 9,
          color: branchChartColors[i],
        },
      })),
    };
  }, [branchChartColors]);

  const branchColumns: TableColumn<BranchData>[] = useMemo(() => {
    const maxRev = Math.max(...branches.map((b) => b.revenue), 1);
    const maxOrd = Math.max(...branches.map((b) => b.orders), 1);
    const maxCust = Math.max(...branches.map((b) => b.customers), 1);
    return [
      { key: "nameAr", header: "الفرع", sortable: true },
      { key: "regionAr", header: "المنطقة", sortable: true },
      {
        key: "revenue",
        header: "الإيرادات",
        sortable: true,
        align: "center",
        format: "currency",
        analyticsBar: { max: maxRev },
      },
      {
        key: "orders",
        header: "الطلبات",
        sortable: true,
        align: "center",
        format: "number",
        analyticsBar: { max: maxOrd },
      },
      {
        key: "customers",
        header: "العملاء",
        sortable: true,
        align: "center",
        format: "number",
        analyticsBar: { max: maxCust },
      },
      {
        key: "growth",
        header: "النمو",
        sortable: true,
        align: "right",
        format: "change",
      },
      {
        key: "performance",
        header: "الأداء",
        sortable: true,
        align: "center",
        render: (val: unknown) => {
          const v = Number(val);
          const color =
            v >= 85
              ? "var(--accent-green)"
              : v >= 70
                ? "var(--accent-amber)"
                : "var(--accent-red)";
          return (
            <div className="flex items-center gap-2 justify-center">
              <div
                className="w-16 h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--bg-elevated)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${v}%`, background: color }}
                />
              </div>
              <span
                className="text-xs font-semibold"
                style={{ color }}
                dir="ltr"
              >
                {v}%
              </span>
            </div>
          );
        },
      },
    ];
  }, [branches]);

  return (
    <div className="space-y-6">
      <Heading />

      {/* KPIs */}
      <BranchesStats />

      {/* ── القسم الأول: Gauge + الأوزان المعيارية + أداء الفروع ── */}
      <BranchPerformanceEvaluation />

      {/* ── Overall Branch Performance Score (bar chart) ── */}
      <OverallBranchesPerformance />
      {/* ── درجة أداء فئات المنتجات ── */}
      <ProductCategoryPerformanceByBranch
        expandedCats={expandedCats}
        setExpandedCats={setExpandedCats}
      />

      {/* ── مقارنة المبيعات: السنة الحالية مقابل السنة السابقة ── */}
      {(() => {
        const yoyQuarterLabels = [
          "الربع الأول",
          "الربع الثاني",
          "الربع الثالث",
          "الربع الرابع",
        ] as const;
        const yoyQuarterMonths = [
          ["يناير", "فبراير", "مارس"],
          ["أبريل", "مايو", "جون"],
          ["يوليو", "أغسطس", "سبتمبر"],
          ["أكتوبر", "نوفمبر", "ديسمبر"],
        ] as const;
        const yoyWeights = [0.24, 0.25, 0.26, 0.25];

        function split3Exact(total: number): [number, number, number] {
          const a = Math.round(total / 3);
          const b = Math.round((total - a) / 2);
          return [a, b, total - a - b];
        }

        function buildQuartersForYear(yearPy: number, yearAc: number | null) {
          const qpys = [0, 0, 0, 0];
          for (let i = 0; i < 3; i++)
            qpys[i] = Math.round(yearPy * yoyWeights[i]);
          qpys[3] = yearPy - qpys[0] - qpys[1] - qpys[2];
          const qacs: (number | null)[] =
            yearAc === null
              ? [null, null, null, null]
              : (() => {
                  const a = [0, 0, 0, 0];
                  for (let i = 0; i < 3; i++)
                    a[i] = Math.round(yearAc * yoyWeights[i]);
                  a[3] = yearAc - a[0] - a[1] - a[2];
                  return a;
                })();
          return yoyQuarterLabels.map((label, qi) => {
            const qpy = qpys[qi];
            const qac = qacs[qi];
            const [m0, m1, m2] = split3Exact(qpy);
            const mac =
              qac === null ? ([null, null, null] as const) : split3Exact(qac);
            return {
              label,
              py: qpy,
              ac: qac,
              months: yoyQuarterMonths[qi].map((name, mi) => ({
                name,
                py: [m0, m1, m2][mi],
                ac: mac[mi],
              })),
            };
          });
        }

        const yoyBase = [
          {
            branch: "سوق المنارة",
            py: 73100,
            ac: 24400,
            years: [
              { year: "2020", py: 45200, ac: null as number | null },
              { year: "2022", py: 27900, ac: 24400 },
              { year: "2021", py: 45100, ac: 27900 },
            ],
          },
          {
            branch: "سوق البقعة",
            py: 68200,
            ac: 52100,
            years: [
              { year: "2020", py: 42000, ac: null as number | null },
              { year: "2022", py: 55800, ac: 52100 },
              { year: "2021", py: 42000, ac: 55800 },
            ],
          },
          {
            branch: "سوق الخبر",
            py: 42000,
            ac: 56000,
            years: [
              { year: "2020", py: 30000, ac: null as number | null },
              { year: "2022", py: 44000, ac: 56000 },
              { year: "2021", py: 30000, ac: 44000 },
            ],
          },
          {
            branch: "سوق القويسمة",
            py: 52300,
            ac: 39200,
            years: [
              { year: "2020", py: 35600, ac: null as number | null },
              { year: "2022", py: 38400, ac: 39200 },
              { year: "2021", py: 35600, ac: 38400 },
            ],
          },
          {
            branch: "سوق سطح النجم",
            py: 41200,
            ac: 21800,
            years: [
              { year: "2020", py: 28900, ac: null as number | null },
              { year: "2022", py: 32100, ac: 21800 },
              { year: "2021", py: 28900, ac: 32100 },
            ],
          },
          {
            branch: "سوق الدمام",
            py: 35800,
            ac: 16200,
            years: [
              { year: "2020", py: 22300, ac: null as number | null },
              { year: "2022", py: 22300, ac: 16200 },
              { year: "2021", py: 22300, ac: 22300 },
            ],
          },
          {
            branch: "سوق راس العين",
            py: 28100,
            ac: 13500,
            years: [
              { year: "2020", py: 18200, ac: null as number | null },
              { year: "2022", py: 18200, ac: 13500 },
              { year: "2021", py: 18200, ac: 18200 },
            ],
          },
          {
            branch: "سوق جدة",
            py: 22400,
            ac: 10800,
            years: [
              { year: "2020", py: 15200, ac: null as number | null },
              { year: "2022", py: 15200, ac: 10800 },
              { year: "2021", py: 15200, ac: 15200 },
            ],
          },
        ];

        const yoyData = yoyBase.map((d) => ({
          branch: d.branch,
          py: d.py,
          ac: d.ac,
          years: d.years.map((y) => ({
            year: y.year,
            py: y.py,
            ac: y.ac,
            quarters: buildQuartersForYear(y.py, y.ac),
          })),
        }));

        const allDeltas = yoyData.flatMap((d) => {
          const out: number[] = [d.ac - d.py];
          for (const y of d.years) {
            if (y.ac !== null) out.push(y.ac - y.py);
            for (const q of y.quarters) {
              if (q.ac !== null) out.push(q.ac - q.py);
              for (const m of q.months) {
                if (m.ac !== null) out.push(m.ac - m.py);
              }
            }
          }
          return out;
        });
        const maxAbsDelta = Math.max(...allDeltas.map(Math.abs), 1);
        const fmt = (v: number) =>
          v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`;
        const fmtDelta = (v: number) => `${v >= 0 ? "+" : ""}${fmt(v)}`;
        const pct = (ac: number, py: number) =>
          py === 0 ? 0 : ((ac - py) / py) * 100;

        const yoyKey = {
          branch: (b: string) => `yoy_b_${b}`,
          year: (b: string, y: string) => `yoy_y_${b}_${y}`,
          quarter: (b: string, y: string, q: string) => `yoy_q_${b}_${y}_${q}`,
        };

        function renderPctCell(ac: number, py: number, small: boolean) {
          const p = pct(ac, py);
          return (
            <div className="flex items-center justify-center gap-1" dir="ltr">
              <span
                className={
                  small ? "text-[10px] font-semibold" : "text-[11px] font-bold"
                }
                style={{
                  color: p >= 0 ? "var(--accent-green)" : "var(--accent-red)",
                }}
              >
                {p >= 0 ? "+" : ""}
                {p.toFixed(1)}
              </span>
              <span
                style={{
                  width: small ? 5 : 6,
                  height: small ? 5 : 6,
                  borderRadius: "50%",
                  background:
                    p >= 0 ? "var(--accent-green)" : "var(--accent-red)",
                  display: "inline-block",
                }}
              />
            </div>
          );
        }

        function chevron(open: boolean) {
          return (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                width: 14,
                height: 14,
                borderRadius: 3,
                background: open
                  ? "rgba(37,99,235,0.12)"
                  : "var(--bg-elevated)",
              }}
            >
              {open ? (
                <ChevronDown
                  size={10}
                  style={{ color: "var(--accent-blue)" }}
                />
              ) : (
                <ChevronLeft size={10} style={{ color: "var(--text-muted)" }} />
              )}
            </span>
          );
        }

        function renderYoyDeltaCell(delta: number) {
          const value = Math.abs(delta);
          // استخدم أخضر للفرق الإيجابي وأحمر داكن للسلبي
          const color = delta >= 0 ? "var(--accent-green)" : "rgb(239, 68, 68)";
          const text = fmtDelta(delta);
          const isPositive = delta >= 0;
          const widthPct = Math.max(2, (value / Math.max(1, maxAbsDelta)) * 50);

          return (
            <td
              style={{
                ...analyticsTdBaseStyle("center"),
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: isPositive
                    ? "translateY(-50%)"
                    : "translate(-100%, -50%)",
                  height: 16,
                  background: color,
                  borderRadius: 3,
                  width: `${widthPct}%`,
                  opacity: 0.22,
                }}
              />
              <div
                style={{
                  position: "relative",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
                dir="ltr"
              >
                {text}
              </div>
            </td>
          );
        }

        return (
          <div className="glass-panel p-0 overflow-hidden">
            <div
              className="px-5 py-3 border-b"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="flex items-center gap-2">
                <ChartTitleFlagBadge flag="green" size="sm" />
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  مقارنة المبيعات: السنة الحالية مقابل السابقة
                </h3>
              </div>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                تسلسل: سوق ← سنة ← ربع سنوي ← شهر — كل مستوى مغلق افتراضياً
              </p>
            </div>
            <div className="overflow-x-auto w-full min-w-0">
              <AnalyticsTable
                minWidth={780}
                headers={[
                  {
                    label: "سوق / سنة / ربع / شهر",
                    align: "right",
                    width: 160,
                  },
                  { label: "مبيعات العام الحالي", align: "center", width: 88 },
                  { label: "مبيعات العام السابق", align: "center", width: 88 },
                  { label: "الفرق", align: "center", width: 300 },
                  { label: "التغير%", align: "center", width: 88 },
                ]}
              >
                {yoyData.map((d) => {
                  const delta = d.ac - d.py;
                  const branchOpen = !!expandedCats[yoyKey.branch(d.branch)];
                  return (
                    <React.Fragment key={d.branch}>
                      <tr
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          setExpandedCats((p) => ({
                            ...p,
                            [yoyKey.branch(d.branch)]:
                              !p[yoyKey.branch(d.branch)],
                          }))
                        }
                      >
                        <td
                          style={{
                            ...analyticsTdBaseStyle("right"),
                            fontWeight: 700,
                            color: "var(--text-primary)",
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            {chevron(branchOpen)}
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                              style={{
                                background: "var(--bg-elevated)",
                                color: "var(--text-muted)",
                              }}
                            >
                              سوق
                            </span>
                            {d.branch}
                          </div>
                        </td>
                        <td style={analyticsTdBaseStyle("center")} dir="ltr">
                          {fmt(d.ac)}
                        </td>
                        <td style={analyticsTdBaseStyle("center")} dir="ltr">
                          {fmt(d.py)}
                        </td>
                        {renderYoyDeltaCell(delta)}
                        <td style={analyticsTdBaseStyle("center")}>
                          {renderPctCell(d.ac, d.py, false)}
                        </td>
                      </tr>
                      {branchOpen &&
                        d.years.map((y) => {
                          const yk = yoyKey.year(d.branch, y.year);
                          const yearOpen = !!expandedCats[yk];
                          const yDelta =
                            y.ac !== null ? (y.ac as number) - y.py : null;
                          const yPct =
                            y.ac !== null ? pct(y.ac as number, y.py) : null;
                          return (
                            <React.Fragment key={y.year}>
                              <tr
                                style={{
                                  cursor: "pointer",
                                  background: "var(--bg-elevated)",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedCats((p) => ({
                                    ...p,
                                    [yk]: !p[yk],
                                  }));
                                }}
                              >
                                <td
                                  style={{
                                    ...analyticsTdBaseStyle("right"),
                                    paddingInlineStart: 22,
                                    color: "var(--text-muted)",
                                    fontSize: 12,
                                  }}
                                >
                                  <div className="flex items-center gap-1.5">
                                    {chevron(yearOpen)}
                                    <span
                                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                      style={{
                                        background: "var(--bg-elevated)",
                                        color: "var(--text-muted)",
                                      }}
                                    >
                                      سنة
                                    </span>
                                    <span style={{ marginInlineEnd: 4 }}>
                                      ┃
                                    </span>
                                    {y.year}
                                  </div>
                                </td>
                                <td
                                  style={{
                                    ...analyticsTdBaseStyle("center"),
                                    color: "var(--text-muted)",
                                    fontSize: 12,
                                  }}
                                  dir="ltr"
                                >
                                  {fmt(y.py)}
                                </td>
                                <td
                                  style={{
                                    ...analyticsTdBaseStyle("center"),
                                    color: "var(--text-muted)",
                                    fontSize: 12,
                                  }}
                                  dir="ltr"
                                >
                                  {y.ac !== null ? fmt(y.ac as number) : ""}
                                </td>
                                {yDelta !== null ? (
                                  renderYoyDeltaCell(yDelta)
                                ) : (
                                  <td style={analyticsTdBaseStyle("center")} />
                                )}
                                <td style={analyticsTdBaseStyle("center")}>
                                  {yPct !== null &&
                                    renderPctCell(y.ac as number, y.py, true)}
                                </td>
                              </tr>
                              {yearOpen &&
                                y.quarters.map((q) => {
                                  const qk = yoyKey.quarter(
                                    d.branch,
                                    y.year,
                                    q.label,
                                  );
                                  const qOpen = !!expandedCats[qk];
                                  const qDelta =
                                    q.ac !== null ? q.ac - q.py : null;
                                  const qPct =
                                    q.ac !== null ? pct(q.ac, q.py) : null;
                                  return (
                                    <React.Fragment key={q.label}>
                                      <tr
                                        style={{
                                          cursor: "pointer",
                                          background: "rgba(0,0,0,0.02)",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedCats((p) => ({
                                            ...p,
                                            [qk]: !p[qk],
                                          }));
                                        }}
                                      >
                                        <td
                                          style={{
                                            ...analyticsTdBaseStyle("right"),
                                            paddingInlineStart: 40,
                                            color: "var(--text-secondary)",
                                            fontSize: 12,
                                          }}
                                        >
                                          <div className="flex items-center gap-1.5">
                                            {chevron(qOpen)}
                                            <span
                                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                              style={{
                                                background:
                                                  "var(--bg-elevated)",
                                                color: "var(--text-muted)",
                                              }}
                                            >
                                              ربع
                                            </span>
                                            <span
                                              style={{
                                                marginInlineEnd: 4,
                                                color: "var(--text-muted)",
                                              }}
                                            >
                                              ┃
                                            </span>
                                            {q.label}
                                          </div>
                                        </td>
                                        <td
                                          style={{
                                            ...analyticsTdBaseStyle("center"),
                                            fontSize: 12,
                                            color: "var(--text-secondary)",
                                          }}
                                          dir="ltr"
                                        >
                                          {fmt(q.py)}
                                        </td>
                                        <td
                                          style={{
                                            ...analyticsTdBaseStyle("center"),
                                            fontSize: 12,
                                            color: "var(--text-secondary)",
                                          }}
                                          dir="ltr"
                                        >
                                          {q.ac !== null ? fmt(q.ac) : ""}
                                        </td>
                                        {qDelta !== null ? (
                                          renderYoyDeltaCell(qDelta)
                                        ) : (
                                          <td
                                            style={analyticsTdBaseStyle(
                                              "center",
                                            )}
                                          />
                                        )}
                                        <td
                                          style={analyticsTdBaseStyle("center")}
                                        >
                                          {qPct !== null &&
                                            q.ac !== null &&
                                            renderPctCell(q.ac, q.py, true)}
                                        </td>
                                      </tr>
                                      {qOpen &&
                                        q.months.map((m) => {
                                          const mDelta =
                                            m.ac !== null ? m.ac - m.py : null;
                                          const mPct =
                                            m.ac !== null
                                              ? pct(m.ac, m.py)
                                              : null;
                                          return (
                                            <tr
                                              key={m.name}
                                              style={{
                                                background:
                                                  "var(--bg-elevated)",
                                              }}
                                            >
                                              <td
                                                style={{
                                                  ...analyticsTdBaseStyle(
                                                    "right",
                                                  ),
                                                  paddingInlineStart: 58,
                                                  color: "var(--text-muted)",
                                                  fontSize: 11,
                                                }}
                                              >
                                                <div className="flex items-center gap-1.5">
                                                  <span
                                                    style={{
                                                      display: "inline-block",
                                                      width: 14,
                                                    }}
                                                  />
                                                  <span
                                                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                                                    style={{
                                                      background:
                                                        "var(--bg-elevated)",
                                                      color:
                                                        "var(--text-muted)",
                                                    }}
                                                  >
                                                    شهر
                                                  </span>
                                                  <span
                                                    style={{
                                                      marginInlineEnd: 4,
                                                    }}
                                                  >
                                                    ┃
                                                  </span>
                                                  {m.name}
                                                </div>
                                              </td>
                                              <td
                                                style={{
                                                  ...analyticsTdBaseStyle(
                                                    "center",
                                                  ),
                                                  fontSize: 11,
                                                  color: "var(--text-muted)",
                                                }}
                                                dir="ltr"
                                              >
                                                {fmt(m.py)}
                                              </td>
                                              <td
                                                style={{
                                                  ...analyticsTdBaseStyle(
                                                    "center",
                                                  ),
                                                  fontSize: 11,
                                                  color: "var(--text-muted)",
                                                }}
                                                dir="ltr"
                                              >
                                                {m.ac !== null ? fmt(m.ac) : ""}
                                              </td>
                                              {mDelta !== null ? (
                                                renderYoyDeltaCell(mDelta)
                                              ) : (
                                                <td
                                                  style={analyticsTdBaseStyle(
                                                    "center",
                                                  )}
                                                />
                                              )}
                                              <td
                                                style={analyticsTdBaseStyle(
                                                  "center",
                                                )}
                                              >
                                                {mPct !== null &&
                                                  m.ac !== null && (
                                                    <div
                                                      className="flex items-center justify-center gap-1"
                                                      dir="ltr"
                                                    >
                                                      <span
                                                        className="text-[9px] font-semibold"
                                                        style={{
                                                          color:
                                                            mPct >= 0
                                                              ? "var(--accent-green)"
                                                              : "var(--accent-red)",
                                                        }}
                                                      >
                                                        {mPct >= 0 ? "+" : ""}
                                                        {mPct.toFixed(1)}
                                                      </span>
                                                      <span
                                                        style={{
                                                          width: 4,
                                                          height: 4,
                                                          borderRadius: "50%",
                                                          background:
                                                            mPct >= 0
                                                              ? "var(--accent-green)"
                                                              : "var(--accent-red)",
                                                          display:
                                                            "inline-block",
                                                        }}
                                                      />
                                                    </div>
                                                  )}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                    </React.Fragment>
                                  );
                                })}
                            </React.Fragment>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </AnalyticsTable>
            </div>
          </div>
        );
      })()}
      {/* ── تحليل المنتجات: حجم المبيعات + متوسط السعر ── */}
      {(() => {
        // إما عرض الفئات (مجموعة) أو المنتجات حسب الفئة المختارة
        const points: MetricsBubblePoint[] = [];

        if (basketPriceCategory) {
          // عرض المواد (المنتجات) لفئة واحدة، عبر الأسواق المحددة فقط
          BRANCH_PRODUCT_ANALYSIS.forEach((b) => {
            if (!basketPriceActiveBranches.includes(b.branch)) return;
            b.cats.forEach((c) => {
              if (c.name !== basketPriceCategory) return;
              c.products.forEach((p) => {
                const basketProfit = Number(
                  (p.atv * 0.24 + p.price * p.basket * 0.42).toFixed(2),
                );
                points.push({
                  key: `bp_prod_${b.branch}_${c.name}_${p.name}`,
                  label: `${p.name} — ${b.branch}`,
                  depth: 2,
                  xValue: p.vol,
                  yValue: p.price,
                  hasChildren: false,
                  open: false,
                  onClick: undefined,
                  vol: p.vol,
                  price: p.price,
                  basket: p.basket,
                  atv: p.atv,
                  basketProfit,
                });
              });
            });
          });
        } else {
          // عرض الفئات (مجموعة) — مع إمكانية تصفية الأسواق
          BRANCH_PRODUCT_ANALYSIS.forEach((b) => {
            if (!basketPriceActiveBranches.includes(b.branch)) return;
            b.cats.forEach((c) => {
              const basketProfit = Number(
                (c.atv * 0.24 + c.price * c.basket * 0.42).toFixed(2),
              );
              points.push({
                key: `bp_cat_${b.branch}_${c.name}`,
                label: c.name,
                depth: 1,
                xValue: c.basket,
                yValue: c.atv,
                hasChildren: true,
                open: false,
                onClick: () => setBasketPriceCategory(c.name),
                vol: c.vol,
                price: c.price,
                basket: c.basket,
                atv: c.atv,
                basketProfit,
              });
            });
          });
        }

        return (
          <div className="glass-panel p-0 overflow-hidden w-full">
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <ChartTitleFlagBadge flag="green" size="sm" />
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    تغير المبيعات حسب السعر
                  </h3>
                </div>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  الفئات حسب الأسواق • انقر على فئة لعرض المواد المرتبطة بها •
                  حجم الدائرة يمثل الربح التقديري
                </p>
              </div>

              {/* فلاتر الأسواق */}
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                {basketPriceCategory && (
                  <button
                    type="button"
                    className="mt-1 text-[9px] underline"
                    style={{ color: "var(--accent-blue)" }}
                    onClick={() => setBasketPriceCategory(null)}
                  >
                    الرجوع إلى عرض الفئات
                  </button>
                )}
                {BRANCH_PRODUCT_ANALYSIS.map((b) => {
                  const on = basketPriceActiveBranches.includes(b.branch);
                  return (
                    <button
                      key={b.branch}
                      type="button"
                      onClick={() => {
                        setBasketPriceActiveBranches((prev) => {
                          if (prev.length === BRANCH_PRODUCT_ANALYSIS.length) {
                            return [b.branch];
                          }
                          const set = new Set(prev);
                          if (set.has(b.branch)) {
                            if (set.size <= 1) return prev;
                            set.delete(b.branch);
                          } else {
                            set.add(b.branch);
                          }
                          return Array.from(set);
                        });
                      }}
                      className="px-2 py-0.5 rounded-full border transition-colors"
                      style={{
                        borderColor: on
                          ? "var(--accent-green)"
                          : "var(--border-subtle)",
                        background: on
                          ? "rgba(34,197,94,0.12)"
                          : "var(--bg-elevated)",
                        color: on ? "var(--accent-green)" : "var(--text-muted)",
                      }}
                    >
                      {b.branch}
                    </button>
                  );
                })}
              </div>
            </div>
            <MetricsBubblePlot
              points={points}
              xLabel="عدد المنتجات المباعة"
              yLabel="متوسط اسعار المنتجات"
              variant="blue"
              plotHeight={420}
              bubbleSizing="basketProfit"
              detailLabels={{
                vol: "عدد المنتجات المباعة",
                price: "متوسط اسعار المنتجات",
              }}
              entitySubtitle={(d) => (d === 2 ? "منتج" : "فئة")}
            />
          </div>
        );
      })()}

      {/* ── تغير المبيعات حسب السعر + صافي الأرباح حسب الفئة ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {(() => {
          // same bubble chart as above, but rendered inside grid column
          const pointsLocal: MetricsBubblePoint[] = [];
          if (basketPriceCategory) {
            BRANCH_PRODUCT_ANALYSIS.forEach((b) => {
              if (!basketPriceActiveBranches.includes(b.branch)) return;
              b.cats.forEach((c) => {
                if (c.name !== basketPriceCategory) return;
                c.products.forEach((p) => {
                  const basketProfit = Number(
                    (p.atv * 0.24 + p.price * p.basket * 0.42).toFixed(2),
                  );
                  pointsLocal.push({
                    key: `bp_prod_${b.branch}_${c.name}_${p.name}`,
                    label: `${p.name} — ${b.branch}`,
                    depth: 2,
                    xValue: p.vol,
                    yValue: p.price,
                    hasChildren: false,
                    open: false,
                    onClick: undefined,
                    vol: p.vol,
                    price: p.price,
                    basket: p.basket,
                    atv: p.atv,
                    basketProfit,
                  });
                });
              });
            });
          } else {
            BRANCH_PRODUCT_ANALYSIS.forEach((b) => {
              if (!basketPriceActiveBranches.includes(b.branch)) return;
              b.cats.forEach((c) => {
                const basketProfit = Number(
                  (c.atv * 0.24 + c.price * c.basket * 0.42).toFixed(2),
                );
                pointsLocal.push({
                  key: `bp_cat_${b.branch}_${c.name}`,
                  label: c.name,
                  depth: 1,
                  xValue: c.basket,
                  yValue: c.atv,
                  hasChildren: true,
                  open: false,
                  onClick: () => setBasketPriceCategory(c.name),
                  vol: c.vol,
                  price: c.price,
                  basket: c.basket,
                  atv: c.atv,
                  basketProfit,
                });
              });
            });
          }

          return (
            <div className="glass-panel p-0 w-full">
              <div
                className="flex items-center gap-4 px-5 py-3 border-b"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <ChartTitleFlagBadge flag="green" size="sm" />
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      تغير المبيعات حسب السعر
                    </h3>
                  </div>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    الفئات حسب الأسواق • انقر على فئة لعرض المواد المرتبطة بها •
                    حجم الدائرة يمثل الربح التقديري
                  </p>
                </div>

                {/* فلاتر الأسواق */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                  {basketPriceCategory && (
                    <button
                      type="button"
                      className="mt-1 text-[9px] underline"
                      style={{ color: "var(--accent-blue)" }}
                      onClick={() => setBasketPriceCategory(null)}
                    >
                      الرجوع إلى عرض الفئات
                    </button>
                  )}
                  <InlineMultiSelectDropdown
                    icon={MapPin}
                    label="الأسواق"
                    selectedValues={
                      basketPriceActiveBranches.length ===
                      BRANCH_PRODUCT_ANALYSIS.length
                        ? []
                        : basketPriceActiveBranches
                    }
                    options={[
                      { value: "all", label: "كل الأسواق" },
                      ...BRANCH_PRODUCT_ANALYSIS.map((b) => ({
                        value: b.branch,
                        label: b.branch,
                      })),
                    ]}
                    onChange={(values) => {
                      if (values.length === 0) {
                        setBasketPriceActiveBranches(
                          BRANCH_PRODUCT_ANALYSIS.map((b) => b.branch),
                        );
                      } else {
                        setBasketPriceActiveBranches(values);
                      }
                    }}
                    accent="var(--accent-green)"
                    manyLabel={(n) => `${n} أسواق`}
                  />
                </div>
              </div>
              <div style={{ overflow: "hidden" }}>
                <MetricsBubblePlot
                  points={pointsLocal}
                  xLabel="عدد المنتجات المباعة"
                  yLabel="متوسط اسعار المنتجات"
                  variant="blue"
                  plotHeight={420}
                  bubbleSizing="basketProfit"
                  detailLabels={{
                    vol: "عدد المنتجات المباعة",
                    price: "متوسط اسعار المنتجات",
                  }}
                  entitySubtitle={(d) => (d === 2 ? "منتج" : "فئة")}
                />
              </div>
            </div>
          );
        })()}

        <ChartCard
          title="صافي الأرباح حسب الفئة"
          titleFlag="green"
          subtitle="Net Profit by Category"
          option={profitByCategoryOption}
          height="500px"
          delay={1}
        />
      </div>

      {/* خريطة الفروع + صافي المبيعات عبر الزمن */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <BranchMap />
        <ChartCard
          title="صافي المبيعات عبر الزمن لكل فرع"
          titleFlag="green"
          subtitle="Net Sales Over Time by Branch"
          option={netSalesByBranchOption}
          height="420px"
          delay={2}
        />
      </div>

      {/* جدول التحليل التفصيلي — سوق / فئة / منتج */}
      <DrillDownTable />

      <EnterpriseTable
        title="دليل الفروع"
        titleFlag="green"
        columns={branchColumns}
        data={branches}
        pageSize={10}
      />
    </div>
  );
}
