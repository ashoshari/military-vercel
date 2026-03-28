"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-scatter";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Percent,
  Layers,
} from "lucide-react";

const ChartCard = dynamic(() => import("@/components/ui/ChartCard"), {
  ssr: false,
  loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
});
import EnterpriseTable from "@/components/ui/EnterpriseTable";
import type { TableColumn } from "@/components/ui/EnterpriseTable";
import { getProductData, type ProductData } from "@/lib/mockData";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useThemeStore } from "@/store/themeStore";

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
const maxBottom = Math.max(...bottom10.map((p) => p.profit));

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
    bottom: "4%",
    top: "12%",
    left: "3%",
    right: "2%",
    containLabel: true,
  } as const;

  // ── مخطط صافي المبيعات حسب الفئة ──
  const salesByCatOption = {
    tooltip: { trigger: "axis" as const },
    grid: { ...productsStandardGrid },
    xAxis: {
      type: "category" as const,
      data: categories.map((c) => c.name),
      axisLabel: { rotate: 28, fontSize: 9 },
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
            color: {
              type: "linear" as const,
              x: 0,
              y: 1,
              x2: 0,
              y2: 0,
              colorStops: [
                { offset: 0, color: `${catColors[i]}22` },
                { offset: 1, color: catColors[i] },
              ],
            },
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
        data: categories.map((c) => [c.volume, c.margin, c.name]),
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
      textStyle: { fontSize: 8 },
      pageIconSize: 10,
    },
    grid: { ...productsStandardGrid },
    xAxis: {
      type: "category" as const,
      data: months,
      boundaryGap: false,
      axisLabel: { fontSize: 9 },
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
      name: p.name.length > 18 ? p.name.substring(0, 18) + "…" : p.name,
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
      textStyle: { fontSize: 8 },
      pageIconSize: 10,
    },
    grid: { ...productsStandardGrid },
    xAxis: {
      type: "category" as const,
      data: months,
      boundaryGap: false,
      axisLabel: { fontSize: 9 },
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
      name: p.name.length > 18 ? p.name.substring(0, 18) + "…" : p.name,
      type: "line" as const,
      data: p.trend,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: redTones[i] },
      itemStyle: { color: redTones[i] },
    })),
  };

  // ── مساهمة الأرباح والحجم ──
  const contribSorted = [...contrib].sort((a, b) => a.profit - b.profit);
  const contribOption = {
    tooltip: { trigger: "axis" as const },
    legend: {
      data: ["% حجم المبيعات", "% مساهمة الربح"],
      bottom: 0,
      textStyle: { fontSize: 9 },
    },
    grid: {
      left: "3%",
      right: "4%",
      top: "8%",
      bottom: "18%",
      containLabel: true,
    },
    xAxis: {
      type: "value" as const,
      axisLabel: { formatter: "{value}%", fontSize: 9 },
    },
    yAxis: {
      type: "category" as const,
      data: contribSorted.map((p) => p.name),
      axisLabel: { fontSize: 10 },
      axisLine: { show: false },
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
        data: contribSorted.map((p) => ({
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
        data: contribSorted.map((p) => ({
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
            `${contribSorted[params.dataIndex].profit.toFixed(2)}%`,
        },
      },
    ],
  };

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

  const maxProdMargin = useMemo(
    () => Math.max(...products.map((p) => p.margin), 1),
    [products],
  );

  const prodColumns: TableColumn<ProductData>[] = useMemo(
    () => [
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
        align: "center",
        format: "percent",
        analyticsBar: { max: maxProdMargin },
      },
    ],
    [maxProdMargin],
  );

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
            Product Performance Dashboard
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
          subtitle="Net Sales by Category"
          option={salesByCatOption}
          height="320px"
          delay={1}
        />
        <ChartCard
          title="حجم المبيعات مقابل هامش الربح"
          titleFlag="green"
          subtitle="Product Volume & % Profit Margin by Category"
          option={scatterOption}
          height="320px"
          delay={2}
        />
      </div>

      {/* ── أفضل 10 + أدنى 10 — حسب الشهر ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="أفضل 10 منتجات — اتجاه الربح الشهري"
          titleFlag="green"
          subtitle="Top 10 Products — Monthly Profit Trend"
          option={top10Option}
          height="380px"
          delay={1}
        />
        <ChartCard
          title="أدنى 10 منتجات — اتجاه الربح الشهري"
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
      <EnterpriseTable
        title="كتالوج المنتجات"
        columns={prodColumns}
        data={products}
        pageSize={10}
      />
    </div>
  );
}
