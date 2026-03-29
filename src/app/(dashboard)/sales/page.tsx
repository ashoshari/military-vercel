"use client";

import "@/lib/echarts/register-bar-line-pie";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Building2,
  FileText,
} from "lucide-react";

const ChartCard = dynamic(() => import("@/components/ui/ChartCard"), {
  ssr: false,
  loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
});
import { buildThreeYearMonthQuarterYearXAxes } from "@/components/ui/ChartCard";
import {
  getMonthlySalesData,
  getProductData,
  type ProductData,
} from "@/lib/mockData";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import type { TableColumn } from "@/components/ui/EnterpriseTable";
import TreeDrillDown from "@/components/ui/TreeDrillDown";
import DrillDownTable from "@/components/ui/DrillDownTable";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";

const DRILL_YEARS = ["2023", "2024", "2025"] as const;
type DrillYear = (typeof DRILL_YEARS)[number];

export default function SalesPage() {
  const palette = useResolvedAnalyticsPalette();
  const salesData = useMemo(() => getMonthlySalesData(), []);
  const products = useMemo(() => getProductData(), []);
  const totalRevenue = salesData.reduce((a, b) => a + b.revenue, 0);
  const totalOrders = salesData.reduce((a, b) => a + b.orders, 0);
  const totalReturns = salesData.reduce((a, b) => a + b.returns, 0);
  const totalDiscount = Math.round(totalRevenue * 0.073);
  const totalCost = Math.round(totalRevenue * 0.65);

  const [selectedYear] = useState("2025");
  const [drillLevel, setDrillLevel] = useState<"year" | "quarter" | "month">(
    "month",
  );
  const [drillSeriesMode, setDrillSeriesMode] = useState<
    "both" | "sales" | "profit"
  >("both");
  /** عند «ربع»: أي سنوات تُعرض (لكل سنة الأربعة أرباع). */
  const [selectedQuarterYears, setSelectedQuarterYears] = useState<
    Set<DrillYear>
  >(() => new Set([...DRILL_YEARS]));
  /** عند «شهر»: أي أشهر تُعرض لكل عام (نفس الشهر من 2023 و2024 و2025). */
  const [selectedMonthIndices, setSelectedMonthIndices] = useState<Set<number>>(
    () => new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
  );

  const toggleQuarterYear = (y: DrillYear) => {
    setSelectedQuarterYears((prev) => {
      const next = new Set(prev);
      if (next.has(y)) {
        if (next.size <= 1) return next;
        next.delete(y);
      } else {
        next.add(y);
      }
      return next;
    });
  };

  const toggleMonthIndex = (mi: number) => {
    setSelectedMonthIndices((prev) => {
      const next = new Set(prev);
      if (next.has(mi)) {
        if (next.size <= 1) return next;
        next.delete(mi);
      } else {
        next.add(mi);
      }
      return next;
    });
  };

  const salesKPIs = [
    {
      icon: DollarSign,
      label: "تكلفة المواد",
      value: `${(totalCost / 1000000).toFixed(1)}M`,
      sublabel: "د.أ",
      color: "var(--accent-red)",
    },
    {
      icon: TrendingUp,
      label: "قيمة المبيعات",
      value: `${(totalRevenue / 1000000).toFixed(1)}M`,
      sublabel: "د.أ",
      color: "var(--accent-green)",
    },
    {
      icon: BarChart3,
      label: "قيمة الخصومات",
      value: `${(totalDiscount / 1000000).toFixed(2)}M`,
      sublabel: "د.أ",
      color: "var(--accent-amber)",
    },
    {
      icon: Building2,
      label: "عدد الفروع",
      value: "47",
      sublabel: "فرع نشط",
      color: "var(--accent-blue)",
    },
    {
      icon: FileText,
      label: "عدد الفواتير",
      value: totalOrders.toLocaleString("en-US"),
      sublabel: "فاتورة",
      color: "var(--accent-cyan)",
    },
    {
      icon: ShoppingCart,
      label: "متوسط السلة",
      value: `${Math.round(totalRevenue / totalOrders)}`,
      sublabel: "د.أ / فاتورة",
      color: "var(--accent-purple)",
    },
  ];

  // ── مقارنة سنوية: العام الحالي مقابل السابق ──
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  const currentYearData = salesData.map((d) => d.revenue);
  const previousYearData = currentYearData.map((v) =>
    Math.round(v * (0.85 + Math.random() * 0.1)),
  );

  const yoyComparisonOption = {
    xAxis: { type: "category" as const, data: months },
    yAxis: {
      type: "value" as const,
      axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
    },
    series: [
      {
        name: `${selectedYear}`,
        type: "bar",
        data: currentYearData,
        barWidth: 16,
        barGap: "20%",
        itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] },
      },
      {
        name: `${Number(selectedYear) - 1}`,
        type: "bar",
        data: previousYearData,
        barWidth: 16,
        itemStyle: { color: palette.primarySlate, borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "الفرق %",
        type: "line",
        yAxisIndex: 0,
        data: currentYearData.map(
          (v, i) =>
            Math.round(
              ((v - previousYearData[i]) / previousYearData[i]) * 100 * 100,
            ) / 100,
        ),
        lineStyle: {
          color: palette.primaryCyan,
          width: 2,
          type: "dashed" as const,
        },
        itemStyle: { color: palette.primaryCyan },
        tooltip: { valueFormatter: (v: number) => `${v}%` },
      },
    ],
    legend: {
      data: [`${selectedYear}`, `${Number(selectedYear) - 1}`, "الفرق %"],
      bottom: 0,
      left: "center",
      textStyle: { color: "var(--text-muted)" },
    },
  };

  // ── Drill-down: بيانات حسب المستوى (ثلاث سنوات: 2023–2025) ──
  const yearRevenueMultipliers: Record<DrillYear, number> = {
    "2023": 0.82,
    "2024": 0.92,
    "2025": 1,
  };
  const monthlyForYear = (y: (typeof DRILL_YEARS)[number]) =>
    currentYearData.map((v) => Math.round(v * yearRevenueMultipliers[y]));

  const drillData = useMemo(() => {
    if (drillLevel === "year") {
      const values = DRILL_YEARS.map((y) =>
        monthlyForYear(y).reduce((a, b) => a + b, 0),
      );
      return {
        labels: [...DRILL_YEARS],
        values,
        profits: values.map((v, i) => Math.round(v * [0.22, 0.25, 0.28][i])),
      };
    }
    if (drillLevel === "quarter") {
      const ys = [...selectedQuarterYears].sort() as DrillYear[];
      if (ys.length === 0) {
        return {
          labels: [] as string[],
          values: [] as number[],
          profits: [] as number[],
        };
      }
      const labels: string[] = [];
      const values: number[] = [];
      for (const y of ys) {
        const mv = monthlyForYear(y);
        for (let qi = 0; qi < 4; qi++) {
          const v = mv.slice(qi * 3, qi * 3 + 3).reduce((a, b) => a + b, 0);
          labels.push(`الربع ${qi + 1} ${y}`);
          values.push(v);
        }
      }
      const profits = values.map((v, idx) => {
        const qi = idx % 4;
        return Math.round(v * (0.24 + (qi % 4) * 0.018));
      });
      return { labels, values, profits };
    }
    const ms = [...selectedMonthIndices].sort((a, b) => a - b);
    if (ms.length === 0) {
      return {
        labels: [] as string[],
        values: [] as number[],
        profits: [] as number[],
      };
    }
    if (ms.length === 12) {
      const values = [...DRILL_YEARS].flatMap((y) => monthlyForYear(y));
      const profits = values.map((v, i) =>
        Math.round(v * (0.22 + (i % 12) * 0.004)),
      );
      const labels = [...DRILL_YEARS].flatMap((y) =>
        months.map((m) => `${m} ${y.slice(2)}`),
      );
      return { labels, values, profits };
    }
    const labels: string[] = [];
    const values: number[] = [];
    for (const mi of ms) {
      for (const y of DRILL_YEARS) {
        const mv = monthlyForYear(y);
        values.push(mv[mi]);
        labels.push(`${months[mi]} ${y.slice(2)}`);
      }
    }
    const profits = values.map((v, i) =>
      Math.round(v * (0.22 + (i % 3) * 0.004)),
    );
    return { labels, values, profits };
  }, [drillLevel, selectedQuarterYears, selectedMonthIndices, currentYearData]);

  /**
   * Year dividers in the gap between bar groups (beside green columns).
   * markLine width is in screen px — 1px hairline (use 2 if too faint on HiDPI).
   */
  const YEAR_SEP_LINE_WIDTH = 1;
  const YEAR_SEP_COLOR = "rgba(148, 163, 184, 0.55)";
  const yearSeparatorMarkLine = useMemo(() => {
    const nYears = DRILL_YEARS.length;
    const line = (xAxis: number) => ({ xAxis });
    const base = {
      silent: true,
      z: -1,
      symbol: "none" as const,
      label: { show: false },
      lineStyle: {
        color: YEAR_SEP_COLOR,
        width: YEAR_SEP_LINE_WIDTH,
        type: "solid" as const,
      },
    };
    if (drillLevel === "year") {
      return { ...base, data: [line(0.5), line(1.5)] };
    }
    if (drillLevel === "quarter") {
      const ny = selectedQuarterYears.size;
      if (ny === 0) return undefined;
      const data = [];
      for (let b = 0; b < ny - 1; b++) {
        data.push(line(b * 4 + 3.5));
      }
      return { ...base, data };
    }
    if (drillLevel === "month") {
      if (selectedMonthIndices.size === 12) {
        return { ...base, data: [line(11.5), line(23.5)] };
      }
      const nm = selectedMonthIndices.size;
      if (nm === 0) return undefined;
      const data = [];
      for (let b = 0; b < nm; b++) {
        for (let s = 0; s < nYears - 1; s++) {
          data.push(line(b * nYears + s + 0.5));
        }
      }
      return { ...base, data };
    }
    return undefined;
  }, [drillLevel, selectedQuarterYears, selectedMonthIndices]);

  const salesYAxis = {
    type: "value" as const,
    name: "المبيعات",
    min: 0,
    axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
  };
  const profitYAxis = {
    type: "value" as const,
    name: "الأرباح",
    min: 0,
    axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
  };
  const drillMonthHierarchy = drillLevel === "month";
  const drillXAxis = drillMonthHierarchy
    ? buildThreeYearMonthQuarterYearXAxes({
        monthNames: months,
        years: DRILL_YEARS,
      })
    : { type: "category" as const, data: drillData.labels };
  const drillGrid = drillMonthHierarchy
    ? {
        left: "6%" as const,
        right: "7%" as const,
        top: 28,
        bottom: 94,
        containLabel: false,
      }
    : {
        left: "5%" as const,
        right: "6%" as const,
        top: "14%",
        bottom: drillLevel === "quarter" ? "20%" : "18%",
        containLabel: true,
      };

  const salesBarSeries = {
    name: "المبيعات",
    type: "bar" as const,
    data: drillData.values,
    barWidth: drillLevel === "month" ? 6 : drillLevel === "quarter" ? 14 : 40,
    ...(drillLevel === "month" ? { barMaxWidth: 12 } : {}),
    itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] },
    ...(drillMonthHierarchy ? { xAxisIndex: 0 } : {}),
    ...(yearSeparatorMarkLine && drillSeriesMode !== "profit"
      ? { markLine: yearSeparatorMarkLine }
      : {}),
  };
  const profitLineSeries = {
    name: "الأرباح",
    type: "line" as const,
    yAxisIndex: drillSeriesMode === "both" ? 1 : 0,
    data: drillData.profits,
    lineStyle: { color: palette.primaryCyan, width: 2.5 },
    itemStyle: { color: palette.primaryCyan, borderWidth: 2 },
    symbol: "circle" as const,
    symbolSize: 8,
    smooth: true,
    areaStyle: { color: "rgba(8,145,178,0.08)" },
    ...(drillMonthHierarchy ? { xAxisIndex: 0 } : {}),
    ...(yearSeparatorMarkLine && drillSeriesMode === "profit"
      ? { markLine: yearSeparatorMarkLine }
      : {}),
  };

  const drillLegendBottom = drillMonthHierarchy ? 2 : 0;

  const drillDownOption =
    drillSeriesMode === "both"
      ? {
          xAxis: drillXAxis,
          yAxis: [salesYAxis, profitYAxis],
          series: [salesBarSeries, profitLineSeries],
          legend: {
            data: ["المبيعات", "الأرباح"],
            bottom: drillLegendBottom,
            left: "center",
            itemGap: 12,
            textStyle: { color: "#94a3b8", fontSize: 11 },
          },
          grid: drillGrid,
        }
      : drillSeriesMode === "sales"
        ? {
            xAxis: drillXAxis,
            yAxis: salesYAxis,
            series: [salesBarSeries],
            legend: {
              data: ["المبيعات"],
              bottom: drillLegendBottom,
              left: "center",
              itemGap: 12,
              textStyle: { color: "#94a3b8", fontSize: 11 },
            },
            grid: drillGrid,
          }
        : {
            xAxis: drillXAxis,
            yAxis: profitYAxis,
            series: [profitLineSeries],
            legend: {
              data: ["الأرباح"],
              bottom: drillLegendBottom,
              left: "center",
              itemGap: 12,
              textStyle: { color: "#94a3b8", fontSize: 11 },
            },
            grid: drillGrid,
          };

  // ── مبيعات مقابل أرباح حسب المنتج ──
  const salesVsProfitSlice = products.slice(0, 8);
  const salesVsProfitOption = {
    xAxis: {
      type: "category" as const,
      data: salesVsProfitSlice.map((p) =>
        p.nameAr.split(" ").slice(0, 2).join(" "),
      ),
      axisLabel: { rotate: 35, fontSize: 10 },
    },
    yAxis: [
      {
        type: "value" as const,
        name: "الكمية",
        axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
      },
      {
        type: "value" as const,
        name: "د.أ",
        axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
      },
    ],
    series: [
      {
        name: "الكمية المباعة",
        type: "bar",
        data: salesVsProfitSlice.map((p) => p.unitsSold),
        itemStyle: { color: palette.primaryBlue, borderRadius: [4, 4, 0, 0] },
        barWidth: 14,
        barGap: "12%",
      },
      {
        name: "قيمة البيع",
        type: "bar",
        yAxisIndex: 1,
        data: salesVsProfitSlice.map((p) => p.revenue),
        itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] },
        barWidth: 14,
        barGap: "12%",
      },
      {
        name: "الأرباح",
        type: "line",
        yAxisIndex: 1,
        data: salesVsProfitSlice.map((p) =>
          Math.round((p.revenue * p.margin) / 100),
        ),
        lineStyle: { color: palette.primaryGreen, width: 2 },
        itemStyle: { color: palette.primaryGreen },
      },
    ],
    legend: {
      data: ["الكمية المباعة", "قيمة البيع", "الأرباح"],
      bottom: 0,
      left: "center",
    },
    grid: { bottom: "9%" },
  };

  // ── شلال الإيرادات ──
  const waterfallOption = {
    xAxis: {
      type: "category" as const,
      data: [
        "إجمالي المبيعات",
        "التكاليف",
        "الخصومات",
        "المرتجعات",
        "صافي الربح",
      ],
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
    },
    series: [
      {
        type: "bar",
        data: [
          {
            value: totalRevenue,
            itemStyle: {
              color: palette.primaryGreen,
              borderRadius: [4, 4, 0, 0],
            },
          },
          {
            value: totalCost,
            itemStyle: {
              color: palette.primaryRed,
              borderRadius: [4, 4, 0, 0],
            },
          },
          {
            value: totalDiscount,
            itemStyle: {
              color: palette.primaryAmber,
              borderRadius: [4, 4, 0, 0],
            },
          },
          {
            value: totalReturns * 50,
            itemStyle: {
              color: palette.primaryRed,
              borderRadius: [4, 4, 0, 0],
            },
          },
          {
            value: totalRevenue - totalCost - totalDiscount - totalReturns * 50,
            itemStyle: {
              color: palette.primaryGreen,
              borderRadius: [4, 4, 0, 0],
            },
          },
        ],
        barWidth: 36,
      },
    ],
  };

  const prodColumns: TableColumn<ProductData>[] = [
    { key: "nameAr", header: "المنتج", sortable: true },
    { key: "categoryAr", header: "الفئة", sortable: true },
    {
      key: "price",
      header: "السعر",
      sortable: true,
      align: "right",
      format: "currency",
    },
    {
      key: "unitsSold",
      header: "الوحدات",
      sortable: true,
      align: "right",
      format: "number",
    },
    {
      key: "revenue",
      header: "الإيرادات",
      sortable: true,
      align: "right",
      format: "currency",
    },
    {
      key: "margin",
      header: "الهامش",
      sortable: true,
      align: "right",
      format: "percent",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <TrendingUp size={24} style={{ color: palette.primaryGreen }} />
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            أداء المبيعات
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          تحليل شامل للمبيعات — التقرير الأول
        </p>
      </motion.div>

      {/* 6 KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {salesKPIs.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="glass-panel p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} style={{ color: s.color }} />
              <span
                className="text-[10px] font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                {s.label}
              </span>
            </div>
            <p
              className="text-lg font-bold"
              style={{ color: s.color }}
              dir="ltr"
            >
              {s.value}
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {s.sublabel}
            </p>
          </motion.div>
        ))}
      </div>
      {/* Drill-Down */}
      <ChartCard
        title="صافي الأرباح والمبيعات حسب التاريخ"
        subtitle="انقر على المستوى للتعمق؛ عند «ربع» اختر السنوات المعروضة (أرباع كل سنة)؛ عند «شهر» اختر الشهور المعروضة (نفس الشهر من كل عام)"
        titleFlag="green"
        titleFlagNumber={2}
        headerExtra={
          <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
            <div className="flex items-center gap-0.5 flex-wrap justify-end">
              <span
                className="text-[9px] shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                المؤشر:
              </span>
              {(
                [
                  ["sales", "المبيعات"],
                  ["profit", "الأرباح"],
                  ["both", "كلاهما"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDrillSeriesMode(mode)}
                  className="px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
                  style={{
                    background:
                      drillSeriesMode === mode
                        ? "rgba(14,165,233,0.15)"
                        : "var(--bg-elevated)",
                    color:
                      drillSeriesMode === mode
                        ? palette.primaryCyan
                        : "var(--text-muted)",
                    border: `1px solid ${drillSeriesMode === mode ? palette.primaryCyan : "var(--border-subtle)"}`,
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
            <div className="flex items-center gap-0.5 flex-wrap justify-end">
              <span
                className="text-[9px] shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                المستوى:
              </span>
              {(
                [
                  ["year", "سنة"],
                  ["quarter", "ربع"],
                  ["month", "شهر"],
                ] as const
              ).map(([level, label]) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    setDrillLevel(level);
                    if (level === "quarter") {
                      setSelectedQuarterYears(new Set([...DRILL_YEARS]));
                    }
                    if (level === "month") {
                      setSelectedMonthIndices(
                        new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
                      );
                    }
                  }}
                  className="px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
                  style={{
                    background:
                      drillLevel === level
                        ? "var(--accent-green-dim)"
                        : "var(--bg-elevated)",
                    color:
                      drillLevel === level
                        ? "var(--accent-green)"
                        : "var(--text-muted)",
                    border: `1px solid ${drillLevel === level ? "var(--accent-green)" : "var(--border-subtle)"}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {drillLevel === "quarter" && (
              <div className="flex flex-col items-end gap-1 w-full sm:max-w-md">
                <div className="flex flex-wrap justify-end gap-1">
                  {DRILL_YEARS.map((y) => {
                    const on = selectedQuarterYears.has(y);
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => toggleQuarterYear(y)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors"
                        style={{
                          background: on
                            ? "var(--accent-green-dim)"
                            : "var(--bg-elevated)",
                          color: on
                            ? "var(--accent-green)"
                            : "var(--text-muted)",
                          border: `1px solid ${on ? "var(--accent-green)" : "var(--border-subtle)"}`,
                        }}
                        dir="ltr"
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {drillLevel === "month" && (
              <div className="flex flex-col items-end gap-1 w-full">
                <div className="flex flex-wrap justify-end gap-0.5 max-w-[min(100%,520px)]">
                  {months.map((m, mi) => {
                    const on = selectedMonthIndices.has(mi);
                    return (
                      <button
                        key={mi}
                        type="button"
                        onClick={() => toggleMonthIndex(mi)}
                        className="px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors leading-tight"
                        style={{
                          background: on
                            ? "var(--accent-green-dim)"
                            : "var(--bg-elevated)",
                          color: on
                            ? "var(--accent-green)"
                            : "var(--text-muted)",
                          border: `1px solid ${on ? "var(--accent-green)" : "var(--border-subtle)"}`,
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        }
        option={drillDownOption}
        height="300px"
        panelOverflow={drillMonthHierarchy ? "visible" : "hidden"}
      />

      {/* مبيعات مقابل أرباح + شلال */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="صافي الأرباح والمبيعات حسب التصنيف"
          subtitle="مقارنة حسب التصنيف"
          titleFlag="green"
          titleFlagNumber={1}
          option={salesVsProfitOption}
          height="340px"
          delay={2}
        />
        <ChartCard
          title="شلال الإيرادات"
          titleFlag="blue"
          subtitle="من إجمالي المبيعات إلى صافي الربح"
          option={waterfallOption}
          height="340px"
          delay={3}
        />
      </div>

      {/* ── Decomposition Tree Drill-Down ── */}
      <TreeDrillDown />

      {/* ── الجدول التفصيلي: سنة / ربع / شهر مع YoY وMoM ── */}
      <AnalyticsTableCard
        title="التحليل الزمني التفصيلي للمبيعات"
        flag="green"
        subtitles={
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            صافي المبيعات • صافي المبيعات YoY (العام السابق) • YoY% • MoM% • عدد
            الفواتير • هامش الربح
          </p>
        }
      >
        <AnalyticsTable
          headers={[
            { label: "السنة", align: "right" },
            { label: "الربع", align: "right" },
            { label: "الشهر", align: "right" },
            { label: "صافي المبيعات", align: "center" },
            { label: "صافي المبيعات YoY", align: "center" },
            { label: "نمو YoY%", align: "center" },
            { label: "نمو MoM%", align: "center" },
            { label: "عدد الفواتير", align: "center" },
            { label: "هامش الربح %", align: "center" },
          ]}
        >
          {(
            [
              {
                year: "2022",
                quarter: "الربع 1",
                month: "مارس",
                net: 2065,
                yoy: 61.51,
                mom: 62.73,
                invoices: 823,
                margin: 53.94,
              },
              {
                year: "2022",
                quarter: "الربع 1",
                month: "فبراير",
                net: 1513,
                yoy: 29.49,
                mom: 6.76,
                invoices: 614,
                margin: 60.93,
              },
              {
                year: "2022",
                quarter: "الربع 1",
                month: "يناير",
                net: 1418,
                yoy: 70.89,
                mom: null,
                invoices: 581,
                margin: 59.84,
              },
              {
                year: "2021",
                quarter: "الربع 1",
                month: "مارس",
                net: 1284,
                yoy: -29.39,
                mom: 30.47,
                invoices: 547,
                margin: 26.04,
              },
              {
                year: "2021",
                quarter: "الربع 1",
                month: "فبراير",
                net: 1665,
                yoy: 260.29,
                mom: 40.9,
                invoices: 515,
                margin: 27.83,
              },
              {
                year: "2021",
                quarter: "الربع 1",
                month: "يناير",
                net: 831,
                yoy: null,
                mom: null,
                invoices: 334,
                margin: 31.07,
              },
              {
                year: "2020",
                quarter: "الربع 1",
                month: "مارس",
                net: 1821,
                yoy: null,
                mom: 565.75,
                invoices: 649,
                margin: 2.24,
              },
              {
                year: "2020",
                quarter: "الربع 1",
                month: "فبراير",
                net: 273,
                yoy: null,
                mom: null,
                invoices: 113,
                margin: 1.49,
              },
            ] as {
              year: string;
              quarter: string;
              month: string;
              net: number;
              yoy: number | null;
              mom: number | null;
              invoices: number;
              margin: number;
            }[]
          ).map((row, i) => {
            const netYoyPrior =
              row.yoy != null && row.yoy !== -100
                ? Math.round(row.net / (1 + row.yoy / 100))
                : null;
            const rows = [
              {
                net: row.net,
                netYoyPrior: netYoyPrior ?? 0,
                invoices: row.invoices,
              },
            ];
            const maxNet = Math.max(
              ...[
                ...([2065, 1513, 1418, 1284, 1665, 831, 1821, 273] as number[]),
              ],
            );
            const maxInv = Math.max(
              ...([823, 614, 581, 547, 515, 334, 649, 113] as number[]),
            );
            return (
              <tr key={i}>
                <td
                  style={{
                    ...analyticsTdBaseStyle("right"),
                    fontSize: 11,
                    color: "var(--text-muted)",
                  }}
                >
                  {row.year}
                </td>
                <td
                  style={{
                    ...analyticsTdBaseStyle("right"),
                    fontSize: 11,
                    color: "var(--text-muted)",
                  }}
                >
                  {row.quarter}
                </td>
                <td
                  style={{
                    ...analyticsTdBaseStyle("right"),
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {row.month}
                </td>

                <AnalyticsBarCell
                  value={row.net}
                  max={maxNet}
                  color="#3b82f6"
                  text={row.net.toLocaleString("en-US")}
                />

                {netYoyPrior != null ? (
                  <AnalyticsBarCell
                    value={netYoyPrior}
                    max={maxNet}
                    color="#3b82f6"
                    text={netYoyPrior.toLocaleString("en-US")}
                  />
                ) : (
                  <td style={analyticsTdBaseStyle("center")}>
                    <span style={{ color: "var(--text-muted)", fontSize: 10 }}>
                      —
                    </span>
                  </td>
                )}

                <td style={analyticsTdBaseStyle("center")}>
                  {row.yoy != null ? (
                    <span
                      className="inline-flex items-center gap-0.5 text-xs font-semibold"
                      style={{
                        color:
                          row.yoy >= 0
                            ? "var(--accent-green)"
                            : "var(--accent-red)",
                      }}
                      dir="ltr"
                    >
                      {row.yoy >= 0 ? (
                        <TrendingUp size={10} />
                      ) : (
                        <TrendingDown size={10} />
                      )}
                      {row.yoy >= 0 ? "+" : ""}
                      {row.yoy.toFixed(2)}%
                    </span>
                  ) : (
                    <span
                      style={{ color: "var(--text-muted)", fontSize: "10px" }}
                    >
                      —
                    </span>
                  )}
                </td>
                <td style={analyticsTdBaseStyle("center")}>
                  {row.mom != null ? (
                    <span
                      className="inline-flex items-center gap-0.5 text-xs font-semibold"
                      style={{
                        color:
                          row.mom >= 0
                            ? "var(--accent-green)"
                            : "var(--accent-red)",
                      }}
                      dir="ltr"
                    >
                      {row.mom >= 0 ? (
                        <TrendingUp size={10} />
                      ) : (
                        <TrendingDown size={10} />
                      )}
                      {row.mom >= 0 ? "+" : ""}
                      {row.mom.toFixed(2)}%
                    </span>
                  ) : (
                    <span
                      style={{ color: "var(--text-muted)", fontSize: "10px" }}
                    >
                      —
                    </span>
                  )}
                </td>
                <AnalyticsBarCell
                  value={row.invoices}
                  max={maxInv}
                  color="#3b82f6"
                  text={row.invoices.toLocaleString("en-US")}
                />
                <td style={analyticsTdBaseStyle("center")}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                    dir="ltr"
                  >
                    {row.margin.toFixed(2)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </AnalyticsTable>
      </AnalyticsTableCard>

      {/* جدول التحليل التفصيلي — سوق / فئة / منتج */}
      <DrillDownTable />
    </div>
  );
}
