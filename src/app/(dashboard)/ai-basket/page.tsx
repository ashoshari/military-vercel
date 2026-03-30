"use client";

import "@/lib/echarts/register-bar-line-pie";
import dynamic from "next/dynamic";
import React from "react";
import { motion } from "framer-motion";
import { ShoppingBasket, Link2, Zap, TrendingUp, Hash } from "lucide-react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
import AIBadge from "@/components/ui/AIBadge";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";

const colors = [
  "#e11d48",
  "#dc2626",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f97316",
  "#22c55e",
  "#14b8a6",
  "#2563eb",
  "#6366f1",
  "#ec4899",
  "#0ea5e9",
  "#84cc16",
  "#a855f7",
  "#ef4444",
  "#d97706",
  "#0891b2",
  "#7c3aed",
];

// ── بيانات جدول قواعد الارتباط ──
const rules = [
  {
    basket: "جبنة → عصير",
    support: 0.371,
    confA: 22.65,
    confB: 22.79,
    lift: 8.88,
  },
  {
    basket: "حليب → عصير",
    support: 0.335,
    confA: 18.35,
    confB: 19.3,
    lift: 2.29,
  },
  {
    basket: "جبنة → حليب",
    support: 0.312,
    confA: 15.42,
    confB: 16.8,
    lift: 2.11,
  },
  {
    basket: "عصير → شامبو",
    support: 0.228,
    confA: 8.62,
    confB: 8.37,
    lift: 1.88,
  },
  {
    basket: "أرز → زيت نباتي",
    support: 0.222,
    confA: 6.54,
    confB: 6.36,
    lift: 1.88,
  },
  {
    basket: "سكر → عصير",
    support: 0.225,
    confA: 6.55,
    confB: 6.55,
    lift: 1.87,
  },
  {
    basket: "خبز → حليب",
    support: 0.223,
    confA: 6.34,
    confB: 6.57,
    lift: 1.87,
  },
  { basket: "عصير → بيض", support: 0.217, confA: 6.39, confB: 6.3, lift: 1.86 },
  { basket: "أرز → دجاج", support: 0.221, confA: 6.3, confB: 6.53, lift: 1.86 },
  { basket: "تونة → أرز", support: 0.219, confA: 6.2, confB: 6.48, lift: 1.85 },
  {
    basket: "مكرونة → كاتشب",
    support: 0.221,
    confA: 6.22,
    confB: 6.52,
    lift: 1.85,
  },
  {
    basket: "طحينة → لبنة",
    support: 0.221,
    confA: 8.24,
    confB: 6.52,
    lift: 1.84,
  },
  { basket: "زبدة → خبز", support: 0.22, confA: 6.48, confB: 6.23, lift: 1.84 },
  {
    basket: "صابون → شامبو",
    support: 0.218,
    confA: 6.22,
    confB: 6.48,
    lift: 1.83,
  },
];

export default function AIBasketPage() {
  const palette = useResolvedAnalyticsPalette();

  const topRulesByLift = [...rules]
    .sort((a, b) => b.lift - a.lift)
    .slice(0, 12);

  /** أقوى قواعد الارتباط — أشرطة أفقية حسب الرفع (بدلاً من شبكة القوى). */
  const associationLiftBarOption = {
    tooltip: {
      trigger: "axis" as const,
      axisPointer: { type: "shadow" as const },
      formatter: (params: unknown) => {
        const p = (Array.isArray(params) ? params[0] : params) as {
          name?: string;
          value?: number;
        };
        const name = p?.name ?? "";
        const v = p?.value ?? 0;
        return `<b>${name}</b><br/>الرفع (Lift): ${v.toFixed(2)}`;
      },
    },
    grid: {
      left: "4%",
      right: "10%",
      top: "10%",
      bottom: "6%",
      containLabel: true,
    },
    xAxis: {
      type: "value" as const,
      name: "الرفع",
      nameLocation: "middle" as const,
      nameGap: 28,
      nameTextStyle: { fontSize: 10, color: "#94a3b8" },
      axisLabel: { fontSize: 10, color: "#94a3b8" },
      splitLine: {
        lineStyle: { type: "dashed" as const, color: "rgba(148,163,184,0.2)" },
      },
    },
    yAxis: {
      type: "category" as const,
      data: topRulesByLift.map((r) => r.basket),
      inverse: true,
      axisLabel: {
        fontSize: 9,
        color: "#94a3b8",
        width: 100,
        overflow: "truncate" as const,
      },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    series: [
      {
        type: "bar" as const,
        data: topRulesByLift.map((r) => r.lift),
        barMaxWidth: 18,
        itemStyle: {
          color: palette.primaryGreen,
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: "right" as const,
          fontSize: 9,
          color: "#94a3b8",
          formatter: (x: { value: number }) => x.value.toFixed(2),
        },
      },
    ],
  };

  // ── الدعم والرفع حسب السلة (Scatter) ──
  const scatterColors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#3b82f6",
    "#a855f7",
    "#06b6d4",
    "#10b981",
    "#ec4899",
    "#14b8a6",
    "#8b5cf6",
  ];
  const scatterOption = {
    tooltip: {
      trigger: "item" as const,
      formatter: (p: any) =>
        `<b>${p.seriesName}</b><br/>الدعم: ${p.value[0].toFixed(2)}%<br/>الرفع: ${p.value[1].toFixed(2)}`,
    },
    legend: {
      data: rules.slice(0, 8).map((r) => r.basket),
      top: 4,
      left: "center",
      textStyle: { fontSize: 7 },
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 4,
    },
    grid: { left: "12%", right: "6%", top: "22%", bottom: "14%" },
    xAxis: {
      type: "value" as const,
      name: "الدعم (Support)",
      nameLocation: "middle" as const,
      nameGap: 28,
      nameTextStyle: { fontSize: 10, fontWeight: "bold" as const },
      axisLabel: { fontSize: 9 },
      splitLine: {
        lineStyle: { type: "dashed" as const, color: "var(--border-subtle)" },
      },
    },
    yAxis: {
      type: "value" as const,
      name: "الرفع (Lift)",
      nameLocation: "middle" as const,
      nameGap: 34,
      nameTextStyle: { fontSize: 10, fontWeight: "bold" as const },
      axisLabel: { fontSize: 9 },
      splitLine: {
        lineStyle: { type: "dashed" as const, color: "var(--border-subtle)" },
      },
    },
    series: rules.slice(0, 8).map((r, i) => ({
      name: r.basket,
      type: "scatter" as const,
      data: [[r.support * 100, r.lift]],
      symbolSize: 16 + r.lift * 3,
      itemStyle: { color: scatterColors[i], opacity: 0.85 },
    })),
  };

  /** توزيع المنتجات في السلة — مخطط دائري (بدلاً من شبكة ثانية). */
  const basketMixPieData = [
    { name: "حليب", value: 24 },
    { name: "خبز", value: 22 },
    { name: "أرز", value: 23 },
    { name: "دجاج", value: 20 },
    { name: "زيت", value: 19 },
    { name: "شامبو", value: 18 },
    { name: "بيض", value: 17 },
    { name: "صابون", value: 15 },
    { name: "تونة", value: 16 },
    { name: "سكر", value: 14 },
    { name: "مكرونة", value: 16 },
    { name: "معجون", value: 14 },
  ].map((d, i) => ({
    ...d,
    itemStyle: { color: colors[i % colors.length] },
  }));

  const basketMixPieOption = {
    tooltip: {
      trigger: "item" as const,
      formatter: (p: { name: string; value: number; percent: number }) =>
        `${p.name}<br/>${p.value} — ${p.percent.toFixed(1)}%`,
    },
    legend: {
      type: "scroll" as const,
      orient: "horizontal" as const,
      bottom: 0,
      left: "center",
      textStyle: { fontSize: 9, color: "#94a3b8" },
      itemWidth: 10,
      itemHeight: 8,
      pageIconColor: "#94a3b8",
    },
    series: [
      {
        type: "pie" as const,
        radius: ["38%", "62%"],
        center: ["50%", "46%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: "var(--bg-elevated)",
          borderWidth: 1,
        },
        label: { fontSize: 9, color: "#94a3b8" },
        emphasis: {
          itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.2)" },
          label: { show: true, fontWeight: "bold" as const },
        },
        data: basketMixPieData,
      },
    ],
  };

  const kpis = [
    {
      icon: Link2,
      label: "ارتباطات مكتشفة",
      value: "1,247",
      color: "var(--accent-green)",
    },
    {
      icon: TrendingUp,
      label: "أعلى رفع (Lift)",
      value: "8.88",
      color: "var(--accent-cyan)",
    },
    {
      icon: Hash,
      label: "قواعد ارتباط",
      value: "342",
      color: "var(--accent-blue)",
    },
    {
      icon: Zap,
      label: "رفع البيع المتقاطع",
      value: "+18.2%",
      color: "var(--accent-amber)",
    },
  ];

  const maxSupport = Math.max(...rules.map((r) => r.support));
  const maxLift = Math.max(...rules.map((r) => r.lift));

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="p-2 rounded-lg"
              style={{
                background: "var(--accent-cyan-dim)",
                border: "1px solid rgba(8,145,178,0.2)",
              }}
            >
              <ShoppingBasket
                size={20}
                style={{ color: "var(--accent-cyan)" }}
              />
            </div>
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                تحليل سلة السوق
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                قواعد الارتباط والرفع والدعم — Market Basket Analysis
              </p>
            </div>
          </div>
        </div>
        <AIBadge label="Apriori + FP-Growth" size="md" confidence={91} />
      </motion.div>

      {/* مؤشرات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel ai-module p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} style={{ color: s.color }} />
              <span
                className="text-[11px] font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                {s.label}
              </span>
            </div>
            <p className="text-lg font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* الشبكة + السكاتر */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="شبكة ارتباط المنتجات"
          subtitle="أقوى قواعد الارتباط حسب الرفع (Lift) — شريط أفقي"
          option={associationLiftBarOption}
          height="420px"
          aiPowered
          delay={1}
        />
        <ChartCard
          title="الدعم والرفع حسب السلة"
          subtitle="Support Basket and Lift by Basket"
          option={scatterOption}
          height="420px"
          aiPowered
          delay={2}
        />
      </div>

      {/* الشبكة الثانية + جدول القواعد */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="شبكة تحليل السلة"
          subtitle="توزيع المنتجات في السلة — مخطط دائري"
          option={basketMixPieOption}
          height="400px"
          aiPowered
          delay={3}
        />

        {/* جدول قواعد الارتباط */}
        <div className="glass-panel ai-module overflow-hidden">
          <div
            className="px-5 py-3 border-b"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <h3
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              قواعد الارتباط
            </h3>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              الدعم، الثقة، الرفع — Association Rules
            </p>
          </div>
          <div
            className="overflow-x-auto"
            style={{ maxHeight: 360, overflowY: "auto" }}
          >
            <table
              dir="rtl"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr
                  style={{
                    background: "var(--bg-elevated)",
                    borderBottom: "1px solid var(--border-subtle)",
                    position: "sticky" as const,
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  {[
                    "السلة",
                    "الدعم",
                    "ثقة المنتج الأول",
                    "ثقة المنتج الثاني",
                    "الرفع",
                  ].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "8px 10px",
                        textAlign: i === 0 ? "right" : "center",
                        fontSize: 9,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                        background: "var(--bg-elevated)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr
                    key={rule.basket}
                    className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    <td
                      style={{
                        padding: "6px 10px",
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rule.basket}
                    </td>
                    <td
                      style={{
                        padding: "6px 10px",
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
                          width: `${(rule.support / maxSupport) * 80}%`,
                          height: 14,
                          background: "#3b82f6",
                          opacity: 0.25,
                          borderRadius: 2,
                        }}
                      />
                      <span
                        style={{
                          position: "relative",
                          fontSize: 9.5,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                        }}
                        dir="ltr"
                      >
                        {(rule.support * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "6px 10px",
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
                          width: `${(rule.confA / 25) * 80}%`,
                          height: 14,
                          background: "#3b82f6",
                          opacity: 0.25,
                          borderRadius: 2,
                        }}
                      />
                      <span
                        style={{
                          position: "relative",
                          fontSize: 9.5,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                        }}
                        dir="ltr"
                      >
                        {rule.confA.toFixed(2)}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "6px 10px",
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
                          width: `${(rule.confB / 25) * 80}%`,
                          height: 14,
                          background: "#3b82f6",
                          opacity: 0.25,
                          borderRadius: 2,
                        }}
                      />
                      <span
                        style={{
                          position: "relative",
                          fontSize: 9.5,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                        }}
                        dir="ltr"
                      >
                        {rule.confB.toFixed(2)}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "6px 10px",
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
                          width: `${(rule.lift / maxLift) * 80}%`,
                          height: 14,
                          background: palette.primaryGreen,
                          opacity: 0.25,
                          borderRadius: 2,
                        }}
                      />
                      <span
                        style={{
                          position: "relative",
                          fontSize: 9.5,
                          fontWeight: 700,
                          color: "var(--accent-green)",
                        }}
                        dir="ltr"
                      >
                        {rule.lift.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
