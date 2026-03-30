"use client";

import "@/lib/echarts/register-bar-line-pie";
import dynamic from "next/dynamic";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  AlertTriangle,
  Hash,
  Ban,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import SectionTitleWithFlag from "@/components/ui/SectionTitleWithFlag";

// ── بيانات الفروع مع sub و sub al sub ──
const branchData = [
  {
    name: "سوق المنارة",
    netSales: 108000,
    transactions: 90,
    invoices: 88,
    voidCount: 14,
    atv: 1.91,
    subs: [
      {
        name: "أجهزة والكترونيات",
        netSales: 12000,
        transactions: 10,
        invoices: 10,
        voidCount: 2,
        atv: 1.2,
        products: [
          {
            name: 'شاشة سامسونج 32"',
            netSales: 6500,
            transactions: 5,
            invoices: 5,
            voidCount: 1,
            atv: 1.3,
          },
          {
            name: "مكيف سبليت 1.5طن",
            netSales: 5500,
            transactions: 5,
            invoices: 5,
            voidCount: 1,
            atv: 1.1,
          },
        ],
      },
      {
        name: "العناية الشخصية",
        netSales: 26823,
        transactions: 15832,
        invoices: 15800,
        voidCount: 11,
        atv: 5.05,
        products: [
          {
            name: "شامبو هيد آند شولدرز",
            netSales: 12400,
            transactions: 7800,
            invoices: 7780,
            voidCount: 5,
            atv: 4.8,
          },
          {
            name: "كريم نيفيا للجسم",
            netSales: 9200,
            transactions: 5100,
            invoices: 5090,
            voidCount: 4,
            atv: 5.2,
          },
          {
            name: "معجون أسنان كولجيت",
            netSales: 5223,
            transactions: 2932,
            invoices: 2930,
            voidCount: 2,
            atv: 5.3,
          },
        ],
      },
      {
        name: "غير مصنف",
        netSales: 60085,
        transactions: 18779,
        invoices: 18750,
        voidCount: 10,
        atv: 1.1,
        products: [
          {
            name: "منتج متنوع أ",
            netSales: 32000,
            transactions: 10000,
            invoices: 9990,
            voidCount: 5,
            atv: 1.1,
          },
          {
            name: "منتج متنوع ب",
            netSales: 28085,
            transactions: 8779,
            invoices: 8760,
            voidCount: 5,
            atv: 1.1,
          },
        ],
      },
    ],
  },
  {
    name: "فرفاشية",
    netSales: 108,
    transactions: 99,
    invoices: 98,
    voidCount: 0,
    atv: 1.7,
    subs: [
      {
        name: "مثلجات",
        netSales: 62,
        transactions: 55,
        invoices: 55,
        voidCount: 0,
        atv: 1.5,
        products: [
          {
            name: "مثلجات كيه دي دي",
            netSales: 62,
            transactions: 55,
            invoices: 55,
            voidCount: 0,
            atv: 1.5,
          },
        ],
      },
      {
        name: "سناكس",
        netSales: 46,
        transactions: 44,
        invoices: 43,
        voidCount: 0,
        atv: 1.9,
        products: [
          {
            name: "سناكس متنوعة",
            netSales: 46,
            transactions: 44,
            invoices: 43,
            voidCount: 0,
            atv: 1.9,
          },
        ],
      },
    ],
  },
  {
    name: "مستلزمات الأعمال",
    netSales: 398,
    transactions: 213,
    invoices: 210,
    voidCount: 0,
    atv: 1.7,
    subs: [
      {
        name: "قرطاسية",
        netSales: 230,
        transactions: 120,
        invoices: 118,
        voidCount: 0,
        atv: 1.8,
        products: [
          {
            name: "ورق طباعة A4",
            netSales: 130,
            transactions: 70,
            invoices: 69,
            voidCount: 0,
            atv: 1.9,
          },
          {
            name: "أقلام حبر جاف",
            netSales: 100,
            transactions: 50,
            invoices: 49,
            voidCount: 0,
            atv: 1.7,
          },
        ],
      },
      {
        name: "مستلزمات مكتبية",
        netSales: 168,
        transactions: 93,
        invoices: 92,
        voidCount: 0,
        atv: 1.6,
        products: [
          {
            name: "دبابيس ومشابك",
            netSales: 168,
            transactions: 93,
            invoices: 92,
            voidCount: 0,
            atv: 1.6,
          },
        ],
      },
    ],
  },
  {
    name: "مستلزمات منزلية",
    netSales: 27232,
    transactions: 13245,
    invoices: 13200,
    voidCount: 9,
    atv: 4.94,
    subs: [
      {
        name: "منظفات",
        netSales: 15400,
        transactions: 7200,
        invoices: 7180,
        voidCount: 5,
        atv: 4.7,
        products: [
          {
            name: "منظف أريال مسحوق",
            netSales: 8200,
            transactions: 3800,
            invoices: 3790,
            voidCount: 3,
            atv: 4.8,
          },
          {
            name: "صابون صحون فيري",
            netSales: 7200,
            transactions: 3400,
            invoices: 3390,
            voidCount: 2,
            atv: 4.6,
          },
        ],
      },
      {
        name: "أدوات",
        netSales: 11832,
        transactions: 6045,
        invoices: 6020,
        voidCount: 4,
        atv: 5.2,
        products: [
          {
            name: "ليف مطبخ",
            netSales: 5832,
            transactions: 3045,
            invoices: 3030,
            voidCount: 2,
            atv: 5.1,
          },
          {
            name: "قفازات مطبخ",
            netSales: 6000,
            transactions: 3000,
            invoices: 2990,
            voidCount: 2,
            atv: 5.3,
          },
        ],
      },
    ],
  },
  {
    name: "منتجات غذائية",
    netSales: 103743,
    transactions: 24168,
    invoices: 24100,
    voidCount: 3,
    atv: 4.61,
    subs: [
      {
        name: "أرز وحبوب",
        netSales: 42000,
        transactions: 9800,
        invoices: 9780,
        voidCount: 1,
        atv: 4.5,
        products: [
          {
            name: "أرز عنبر 5كجم",
            netSales: 22000,
            transactions: 5100,
            invoices: 5090,
            voidCount: 1,
            atv: 4.3,
          },
          {
            name: "أرز بسمتي 2كجم",
            netSales: 20000,
            transactions: 4700,
            invoices: 4690,
            voidCount: 0,
            atv: 4.7,
          },
        ],
      },
      {
        name: "زيوت وسكر",
        netSales: 35000,
        transactions: 8200,
        invoices: 8180,
        voidCount: 1,
        atv: 4.8,
        products: [
          {
            name: "زيت نباتي 1.8L",
            netSales: 20000,
            transactions: 4500,
            invoices: 4490,
            voidCount: 1,
            atv: 4.9,
          },
          {
            name: "سكر أبيض 2كجم",
            netSales: 15000,
            transactions: 3700,
            invoices: 3690,
            voidCount: 0,
            atv: 4.7,
          },
        ],
      },
      {
        name: "بهارات ومعلبات",
        netSales: 26743,
        transactions: 6168,
        invoices: 6140,
        voidCount: 1,
        atv: 4.5,
        products: [
          {
            name: "شاي ليبتون 100كيس",
            netSales: 14000,
            transactions: 3200,
            invoices: 3190,
            voidCount: 1,
            atv: 4.6,
          },
          {
            name: "طحينة 1000مل",
            netSales: 12743,
            transactions: 2968,
            invoices: 2950,
            voidCount: 0,
            atv: 4.4,
          },
        ],
      },
    ],
  },
  {
    name: "سوق سلاح الجو",
    netSales: 57934,
    transactions: 17117,
    invoices: 17050,
    voidCount: 3,
    atv: 3.88,
    subs: [
      {
        name: "منتجات غذائية",
        netSales: 31000,
        transactions: 9500,
        invoices: 9470,
        voidCount: 2,
        atv: 3.9,
        products: [
          {
            name: "أرز عنبر 5كجم",
            netSales: 16000,
            transactions: 4900,
            invoices: 4885,
            voidCount: 1,
            atv: 3.8,
          },
          {
            name: "زيت نباتي 1.8L",
            netSales: 15000,
            transactions: 4600,
            invoices: 4585,
            voidCount: 1,
            atv: 4.0,
          },
        ],
      },
      {
        name: "العناية الشخصية",
        netSales: 12488,
        transactions: 4209,
        invoices: 4190,
        voidCount: 1,
        atv: 4.77,
        products: [
          {
            name: "شامبو هيد آند شولدرز",
            netSales: 7200,
            transactions: 2400,
            invoices: 2390,
            voidCount: 1,
            atv: 4.8,
          },
          {
            name: "معجون أسنان كولجيت",
            netSales: 5288,
            transactions: 1809,
            invoices: 1800,
            voidCount: 0,
            atv: 4.7,
          },
        ],
      },
      {
        name: "مستلزمات منزلية",
        netSales: 14446,
        transactions: 3408,
        invoices: 3390,
        voidCount: 0,
        atv: 3.5,
        products: [
          {
            name: "مناديل كلينكس",
            netSales: 8000,
            transactions: 2000,
            invoices: 1990,
            voidCount: 0,
            atv: 3.6,
          },
          {
            name: "ليف مطبخ",
            netSales: 6446,
            transactions: 1408,
            invoices: 1400,
            voidCount: 0,
            atv: 3.4,
          },
        ],
      },
    ],
  },
];

const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toFixed(2);
const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

export default function TransactionsPage() {
  const palette = useResolvedAnalyticsPalette();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const totalNetSales = branchData.reduce((a, b) => a + b.netSales, 0);
  const totalTransactions = branchData.reduce((a, b) => a + b.transactions, 0);
  const totalInvoices = branchData.reduce((a, b) => a + b.invoices, 0);
  const totalVoids = branchData.reduce((a, b) => a + b.voidCount, 0);

  // ── Holiday Impact on Transaction Volume ──
  const days = Array.from({ length: 90 }, (_, i) => `Day ${i + 1}`);
  const holidayData = useMemo(
    () =>
      days.map((_, i) => {
        const base = 1800 + Math.sin(i * 0.15) * 400;
        const spike = [14, 28, 42, 58, 72, 85].includes(i)
          ? 4000 + Math.random() * 3000
          : 0;
        return Math.round(base + spike + Math.random() * 300);
      }),
    [],
  );

  const holidayOption = {
    tooltip: { trigger: "axis" as const },
    grid: { left: "8%", right: "4%", top: "8%", bottom: "10%" },
    xAxis: {
      type: "category" as const,
      data: days,
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: { type: "value" as const, axisLabel: { fontSize: 9 } },
    series: [
      {
        type: "line" as const,
        data: holidayData,
        smooth: false,
        showSymbol: false,
        lineStyle: { width: 1.5, color: "#3b82f6" },
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59,130,246,0.20)" },
              { offset: 1, color: "rgba(59,130,246,0.02)" },
            ],
          },
        },
      },
    ],
    dataZoom: [{ type: "inside" as const, start: 0, end: 100 }],
  };

  // ── Count of Transactions by Year & Branch ──
  const years = ["2020", "2021", "2022"];
  const yearData = [
    {
      year: "2020",
      branches: [
        { name: "سوق المنارة", val: 20257 },
        { name: "سوق سلاح الجو", val: 18400 },
        { name: "سوق العساكرة", val: 12300 },
      ],
    },
    {
      year: "2021",
      branches: [
        { name: "سوق المنارة", val: 14137 },
        { name: "سوق سلاح الجو", val: 16200 },
        { name: "سوق العساكرة", val: 10800 },
      ],
    },
    {
      year: "2022",
      branches: [
        { name: "سوق المنارة", val: 28000 },
        { name: "سوق سلاح الجو", val: 21000 },
        { name: "سوق العساكرة", val: 15500 },
      ],
    },
  ];
  const allBranchNames = ["سوق المنارة", "سوق سلاح الجو", "سوق العساكرة"];
  const branchColors = useMemo(
    () => [palette.primaryGreen, palette.primaryBlue, palette.primaryAmber],
    [palette],
  );

  const waterfallOption = {
    tooltip: { trigger: "axis" as const },
    legend: {
      data: allBranchNames,
      top: 6,
      left: "center",
      textStyle: { fontSize: 10 },
      itemWidth: 14,
      itemHeight: 10,
    },
    grid: { left: "8%", right: "4%", top: "18%", bottom: "8%" },
    xAxis: {
      type: "category" as const,
      data: years,
      axisLabel: { fontSize: 12, fontWeight: "bold" },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value" as const,
      min: 0,
      max: 30000,
      interval: 5000,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
        fontSize: 10,
      },
      splitLine: {
        lineStyle: { color: "var(--border-subtle)", type: "dashed" as const },
      },
    },
    series: allBranchNames.map((br, bi) => ({
      name: br,
      type: "bar" as const,
      barWidth: 32,
      barGap: "15%",
      data: yearData.map((yd) => {
        const found = yd.branches.find((b) => b.name === br);
        return {
          value: found?.val || 0,
          itemStyle: { color: branchColors[bi] },
        };
      }),
      label: {
        show: false,
      },
    })),
  };

  // ── Net Sales, Profit Value, % Profit Margin by Product Quantity ──
  const qBins = [
    "0-50",
    "51-100",
    "101-200",
    "201-500",
    "501-1K",
    "1K-5K",
    "5K-10K",
    "10K+",
  ];
  const qNetSales = [3500, 12000, 25000, 85000, 145000, 272000, 180000, 95000];
  const qProfit = [1200, 4100, 8500, 29000, 52000, 98000, 65000, 34000];
  const qAtv = [2.12, 3.45, 5.22, 8.9, 12.5, 18.15, 18.67, 18.12];

  const comboOption = {
    tooltip: { trigger: "axis" as const },
    legend: {
      data: ["صافي المبيعات", "قيمة الربح", "متوسط قيمة المعاملة (ATV)"],
      bottom: 0,
      textStyle: { fontSize: 8 },
    },
    grid: { left: "4%", right: "4%", top: "10%", bottom: "16%" },
    xAxis: {
      type: "category" as const,
      data: qBins,
      axisLabel: { fontSize: 9, rotate: 20 },
      name: "عدد القطع المباعة",
      nameLocation: "middle" as const,
      nameGap: 30,
      nameTextStyle: { fontSize: 9 },
    },
    yAxis: [
      {
        type: "value" as const,
        axisLabel: { formatter: (v: number) => fmtK(v), fontSize: 9 },
        name: "صافي المبيعات وقيمة الربح",
        nameTextStyle: { fontSize: 8 },
      },
      {
        type: "value" as const,
        axisLabel: { formatter: "{value}", fontSize: 9 },
        name: "ATV",
        nameTextStyle: { fontSize: 8 },
      },
    ],
    series: [
      {
        name: "صافي المبيعات",
        type: "bar" as const,
        data: qNetSales.map((v) => ({
          value: v,
          itemStyle: {
            color: palette.primaryGreen,
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barWidth: 18,
      },
      {
        name: "قيمة الربح",
        type: "bar" as const,
        data: qProfit.map((v) => ({
          value: v,
          itemStyle: { color: palette.primaryCyan, borderRadius: [4, 4, 0, 0] },
        })),
        barWidth: 18,
      },
      {
        name: "متوسط قيمة المعاملة (ATV)",
        type: "line" as const,
        yAxisIndex: 1,
        data: qAtv,
        lineStyle: { color: palette.primaryRed, width: 2 },
        itemStyle: { color: palette.primaryRed },
        smooth: true,
      },
    ],
  };

  const kpis = [
    {
      icon: DollarSign,
      label: "متوسط قيمة المعاملة (ATV)",
      value: "36.76",
      color: "var(--accent-green)",
      dim: "rgba(4,120,87,0.1)",
    },
    {
      icon: ShoppingCart,
      label: "متوسط حجم السلة",
      value: "27",
      color: "var(--accent-cyan)",
      dim: "rgba(8,145,178,0.1)",
    },
    {
      icon: Ban,
      label: "% Void Transaction Rate",
      value: "0.05%",
      color: "var(--accent-red)",
      dim: "rgba(220,38,38,0.1)",
    },
    {
      icon: Hash,
      label: "عدد المعاملات",
      value: "176K",
      color: "var(--accent-blue)",
      dim: "rgba(37,99,235,0.1)",
    },
    {
      icon: Receipt,
      label: "عدد الفواتير",
      value: fmtK(totalInvoices),
      color: "var(--accent-purple)",
      dim: "rgba(124,58,237,0.1)",
    },
    {
      icon: AlertTriangle,
      label: "عدد Void",
      value: String(totalVoids),
      color: "var(--accent-amber)",
      dim: "rgba(217,119,6,0.1)",
    },
    {
      icon: Package,
      label: "عدد المنتجات الملغية",
      value: "146",
      color: "var(--accent-red)",
      dim: "rgba(220,38,38,0.1)",
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
          <Receipt size={22} style={{ color: "var(--accent-blue)" }} />
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Transactions Dashboard
          </h1>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--accent-blue)" }}
            />
            <span
              className="text-[10px]"
              style={{ color: "var(--accent-blue)" }}
            >
              التقرير الثامن
            </span>
          </div>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          التغير في الأرباح والمبيعات — تحليل المعاملات، مقارنة الأداء بين
          السنوات، تحديد الأسواق الأعلى مبيعاً
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
            className="glass-panel p-4 relative overflow-hidden"
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

      {/* ── Holiday Impact + Waterfall ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="تأثير العطل على حجم المعاملات"
          subtitle="Holiday Impact on Transaction Volume"
          option={holidayOption}
          height="320px"
          delay={1}
        />
        <ChartCard
          title="عدد المعاملات حسب السنة والفرع"
          subtitle="Count of Transactions by Year & Branch Location"
          option={waterfallOption}
          height="320px"
          delay={2}
        />
      </div>

      {/* ── Combo chart ── */}
      <ChartCard
        title="صافي المبيعات وقيمة الربح وATV حسب عدد القطع المباعة"
        subtitle="Net Sales, Profit Value, % Profit Margin by Product Quantity (bins)"
        option={comboOption}
        height="340px"
        delay={1}
      />

      {/* ── جدول الفروع مع drill-down ── */}
      <div className="glass-panel overflow-hidden">
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <SectionTitleWithFlag title="تفاصيل المعاملات حسب الفرع" />
          <p
            className="text-[10px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Branch Transaction Details — فرع → فئة → منتج
          </p>
        </div>
        <div className="overflow-x-auto">
          <table
            dir="rtl"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--bg-elevated)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                {[
                  "الفرع / الفئة / المنتج",
                  "صافي المبيعات",
                  "عدد المعاملات",
                  "عدد الفواتير",
                  "عدد Void",
                  "ATV",
                ].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "9px 12px",
                      textAlign: i === 0 ? "right" : "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Calculate max values for bar scaling
                const allRows = branchData.flatMap((b) => [
                  b,
                  ...b.subs.flatMap((s) => [s, ...s.products]),
                ]);
                const maxNet = Math.max(...allRows.map((r) => r.netSales));
                const maxTx = Math.max(...allRows.map((r) => r.transactions));
                const maxInv = Math.max(...allRows.map((r) => r.invoices));
                const maxVoid = Math.max(
                  ...allRows
                    .filter((r) => r.voidCount > 0)
                    .map((r) => r.voidCount),
                  1,
                );

                const barCell = (
                  val: number,
                  max: number,
                  color: string,
                  isMoney = false,
                ) => (
                  <td
                    style={{
                      padding: "7px 12px",
                      textAlign: "center",
                      position: "relative" as const,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 4,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: `${Math.max(2, (val / max) * 85)}%`,
                        height: 16,
                        background: color,
                        opacity: 0.25,
                        borderRadius: 3,
                      }}
                    />
                    <span
                      style={{
                        position: "relative",
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                      dir="ltr"
                    >
                      {isMoney ? fmt(val) : fmt(val)}
                    </span>
                  </td>
                );

                return branchData.map((branch) => {
                  const brKey = `txb_${branch.name}`;
                  const isBrOpen = expandedRows.has(brKey);

                  return (
                    <React.Fragment key={branch.name}>
                      {/* صف الفرع */}
                      <tr
                        onClick={() => toggleRow(brKey)}
                        className="cursor-pointer hover:bg-white/[0.015] transition-colors"
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          background: isBrOpen
                            ? "rgba(4,120,87,0.04)"
                            : "transparent",
                        }}
                      >
                        <td
                          style={{
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
                                transform: isBrOpen
                                  ? "rotate(0deg)"
                                  : "rotate(-90deg)",
                              }}
                            >
                              <ChevronDown size={13} />
                            </span>
                            {branch.name}
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded"
                              style={{
                                background: "var(--bg-elevated)",
                                color: "var(--text-muted)",
                              }}
                            >
                              {branch.subs.length}
                            </span>
                          </div>
                        </td>
                        {barCell(branch.netSales, maxNet, "#3b82f6", true)}
                        {barCell(branch.transactions, maxTx, "#3b82f6")}
                        {barCell(branch.invoices, maxInv, "#3b82f6")}
                        {barCell(branch.voidCount, maxVoid, "#ef4444")}
                        <td
                          style={{
                            padding: "7px 12px",
                            textAlign: "center",
                            fontSize: 10,
                            color: "var(--accent-blue)",
                          }}
                          dir="ltr"
                        >
                          {branch.atv.toFixed(2)}
                        </td>
                      </tr>

                      {/* صفوف الفئات (sub) */}
                      <AnimatePresence initial={false}>
                        {isBrOpen &&
                          branch.subs.map((sub, si) => {
                            const subKey = `txs_${branch.name}_${sub.name}`;
                            const isSubOpen = expandedRows.has(subKey);
                            return (
                              <React.Fragment key={sub.name}>
                                <motion.tr
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{
                                    duration: 0.18,
                                    delay: si * 0.03,
                                  }}
                                  onClick={() => toggleRow(subKey)}
                                  className="cursor-pointer hover:bg-white/[0.015] transition-colors"
                                  style={{
                                    borderBottom:
                                      "1px solid var(--border-subtle)",
                                    background: isSubOpen
                                      ? "rgba(8,145,178,0.04)"
                                      : "rgba(4,120,87,0.02)",
                                  }}
                                >
                                  <td
                                    style={{
                                      padding: "6px 12px 6px 30px",
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
                                  {barCell(
                                    sub.netSales,
                                    maxNet,
                                    "#3b82f6",
                                    true,
                                  )}
                                  {barCell(sub.transactions, maxTx, "#3b82f6")}
                                  {barCell(sub.invoices, maxInv, "#3b82f6")}
                                  {barCell(sub.voidCount, maxVoid, "#ef4444")}
                                  <td
                                    style={{
                                      padding: "6px 12px",
                                      textAlign: "center",
                                      fontSize: 10,
                                      color: "var(--accent-blue)",
                                    }}
                                    dir="ltr"
                                  >
                                    {sub.atv.toFixed(2)}
                                  </td>
                                </motion.tr>

                                {/* صفوف المنتجات (sub al sub) */}
                                <AnimatePresence initial={false}>
                                  {isSubOpen &&
                                    sub.products.map((prod, pi) => (
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
                                            padding: "5px 12px 5px 50px",
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
                                        {barCell(
                                          prod.netSales,
                                          maxNet,
                                          "#3b82f6",
                                          true,
                                        )}
                                        {barCell(
                                          prod.transactions,
                                          maxTx,
                                          "#3b82f6",
                                        )}
                                        {barCell(
                                          prod.invoices,
                                          maxInv,
                                          "#3b82f6",
                                        )}
                                        {barCell(
                                          prod.voidCount,
                                          maxVoid,
                                          "#ef4444",
                                        )}
                                        <td
                                          style={{
                                            padding: "5px 12px",
                                            textAlign: "center",
                                            fontSize: 9.5,
                                            color: "var(--accent-blue)",
                                          }}
                                          dir="ltr"
                                        >
                                          {prod.atv.toFixed(2)}
                                        </td>
                                      </motion.tr>
                                    ))}
                                </AnimatePresence>
                              </React.Fragment>
                            );
                          })}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                });
              })()}
              {/* صف الإجمالي */}
              <tr
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  background: "var(--accent-green-dim)",
                  fontWeight: 700,
                }}
              >
                <td
                  style={{
                    padding: "8px 12px",
                    fontSize: 11,
                    color: "var(--accent-green)",
                  }}
                >
                  الإجمالي
                </td>
                <td
                  style={{
                    padding: "8px 12px",
                    textAlign: "center",
                    fontSize: 10,
                    color: "var(--accent-green)",
                  }}
                  dir="ltr"
                >
                  {fmt(totalNetSales)}
                </td>
                <td
                  style={{
                    padding: "8px 12px",
                    textAlign: "center",
                    fontSize: 10,
                    color: "var(--text-secondary)",
                  }}
                  dir="ltr"
                >
                  {fmt(totalTransactions)}
                </td>
                <td
                  style={{
                    padding: "8px 12px",
                    textAlign: "center",
                    fontSize: 10,
                    color: "var(--text-secondary)",
                  }}
                  dir="ltr"
                >
                  {fmt(totalInvoices)}
                </td>
                <td
                  style={{
                    padding: "8px 12px",
                    textAlign: "center",
                    fontSize: 10,
                    color: "var(--accent-red)",
                  }}
                  dir="ltr"
                >
                  {totalVoids}
                </td>
                <td
                  style={{
                    padding: "8px 12px",
                    textAlign: "center",
                    fontSize: 10,
                    color: "var(--accent-blue)",
                  }}
                  dir="ltr"
                >
                  {(totalNetSales / totalTransactions).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
