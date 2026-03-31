"use client";

import "@/lib/echarts/register-bar-line-pie";
import dynamic from "next/dynamic";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Settings2,
  Truck,
  Package,
  Clock,
  CheckCircle,
  BarChart3,
  Undo2,
} from "lucide-react";
import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import MetricsBubblePlot, {
  type MetricsBubblePoint,
} from "@/components/ui/MetricsBubblePlot";
import { BRANCH_PRODUCT_ANALYSIS } from "@/lib/branchProductAnalysis";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";

export default function OperationsPage() {
  const palette = useResolvedAnalyticsPalette();
  const [activeBubbleBranches, setActiveBubbleBranches] = useState<string[]>(
    () => BRANCH_PRODUCT_ANALYSIS.map((b) => b.branch),
  );

  const operationalKPIs = [
    {
      icon: BarChart3,
      label: "الأرباح",
      value: "8.6M",
      sublabel: "صافي الأرباح",
      color: "var(--accent-green)",
    },
    {
      icon: Truck,
      label: "المبيعات",
      value: "24.6M",
      sublabel: "إجمالي المبيعات",
      color: "var(--accent-cyan)",
    },
    {
      icon: Undo2,
      label: "المرتجعات",
      value: "1.2M",
      sublabel: "قيمة المرتجعات",
      color: "var(--accent-red)",
    },
    {
      icon: Package,
      label: "الفواتير",
      value: "184.5K",
      sublabel: "عدد الفواتير",
      color: "var(--accent-blue)",
    },
    {
      icon: CheckCircle,
      label: "هامش الربح",
      value: "34.9%",
      sublabel: "متوسط الهامش",
      color: "var(--accent-green)",
    },
    {
      icon: Clock,
      label: "متوسط المعالجة",
      value: "2.4 س",
      sublabel: "وقت الطلب",
      color: "var(--accent-amber)",
    },
  ];

  // ── أسباب المرتجعات حسب المنتج ──
  const returnsReasonsOption = {
    xAxis: {
      type: "value" as const,
      name: "عدد المرتجعات",
      nameLocation: "middle" as const,
      nameGap: 32,
    },
    yAxis: {
      type: "category" as const,
      data: [
        "عيب تصنيع",
        "انتهاء صلاحية",
        "خطأ طلب",
        "تلف أثناء النقل",
        "عدم مطابقة",
        "أخرى",
      ],
      inverse: true,
    },
    series: [
      {
        type: "bar",
        data: [1200, 980, 750, 620, 450, 380].map((v, i) => ({
          value: v,
          itemStyle: {
            color: [
              "#dc2626",
              "#d97706",
              "#2563eb",
              "#7c3aed",
              "#0891b2",
              "#64748b",
            ][i],
            borderRadius: [0, 4, 4, 0],
          },
        })),
        barWidth: 16,
      },
    ],
  };

  // ── تحليل السلة الشرائية: عدد المواد وقيمتها ──
  const basketAnalysisOption = useMemo(
    () => ({
      xAxis: {
        type: "category" as const,
        data: [
          "1-3 مواد",
          "4-6 مواد",
          "7-10 مواد",
          "11-15 مواد",
          "16-20 مواد",
          "20+ مواد",
        ],
      },
      yAxis: [
        {
          type: "value" as const,
          name: "الفواتير",
          axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
        },
        {
          type: "value" as const,
          name: "متوسط القيمة",
          axisLabel: { formatter: (v: number) => `${v} د.أ` },
        },
      ],
      series: [
        {
          name: "عدد الفواتير",
          type: "bar",
          data: [45000, 52000, 38000, 24000, 15000, 10500].map((v) => ({
            value: v,
            itemStyle: {
              color: palette.primaryBlue,
              borderRadius: [4, 4, 0, 0],
            },
          })),
          barWidth: 28,
        },
        {
          name: "متوسط القيمة",
          type: "line",
          yAxisIndex: 1,
          data: [28, 65, 115, 178, 245, 380],
          lineStyle: { color: palette.primaryGreen, width: 2 },
          itemStyle: { color: palette.primaryGreen },
        },
      ],
      legend: {
        data: ["عدد الفواتير", "متوسط القيمة"],
        bottom: 0,
        left: "center",
      },
    }),
    [palette],
  );

  // ── المبيعات والقيمة لكل منتج ──
  const productPerformanceOption = useMemo(
    () => ({
      xAxis: {
        type: "category" as const,
        data: [
          "أرز",
          "زيت زيتون",
          "دجاج",
          "سكر",
          "حليب",
          "منظفات",
          "تونة",
          "حفاضات",
        ],
        axisLabel: { fontSize: 10 },
      },
      yAxis: [
        {
          type: "value" as const,
          name: "الوحدات",
          axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
        },
        {
          type: "value" as const,
          name: "القيمة",
          axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
        },
      ],
      series: [
        {
          name: "عدد الوحدات",
          type: "bar",
          data: [72000, 45000, 38000, 55000, 62000, 28000, 32000, 18000].map(
            (v) => ({
              value: v,
              itemStyle: { color: "#00d4ff", borderRadius: [4, 4, 0, 0] },
            }),
          ),
          barWidth: 16,
        },
        {
          name: "القيمة المادية",
          type: "bar",
          data: [
            360000, 315000, 285000, 110000, 93000, 196000, 128000, 234000,
          ].map((v) => ({
            value: v,
            itemStyle: {
              color: palette.primaryGreen,
              borderRadius: [4, 4, 0, 0],
            },
          })),
          barWidth: 16,
        },
      ],
      legend: {
        data: ["عدد الوحدات", "القيمة المادية"],
        bottom: 0,
        left: "center",
      },
    }),
    [palette],
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <Settings2 size={24} style={{ color: "var(--accent-green)" }} />
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            السلة
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          تحليل الأداء التشغيلي حسب الأسواق — التقرير الثالث
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {operationalKPIs.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="glass-panel p-4 text-center"
          >
            <kpi.icon
              size={20}
              className="mx-auto mb-2"
              style={{ color: kpi.color }}
            />
            <p
              className="text-xl font-bold"
              style={{ color: kpi.color }}
              dir="ltr"
            >
              {kpi.value}
            </p>
            <p
              className="text-[10px] font-semibold mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              {kpi.label}
            </p>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {kpi.sublabel}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="أسباب المرتجعات"
          subtitle="تحليل أسباب المرتجعات حسب النوع"
          option={returnsReasonsOption}
          height="320px"
          delay={2}
        />
        <ChartCard
          title="تحليل السلة الشرائية"
          subtitle="عدد المواد وقيمتها داخل السلة"
          option={basketAnalysisOption}
          height="320px"
          delay={3}
        />
      </div>

      <ChartCard
        title="عدد المبيعات والقيمة المادية"
        subtitle="لكل منتج — الوحدات المباعة مقابل القيمة"
        option={productPerformanceOption}
        height="320px"
        delay={4}
      />

      {(() => {
        // استخدم أسماء الفئات، مع إمكانية تصفية الأسواق
        const categoryPoints: MetricsBubblePoint[] = [];

        BRANCH_PRODUCT_ANALYSIS.forEach((b, bi) => {
          if (!activeBubbleBranches.includes(b.branch)) return;
          b.cats.forEach((c, ci) => {
            categoryPoints.push({
              key: `bs_cat_${bi}_${ci}`,
              label: c.name,
              depth: 1,
              xValue: c.basket,
              yValue: c.atv,
              hasChildren: false,
              open: false,
              onClick: undefined,
              vol: c.vol,
              price: c.price,
              basket: c.basket,
              atv: c.atv,
            });
          });
        });

        return (
          <div className="glass-panel p-0 overflow-hidden w-full">
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
                  مقارنة متوسط حجم السلة وقيمة الفاتورة
                </h3>
              </div>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                الفئات الرئيسية فقط • المحور الأفقي: متوسط حجم السلة • العمودي:
                متوسط قيمة الفاتورة (ATV)
              </p>
            </div>
            <MetricsBubblePlot
              points={categoryPoints}
              xLabel="متوسط السلة"
              yLabel="ATV"
              variant="green"
              plotHeight={420}
            />
            {/* فلاتر الأسواق */}
            <div className="px-5 pb-4 pt-0">
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {BRANCH_PRODUCT_ANALYSIS.map((b) => {
                  const on = activeBubbleBranches.includes(b.branch);
                  return (
                    <button
                      key={b.branch}
                      type="button"
                      onClick={() => {
                        setActiveBubbleBranches((prev) => {
                          // إذا كانت كلها مفعّلة ونقرنا على واحد → فعّل هذا فقط
                          if (prev.length === BRANCH_PRODUCT_ANALYSIS.length) {
                            return [b.branch];
                          }
                          const set = new Set(prev);
                          if (set.has(b.branch)) {
                            // لا تسمح بإلغاء آخر سوق لتفادي فراغ الرسم
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
          </div>
        );
      })()}
    </div>
  );
}
