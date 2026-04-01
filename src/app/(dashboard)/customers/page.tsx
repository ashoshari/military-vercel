"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-heatmap";
import "@/lib/echarts/register-scatter";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  UserCircle,
  ShoppingBag,
  Repeat,
  CreditCard,
  Clock,
} from "lucide-react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
import CustomerInsightsTable from "@/components/ui/CustomerInsightsTable";
import CustomerDataTable from "@/components/ui/CustomerDataTable";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";

export default function CustomersPage() {
  const palette = useResolvedAnalyticsPalette();
  const greenToRedScale = useMemo(
    () => [
      "#16a34a", // green
      "#84cc16", // lime
      "#facc15", // yellow
      "#fb923c", // orange
      "#ef4444", // red
      "#b91c1c", // dark red
    ],
    [],
  );

  const MARKETS = useMemo(
    () => ["سوق عمّان", "سوق إربد", "سوق الزرقاء", "سوق العقبة", "سوق الكرك"],
    [],
  );
  /** [] = كل الأسواق */
  const [activeMarkets, setActiveMarkets] = useState<string[]>([]);
  // ── Heatmap أوقات الذروة ──
  const hours = [
    "6ص",
    "7ص",
    "8ص",
    "9ص",
    "10ص",
    "11ص",
    "12م",
    "1م",
    "2م",
    "3م",
    "4م",
    "5م",
    "6م",
    "7م",
    "8م",
    "9م",
  ];
  const days = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  const heatmapData: number[][] = [];
  hours.forEach((_, hi) => {
    days.forEach((_, di) => {
      let val = 20 + Math.random() * 30;
      if (hi >= 4 && hi <= 8) val += 40; // 10am-2pm rush
      if (hi >= 11 && hi <= 13) val += 25; // 5pm-7pm rush
      if (di === 4) val -= 15; // Thursday less
      if (di === 5) val *= 0.5; // Friday
      heatmapData.push([hi, di, Math.round(Math.max(5, val))]);
    });
  });

  const heatmapOption = {
    // leave room for the vertical color ruler (visualMap) on the right
    grid: { left: "3%", right: "6%", top: "5%", bottom: "10%" },
    xAxis: {
      type: "category" as const,
      data: hours,
      splitArea: { show: true },
      axisLabel: { fontSize: 10 },
    },
    yAxis: {
      type: "category" as const,
      data: days,
      splitArea: { show: true },
      axisLabel: { fontSize: 10 },
    },
    visualMap: {
      min: 5,
      max: 95,
      calculable: true,
      orient: "vertical" as const,
      right: 0,
      top: "middle",
      itemHeight: 180,
      itemWidth: 14,
      inRange: { color: greenToRedScale },
      textStyle: { color: "var(--text-muted)" },
    },
    series: [
      {
        type: "heatmap",
        data: heatmapData,
        label: { show: true, fontSize: 9 },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.3)" },
        },
      },
    ],
  };

  // ── طريقة الدفع ──
  const paymentMethodOption = {
    tooltip: {
      trigger: "item" as const,
      formatter: (p: { name: string; value: number; percent: number }) =>
        `${p.name}: <b>${p.percent.toFixed(0)}%</b>`,
    },
    series: [
      {
        type: "pie",
        radius: ["45%", "70%"],
        center: ["50%", "45%"],
        data: [
          {
            name: "كاش",
            value: 38,
            itemStyle: { color: palette.primaryGreen },
          }, // green
          {
            name: "ذمم",
            value: 14,
            itemStyle: { color: "#f59e0b" },
          }, // amber
          { name: "فيزا", value: 24, itemStyle: { color: "#0ea5e9" } }, // cyan/blue
          {
            name: "كوبون",
            value: 10,
            itemStyle: { color: "#6366f1" },
          }, // indigo
          {
            name: "طلبات",
            value: 14,
            itemStyle: { color: "#94a3b8" },
          }, // muted slate
        ],
        label: {
          color: "#94a3b8",
          fontSize: 11,
          formatter: "{b}\n{d}%",
        },
        labelLine: { lineStyle: { color: "#334155" } },
      },
    ],
  };

  // ── استفادة من الخصومات والكوبونات ──
  const discountUsageOption = {
    xAxis: {
      type: "category" as const,
      data: Array.from({ length: 12 }, (_, i) => `شهر ${i + 1}`),
    },
    yAxis: [
      {
        type: "value" as const,
        name: "العملاء",
        axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
      },
      { type: "value" as const, name: "الاستفادة %" },
    ],
    series: [
      {
        name: "مستخدمي الخصومات",
        type: "bar",
        data: [
          12000, 14000, 18000, 15000, 16000, 22000, 20000, 19000, 24000, 21000,
          28000, 35000,
        ].map((v) => ({
          value: v,
          itemStyle: {
            color: palette.primaryGreen,
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barWidth: 18,
      },
      {
        name: "نسبة الاستفادة",
        type: "line",
        yAxisIndex: 1,
        data: [13, 15, 19, 16, 17, 24, 22, 21, 26, 23, 30, 38],
        lineStyle: { color: palette.primaryCyan, width: 2 }, // normalized cyan/blue
        itemStyle: { color: palette.primaryCyan },
      },
    ],
    legend: {
      data: ["مستخدمي الخصومات", "نسبة الاستفادة"],
      bottom: 0,
      left: "center",
    },
  };

  // ── قيمة الفاتورة ──
  const invoiceValueOption = {
    xAxis: {
      type: "category" as const,
      data: ["<20", "20-50", "50-100", "100-200", "200-500", "500+"],
    },
    yAxis: {
      type: "value" as const,
      name: "العملاء",
      axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
    },
    series: [
      {
        type: "bar",
        data: [8000, 22000, 32000, 18000, 9000, 3500].map((v, i) => ({
          value: v,
          itemStyle: {
            color: greenToRedScale[i % greenToRedScale.length],
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barWidth: 32,
      },
    ],
  };

  // ── Transaction Frequency vs ATV ──
  const txScatterData = useMemo(() => {
    const seedHash = (s: number) => {
      let h = s * 2654435761;
      h = ((h >>> 16) ^ h) * 0x45d9f3b;
      return ((h >>> 16) ^ h) >>> 0;
    };
    const out: (number | string)[][] = [];
    for (let i = 0; i < 200; i++) {
      const h = seedHash(i + 7);
      const totalTx = (h % 650) + 1;
      const atv =
        totalTx > 300
          ? 2 + (seedHash(i + 99) % 12)
          : totalTx > 100
            ? 3 + (seedHash(i + 55) % 30)
            : 5 + (seedHash(i + 33) % 130);
      const avgVal = (seedHash(i + 200) % 1880) / 1000;
      const sz = Math.max(4, Math.min(25, (seedHash(i + 300) % 20) + 4));
      const market = MARKETS[seedHash(i + 17) % MARKETS.length];
      out.push([totalTx, atv, avgVal, sz, market]);
    }
    return out;
  }, [MARKETS]);

  const filteredTxScatterData = useMemo(() => {
    if (activeMarkets.length === 0) return txScatterData;
    const set = new Set(activeMarkets);
    return txScatterData.filter((d) => set.has(d[4] as unknown as string));
  }, [activeMarkets, txScatterData]);

  const marketColors = useMemo(
    () => [
      palette.primaryGreen,
      palette.primaryCyan,
      "#3b82f6",
      "#a855f7",
      "#f59e0b",
    ],
    [palette.primaryCyan, palette.primaryGreen],
  );

  const txFreqOption = useMemo(() => {
    const selected: Record<string, boolean> = {};
    if (activeMarkets.length === 0) {
      MARKETS.forEach((m) => {
        selected[m] = true;
      });
    } else {
      const set = new Set(activeMarkets);
      MARKETS.forEach((m) => {
        selected[m] = set.has(m);
      });
    }

    return {
      grid: { left: "3%", right: "4%", top: "12%", bottom: "22%" },
      tooltip: {
        trigger: "item" as const,
        formatter: (p: { data: unknown }) => {
          const d = Array.isArray(p.data) ? p.data : [];
          const market = String(d[4] ?? "");
          return `${market}<br/>اجمالي قيمة الفواتير: <b>${d[0]}</b><br/>عدد الفواتير: <b>${d[1]}</b>`;
        },
      },
      legend: {
        data: MARKETS,
        bottom: 0,
        left: "center",
        selected,
        textStyle: { fontSize: 10, color: "var(--text-muted)" },
        itemWidth: 10,
        itemHeight: 10,
      },
      xAxis: {
        type: "value" as const,
        name: "اجمالي قيمة الفواتير",
        nameLocation: "center" as const,
        nameGap: 30,
        max: 700,
      },
      yAxis: {
        type: "value" as const,
        name: "عدد الفواتير",
        nameLocation: "center" as const,
        nameGap: 35,
        max: 140,
      },
      visualMap: {
        show: true,
        dimension: 2,
        min: 0,
        max: 1.88,
        calculable: true,
        orient: "horizontal" as const,
        left: "center",
        top: 0,
        inRange: { color: greenToRedScale },
        textStyle: { fontSize: 9, color: "var(--text-muted)" },
        formatter: (v: number) => `${v.toFixed(2)}K`,
      },
      series: MARKETS.map((m, i) => ({
        name: m,
        type: "scatter" as const,
        data: filteredTxScatterData.filter((d) => String(d[4]) === m),
        symbolSize: (d: unknown) => (Array.isArray(d) ? (d[3] as number) : 8),
        encode: { x: 0, y: 1 },
        itemStyle: { opacity: 0.78, color: marketColors[i % marketColors.length] },
      })),
    };
  }, [
    MARKETS,
    activeMarkets,
    filteredTxScatterData,
    greenToRedScale,
    marketColors,
  ]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <UserCircle size={24} style={{ color: "var(--accent-green)" }} />
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            سلوك العملاء
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          تحليل المستهلك: الفاتورة، الذروة، الخصومات، الدفع — التقرير الخامس
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          {
            icon: UserCircle,
            label: "إجمالي العملاء",
            value: "92.5K",
            color: "var(--accent-green)",
          },
          {
            icon: ShoppingBag,
            label: "متوسط الفاتورة",
            value: "133 د.أ",
            color: "var(--accent-cyan)",
          },
          {
            icon: Clock,
            label: "ساعة الذروة",
            value: "10-12 ص",
            color: "var(--accent-amber)",
          },
          {
            icon: Repeat,
            label: "معدل العودة",
            value: "89%",
            color: "var(--accent-blue)",
          },
          {
            icon: CreditCard,
            label: "الدفع النقدي",
            value: "45%",
            color: "var(--accent-green)",
          },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-4 text-center"
          >
            <s.icon
              size={18}
              className="mx-auto mb-2"
              style={{ color: s.color }}
            />
            <p className="text-lg font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p
              className="text-[10px] font-semibold mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>

      <CustomerDataTable />

      <ChartCard
        title="خريطة حرارية — أوقات الذروة"
        titleFlag="green"
        subtitle="كثافة العملاء حسب اليوم والساعة (Heatmap)"
        option={heatmapOption}
        height="340px"
        delay={1}
      />

      <ChartCard
        title="متوسط حجم السلة لكل سوق"
        titleFlag="green"
        subtitle="Transaction Frequency vs. Average Transaction Value"
        option={txFreqOption}
        headerExtra={
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
            <span
              className="font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              الأسواق:
            </span>
            <button
              type="button"
              onClick={() => setActiveMarkets([])}
              className="px-2 py-0.5 rounded-full border transition-colors"
              style={{
                borderColor:
                  activeMarkets.length === 0
                    ? "var(--accent-green)"
                    : "var(--border-subtle)",
                background:
                  activeMarkets.length === 0
                    ? "rgba(34,197,94,0.12)"
                    : "var(--bg-elevated)",
                color:
                  activeMarkets.length === 0
                    ? "var(--accent-green)"
                    : "var(--text-muted)",
              }}
            >
              كل الأسواق
            </button>
            {MARKETS.map((m) => {
              const on = activeMarkets.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setActiveMarkets((prev) => {
                      if (prev.length === 0) return [m];
                      const set = new Set(prev);
                      if (set.has(m)) set.delete(m);
                      else set.add(m);
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
                  {m}
                </button>
              );
            })}
          </div>
        }
        height="400px"
        delay={2}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="طريقة الدفع"
          subtitle="توزيع طرق الدفع للمستهلكين"
          option={paymentMethodOption}
          height="340px"
          delay={3}
        />
        <ChartCard
          title="توزيع قيمة الفاتورة"
          subtitle="عدد العملاء حسب قيمة الفاتورة (د.أ)"
          option={invoiceValueOption}
          height="340px"
          delay={4}
        />
      </div>

      <ChartCard
        title="استفادة من الخصومات والكوبونات"
        titleFlag="green"
        subtitle="عدد المستخدمين ونسبة الاستفادة الشهرية"
        option={discountUsageOption}
        headerExtra={
          <div
            className="mt-2 flex flex-wrap items-center gap-3 text-[10px]"
            style={{ color: "var(--text-muted)" }}
          >
            <span
              className="font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              الإيضاح:
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block rounded-sm"
                style={{
                  width: 14,
                  height: 10,
                  background: palette.primaryGreen,
                  border: "1px solid var(--border-subtle)",
                }}
              />
              <span>عدد المستخدمين (أعمدة)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block rounded-full"
                style={{
                  width: 14,
                  height: 3,
                  background: palette.primaryCyan,
                }}
              />
              <span>النسبة % (خط)</span>
            </span>
          </div>
        }
        height="300px"
        delay={5}
      />

      <CustomerInsightsTable />
    </div>
  );
}
