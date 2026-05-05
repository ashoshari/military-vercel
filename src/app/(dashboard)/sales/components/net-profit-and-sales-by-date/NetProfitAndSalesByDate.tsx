import { buildThreeYearMonthValueXAxes } from "@/components/ui/chartMonthQuarterYearXAxis";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { getMonthlySalesData } from "@/lib/mockData";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  DRILL_YEARS,
  YEAR_SEP_COLOR,
  YEAR_SEP_LINE_WIDTH,
  yearRevenueMultipliers,
} from "./utils/constants";
import { Skeleton } from "@/components/ui/SkeletonLoader";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <Skeleton variant="chart" />,
  },
);

const salesData = getMonthlySalesData();

const salesYAxis = {
  type: "value" as const,
  name: "المبيعات",
  position: "left" as const,
  min: 0,
  axisLine: { show: true, onZero: false },
  axisTick: { show: true }, // ✅ ADD
  splitLine: { show: true }, // ✅ ADD
  axisLabel: {
    formatter: (v: number) => `${(v / 1000000).toFixed(1)}M`,
  },
  nameLocation: "end",
  nameGap: 12,
  gridIndex: 0,
};

const profitYAxis = {
  type: "value" as const,
  name: "الأرباح",
  position: "right" as const,
  min: 0,
  axisLine: { show: true, onZero: false },
  axisTick: { show: true }, // ✅ ADD
  splitLine: { show: false }, // ✅ prevent clutter
  axisLabel: {
    formatter: (v: number) => `${(v / 1000000).toFixed(1)}M`,
  },
  nameLocation: "end",
  nameGap: 12,
  gridIndex: 0,
};

const NetProfitAndSalesByDate = () => {
  const [drillSeriesMode, setDrillSeriesMode] = useState<
    "both" | "sales" | "profit"
  >("both");
  const [drillLevel, setDrillLevel] = useState<"year" | "quarter" | "month">(
    "month",
  );
  /** عند «ربع»: أي أرباع تُعرض (عبر كل السنوات). 0 → الربع الأول ... 3 → الربع الرابع */
  const [selectedQuarters, setSelectedQuarters] = useState<Set<number>>(
    () => new Set([0, 1, 2, 3]),
  );

  /** عند «شهر»: أي أشهر تُعرض لكل عام (نفس الشهر من 2023 و2024 و2025). */
  const [selectedMonthIndices, setSelectedMonthIndices] = useState<Set<number>>(
    () => new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
  );
  const drillMonthHierarchy = drillLevel === "month";
  const drillLegendBottom = drillMonthHierarchy ? 2 : 0;
  const palette = useResolvedAnalyticsPalette();
  const monthIndexLabels = useMemo(
    () => Array.from({ length: 12 }, (_, i) => `شهر ${i + 1}`),
    [],
  );

  // ── Drill-down: بيانات حسب المستوى (ثلاث سنوات: 2023–2025) ──
  const drillData = useMemo(() => {
    const revenues = salesData.map((d) => d.revenue);
    const monthlyForYear = (y: (typeof DRILL_YEARS)[number]) =>
      revenues.map((v) => Math.round(v * yearRevenueMultipliers[y]));

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
      const qs = [...selectedQuarters].sort((a, b) => a - b);
      if (qs.length === 0) {
        return {
          labels: [] as string[],
          values: [] as number[],
          profits: [] as number[],
        };
      }
      const labels: string[] = [];
      const values: number[] = [];
      const quarterNames: [string, string, string, string] = [
        "الربع الأول",
        "الربع الثاني",
        "الربع الثالث",
        "الربع الرابع",
      ];
      for (const y of DRILL_YEARS) {
        const mv = monthlyForYear(y);
        for (const qi of qs) {
          const v = mv.slice(qi * 3, qi * 3 + 3).reduce((a, b) => a + b, 0);
          labels.push(quarterNames[qi]);
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
      const labels = [...DRILL_YEARS].flatMap(() => monthIndexLabels);
      return { labels, values, profits };
    }
    const labels: string[] = [];
    const values: number[] = [];
    for (const y of DRILL_YEARS) {
      for (const mi of ms) {
        const mv = monthlyForYear(y);
        values.push(mv[mi]);
        labels.push(monthIndexLabels[mi]);
      }
    }
    const profits = values.map((v, i) =>
      Math.round(v * (0.22 + (i % 3) * 0.004)),
    );
    return { labels, values, profits };
  }, [drillLevel, selectedQuarters, selectedMonthIndices, monthIndexLabels]);

  const yearSeparatorMarkLine = useMemo(() => {
    const line = (xAxis: number) => ({
      xAxis,
    });
    const base = {
      silent: true,
      z: 10, // 👈 IMPORTANT (bring to front)
      symbol: "none" as const,
      label: { show: false },
      lineStyle: {
        color: YEAR_SEP_COLOR,
        width: YEAR_SEP_LINE_WIDTH,
        type: "solid" as const,
      },
      xAxisIndex: 0, // 👈 THIS IS THE FIX
    };
    if (drillLevel === "year") {
      return { ...base, data: [line(0.5), line(1.5)] };
    }
    if (drillLevel === "quarter") {
      // عند مستوى «ربع» مع إمكانية إخفاء بعض الأرباع، تصبح فواصل السنوات أقل وضوحًا،
      // لذا نتخلى عن خطوط الفصل لتجنب إرباك بصري.
      return undefined;
    }
    if (drillLevel === "month") {
      const nm = selectedMonthIndices.size;
      if (nm === 0) return undefined;

      return {
        ...base,
        data: [line(nm - 0.5), line(nm * 2 - 0.5)],
      };
    }
    return undefined;
  }, [drillLevel, selectedMonthIndices]);

  const monthYearSeparatorPositions = useMemo(() => {
    if (drillLevel !== "month") return [];
    const monthCount = selectedMonthIndices.size;
    if (monthCount === 0) return [];
    return [monthCount - 0.5, monthCount * 2 - 0.5];
  }, [drillLevel, selectedMonthIndices]);

  const profitLineSeries = {
    name: "الأرباح",
    type: "line" as const,
    yAxisIndex: drillSeriesMode === "both" ? 1 : 0, // ✅ FIX
    data: drillData.profits.map((v, i) => [i, v]),
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

  const drillGrid = drillMonthHierarchy
    ? {
        left: "6%" as const,
        right: "7%" as const,
        top: 28,
        bottom: 110,
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
    data: drillData.values.map((v, i) => [i, v]),
    barWidth: drillLevel === "month" ? 6 : drillLevel === "quarter" ? 14 : 40,
    ...(drillLevel === "month" ? { barMaxWidth: 12 } : {}),
    itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] },
    ...(drillMonthHierarchy ? { xAxisIndex: 0 } : {}),
    ...(yearSeparatorMarkLine && drillSeriesMode !== "profit"
      ? { markLine: yearSeparatorMarkLine }
      : {}),
  };
  const drillXAxis = drillMonthHierarchy
    ? buildThreeYearMonthValueXAxes({
        monthNames: monthIndexLabels,
        years: DRILL_YEARS,
        xMax: drillData.values.length - 1,
        fullYear: selectedMonthIndices.size === 12,
        sortedMonthIndices: [...selectedMonthIndices].sort((a, b) => a - b),
        yearSeparatorPositions: monthYearSeparatorPositions,
        yearSeparatorColor: YEAR_SEP_COLOR,
        yearSeparatorWidth: YEAR_SEP_LINE_WIDTH,
      })
    : drillLevel === "quarter"
      ? [
          {
            type: "category" as const,
            position: "bottom" as const,
            data: drillData.labels,
            axisLabel: { interval: 0, fontSize: 10 },
            axisTick: { alignWithLabel: true },
          },
          {
            type: "category" as const,
            position: "bottom" as const,
            offset: 28,
            data: [...DRILL_YEARS],
            axisLine: { show: true, onZero: false },
            axisTick: { show: false },
            axisLabel: { interval: 0, fontSize: 10, fontWeight: 600 },
          },
        ]
      : { type: "category" as const, data: drillData.labels };
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

  return (
    <ChartCard
      title="صافي الأرباح والمبيعات حسب التاريخ"
      subtitle="انقر على المستوى للتعمق؛ عند «ربع» اختر السنوات المعروضة (أرباع كل سنة)؛ عند «شهر» اختر الشهور المعروضة (نفس الشهر من كل عام)"
      titleFlag="green"
      titleFlagNumber={1}
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
                  if (level === "month") {
                    setSelectedMonthIndices(
                      new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
                    );
                  }
                  if (level === "quarter") {
                    setSelectedQuarters(new Set([0, 1, 2, 3]));
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
                {(
                  [
                    ["الربع الأول", 0],
                    ["الربع الثاني", 1],
                    ["الربع الثالث", 2],
                    ["الربع الرابع", 3],
                  ] as const
                ).map(([label, qi]) => {
                  const on = selectedQuarters.has(qi);
                  return (
                    <button
                      key={qi}
                      type="button"
                      onClick={() => {
                        setSelectedQuarters((prev: Set<number>) => {
                          const next = new Set(prev);
                          if (next.has(qi)) {
                            if (next.size <= 1) return next;
                            next.delete(qi);
                          } else {
                            next.add(qi);
                          }
                          return next;
                        });
                      }}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors"
                      style={{
                        background: on
                          ? "var(--accent-green-dim)"
                          : "var(--bg-elevated)",
                        color: on ? "var(--accent-green)" : "var(--text-muted)",
                        border: `1px solid ${on ? "var(--accent-green)" : "var(--border-subtle)"}`,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {drillLevel === "month" && (
            <div className="flex flex-col items-end gap-1 w-full">
              <div className="flex flex-wrap justify-end gap-0.5 max-w-[min(100%,520px)]">
                {monthIndexLabels.map((label, mi) => {
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
                        color: on ? "var(--accent-green)" : "var(--text-muted)",
                        border: `1px solid ${on ? "var(--accent-green)" : "var(--border-subtle)"}`,
                      }}
                    >
                      {label}
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
    />
  );
};

export default NetProfitAndSalesByDate;
