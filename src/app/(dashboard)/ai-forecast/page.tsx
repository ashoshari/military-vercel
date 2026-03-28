"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-gauge";
import dynamic from "next/dynamic";
import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
} from "lucide-react";

const ChartCard = dynamic(() => import("@/components/ui/ChartCard"), {
  ssr: false,
  loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
});
import AIBadge from "@/components/ui/AIBadge";

// ── بيانات التنبؤ اليومية ──
const forecastData = [
  { date: "2022/03/19", actual: 1893.0, predicted: 1887.85 },
  { date: "2022/03/20", actual: 2031.0, predicted: 2014.04 },
  { date: "2022/03/21", actual: 2212.0, predicted: 2221.9 },
  { date: "2022/03/22", actual: 1169.0, predicted: 1152.14 },
  { date: "2022/03/23", actual: 2521.0, predicted: 2500.04 },
  { date: "2022/03/24", actual: 7124.0, predicted: 7085.92 },
  { date: "2022/03/25", actual: 3355.0, predicted: 3349.1 },
  { date: "2022/03/26", actual: 5426.0, predicted: 5487.89 },
  { date: "2022/03/27", actual: 7496.0, predicted: 7405.95 },
  { date: "2022/03/28", actual: 4800.0, predicted: 4803.87 },
  { date: "2022/03/29", actual: 6016.0, predicted: 6038.24 },
  { date: "2022/03/30", actual: 4750.0, predicted: 4627.54 },
  { date: "2022/03/31", actual: 9502.0, predicted: 9542.88 },
];

const totalActual = forecastData.reduce((a, b) => a + b.actual, 0);
const totalPredicted = forecastData.reduce((a, b) => a + b.predicted, 0);
const maxActual = Math.max(...forecastData.map((d) => d.actual));
const maxPred = Math.max(...forecastData.map((d) => d.predicted));

// ── حساب MAD ──
const mad =
  (forecastData.reduce((a, b) => a + Math.abs(b.actual - b.predicted), 0) /
    forecastData.length /
    totalActual) *
  forecastData.length;
const accuracy = 99.03;

const fmtK = (n: number) => `${(n / 1000).toFixed(2)}K`;
const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

export default function AIForecastPage() {
  // ── خط المبيعات الفعلية والمتوقعة ──
  const lineOption = {
    tooltip: { trigger: "axis" as const },
    legend: {
      data: ["المبيعات الفعلية", "المبيعات المتوقعة"],
      top: 4,
      textStyle: { fontSize: 9 },
      itemWidth: 12,
      itemHeight: 8,
    },
    grid: { left: "4%", right: "4%", top: "16%", bottom: "12%" },
    xAxis: {
      type: "category" as const,
      data: forecastData.map((d) => d.date.slice(5)),
      axisLabel: { fontSize: 9, rotate: 20 },
      name: "التاريخ",
      nameLocation: "middle" as const,
      nameGap: 30,
      nameTextStyle: { fontSize: 10 },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
        fontSize: 9,
      },
      name: "المبيعات الفعلية والمتوقعة",
      nameTextStyle: { fontSize: 8 },
    },
    series: [
      {
        name: "المبيعات الفعلية",
        type: "line" as const,
        data: forecastData.map((d) => d.actual),
        lineStyle: { color: "#047857", width: 2 },
        itemStyle: { color: "#047857" },
        symbol: "circle",
        symbolSize: 5,
      },
      {
        name: "المبيعات المتوقعة",
        type: "line" as const,
        data: forecastData.map((d) => d.predicted),
        lineStyle: { color: "#3b82f6", width: 2, type: "dashed" as const },
        itemStyle: { color: "#3b82f6" },
        symbol: "diamond",
        symbolSize: 5,
      },
    ],
  };

  // ── مقياس الدقة (Gauge) ──
  const gaugeOption = {
    series: [
      {
        type: "gauge" as const,
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        radius: "90%",
        center: ["50%", "55%"],
        pointer: { show: false },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: { color: "#3b82f6" },
        },
        axisLine: {
          lineStyle: { width: 14, color: [[1, "var(--bg-elevated)"]] },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          show: true,
          fontSize: 8,
          distance: 20,
          formatter: (v: number) => (v === 0 ? "0%" : v === 100 ? "100%" : ""),
        },
        title: {
          show: true,
          offsetCenter: [0, "20%"],
          fontSize: 10,
          color: "var(--text-muted)",
        },
        detail: {
          fontSize: 20,
          fontWeight: "bold" as const,
          offsetCenter: [0, "-10%"],
          formatter: "{value}%",
          color: "#3b82f6",
        },
        data: [{ value: accuracy, name: "متوسط الدقة" }],
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* العنوان */}
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
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.2)",
              }}
            >
              <Brain size={20} style={{ color: "var(--accent-blue)" }} />
            </div>
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                توقع المبيعات AI
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                التقرير الحادي عشر — توقع مبيعات الأشهر القادمة باستخدام نماذج
                ذكاء اصطناعي
              </p>
            </div>
          </div>
        </div>
        <AIBadge label="ARIMA + XGBoost" size="md" confidence={99} />
      </motion.div>

      {/* الشارت + المؤشرات الجانبية */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* الشارت (3 أعمدة) */}
        <div className="xl:col-span-3">
          <ChartCard
            title="المبيعات الفعلية والمتوقعة حسب التاريخ"
            subtitle="Actual Sales and Predicted Sales by Date"
            option={lineOption}
            height="360px"
            aiPowered
            delay={1}
          />
        </div>

        {/* المؤشرات العمودية (عمود واحد) */}
        <div className="flex flex-col gap-4">
          {/* إجمالي المبيعات الفعلية */}
          <div className="glass-panel ai-module p-4 text-center">
            <div
              className="mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2"
              style={{ background: "rgba(4,120,87,0.1)" }}
            >
              <BarChart3 size={18} style={{ color: "var(--accent-green)" }} />
            </div>
            <p
              className="text-[10px] font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              إجمالي المبيعات الفعلية
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Actual Sales (Total)
            </p>
            <p
              className="text-xl font-bold mt-1"
              style={{ color: "var(--accent-green)" }}
              dir="ltr"
            >
              {fmtK(totalActual)}
            </p>
          </div>

          {/* إجمالي المبيعات المتوقعة */}
          <div className="glass-panel ai-module p-4 text-center">
            <div
              className="mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2"
              style={{ background: "rgba(37,99,235,0.1)" }}
            >
              <Target size={18} style={{ color: "var(--accent-blue)" }} />
            </div>
            <p
              className="text-[10px] font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              إجمالي المبيعات المتوقعة
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Predicted Sales (Total)
            </p>
            <p
              className="text-xl font-bold mt-1"
              style={{ color: "var(--accent-blue)" }}
              dir="ltr"
            >
              {fmtK(totalPredicted)}
            </p>
          </div>

          {/* MAD */}
          <div className="glass-panel ai-module p-4 text-center">
            <div
              className="mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2"
              style={{ background: "rgba(8,145,178,0.1)" }}
            >
              <TrendingUp size={18} style={{ color: "var(--accent-cyan)" }} />
            </div>
            <p
              className="text-[10px] font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              متوسط الانحراف المطلق
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Mean Absolute Deviation (MAD)
            </p>
            <p
              className="text-xl font-bold mt-1"
              style={{ color: "var(--accent-cyan)" }}
              dir="ltr"
            >
              0.01
            </p>
          </div>

          {/* مقياس الدقة */}
          <ChartCard
            title="متوسط الدقة"
            subtitle="Average of Accuracy"
            option={gaugeOption}
            height="180px"
            aiPowered
            delay={2}
          />
        </div>
      </div>

      {/* جدول التفاصيل */}
      <div className="glass-panel ai-module overflow-hidden">
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <h3
            className="text-sm font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            تفاصيل التوقع اليومي
          </h3>
          <p
            className="text-[10px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            المبيعات الفعلية مقابل المتوقعة — Actual vs Predicted Daily
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
                  "التاريخ",
                  "المبيعات الفعلية",
                  "المبيعات المتوقعة",
                  "الانحراف",
                  "فرق الانحراف",
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
              {[...forecastData].reverse().map((row, ri) => {
                const deviation =
                  ((row.actual - row.predicted) / row.actual) * 100;
                const devDiff = row.predicted - row.actual;
                const isUp = devDiff >= 0;
                const deviationAbs = Math.abs(deviation);

                return (
                  <tr
                    key={row.date}
                    className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    {/* التاريخ */}
                    <td
                      style={{
                        padding: "7px 12px",
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                      }}
                      dir="ltr"
                    >
                      {row.date}
                    </td>

                    {/* المبيعات الفعلية مع بار */}
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
                          width: `${(row.actual / maxActual) * 70}%`,
                          height: 16,
                          background: "#3b82f6",
                          opacity: 0.2,
                          borderRadius: 2,
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
                        {fmt(row.actual)}
                      </span>
                    </td>

                    {/* المبيعات المتوقعة مع بار */}
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
                          width: `${(row.predicted / maxPred) * 70}%`,
                          height: 16,
                          background: "#3b82f6",
                          opacity: 0.2,
                          borderRadius: 2,
                        }}
                      />
                      <span
                        style={{
                          position: "relative",
                          fontSize: 10,
                          fontWeight: 600,
                          color: "var(--accent-blue)",
                        }}
                        dir="ltr"
                      >
                        {fmt(row.predicted)}
                      </span>
                    </td>

                    {/* الانحراف (شريط أخضر) */}
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
                          width: `${Math.min(deviationAbs * 40, 70)}%`,
                          height: 16,
                          background: "#22c55e",
                          opacity: 0.25,
                          borderRadius: 2,
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
                        {deviationAbs.toFixed(2)}
                      </span>
                    </td>

                    {/* فرق الانحراف مع سهم */}
                    <td style={{ padding: "7px 12px", textAlign: "center" }}>
                      <div className="flex items-center justify-center gap-1">
                        {isUp ? (
                          <TrendingUp
                            size={11}
                            style={{ color: "var(--accent-green)" }}
                          />
                        ) : (
                          <TrendingDown
                            size={11}
                            style={{ color: "var(--accent-red)" }}
                          />
                        )}
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: isUp
                              ? "var(--accent-green)"
                              : "var(--accent-red)",
                          }}
                          dir="ltr"
                        >
                          {devDiff >= 0 ? "" : "-"}
                          {Math.abs((devDiff / row.actual) * 100).toFixed(2)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
