import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { ChevronDown, MapPin, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 340 }}>Loading chart...</div>,
  },
);

const BRANCHES = ["سوق المنارة", "سوق سلاح الجو", "سوق المدينة", "سوق الجبيهة"];
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];

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

function Dropdown({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  accent = "var(--accent-green)",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const display = options.find((o) => o.value === value)?.label ?? label;
  const isChanged = value !== options[0]?.value;

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
          maxWidth: 200,
        }}
      >
        <Icon size={12} style={{ color: accent }} />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 140,
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
            transition={{ duration: 0.13 }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              zIndex: 1050,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 8px 30px rgba(0,0,0,.45)",
              width: 220,
              overflow: "hidden",
            }}
          >
            <div style={{ maxHeight: 260, overflowY: "auto" }}>
              {options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 text-[11px] transition-colors hover:bg-white/5 block"
                  style={{
                    color: o.value === value ? accent : "var(--text-secondary)",
                    fontWeight: o.value === value ? 700 : 500,
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const stableHash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

function buildTotalsForBranch(branch: string) {
  // deterministic, realistic-ish yearly counts
  const base = 12000 + (stableHash(`tx_base_${branch}`) % 15000);
  return YEARS.map((y, i) => {
    const drift = ((stableHash(`tx_d_${branch}_${y}`) % 4200) - 1800) | 0;
    const season = Math.round(base * (1 + i * 0.045));
    return Math.max(1200, season + drift);
  });
}

function splitYearToQuarters(total: number, key: string): number[] {
  // stable 4-way split that sums to total
  const h = stableHash(key);
  const a = 18 + (h % 32);
  const b = 18 + ((h >>> 7) % 32);
  const c = 18 + ((h >>> 14) % 32);
  const s = a + b + c;
  const d = Math.max(1, 100 - s);
  const raw = [a, b, c, d];
  const sum = raw.reduce((x, n) => x + n, 0) || 1;
  const q = raw.map((n) => Math.round((n / sum) * total));
  const drift = total - q.reduce((x, n) => x + n, 0);
  q[0] += drift;
  return q;
}

function toWaterfallSteps(labels: string[], totals: number[]) {
  // Steps look like: [Total0, Δ1, Total1, Δ2, Total2 ...]
  const x: string[] = [];
  const stepKind: ("total" | "delta")[] = [];
  const values: number[] = [];
  for (let i = 0; i < totals.length; i++) {
    x.push(labels[i] ?? `${i + 1}`);
    stepKind.push("total");
    values.push(totals[i] ?? 0);
    if (i < totals.length - 1) {
      x.push(`${labels[i + 1] ?? ""}`.trim());
      stepKind.push("delta");
      values.push((totals[i + 1] ?? 0) - (totals[i] ?? 0));
    }
  }
  return { x, stepKind, values };
}

export default function TransactionsCountWaterfall() {
  const palette = useResolvedAnalyticsPalette();
  const [branch, setBranch] = useState<string>(BRANCHES[0] ?? "");
  const [period, setPeriod] = useState<"سنوي" | "ربعي">("سنوي");
  const [yearPick, setYearPick] = useState<number>(2025);

  const option = useMemo(() => {
    const totals = buildTotalsForBranch(branch);

    const viewLabels =
      period === "سنوي"
        ? YEARS.map(String)
        : ["ربع 1", "ربع 2", "ربع 3", "ربع 4"];

    const viewTotals =
      period === "سنوي"
        ? totals
        : splitYearToQuarters(
            totals[YEARS.indexOf(yearPick)] ?? totals.at(-1) ?? 0,
            `q_${branch}_${yearPick}`,
          );

    const { x, stepKind, values } = toWaterfallSteps(viewLabels, viewTotals);

    // Build stacked waterfall: helper (invisible) + delta (green/red) + total (blue)
    const helper: number[] = [];
    const inc: number[] = [];
    const dec: number[] = [];
    const totalBars: (number | null)[] = [];

    let running = 0;
    for (let i = 0; i < values.length; i++) {
      const kind = stepKind[i];
      if (kind === "total") {
        helper.push(0);
        inc.push(0);
        dec.push(0);
        totalBars.push(values[i]);
        running = values[i];
      } else {
        const d = values[i];
        helper.push(Math.min(running, running + d));
        inc.push(d > 0 ? d : 0);
        dec.push(d < 0 ? -d : 0);
        totalBars.push(null);
        running = running + d;
      }
    }

    const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

    return {
      tooltip: {
        trigger: "axis" as const,
        axisPointer: { type: "shadow" as const },
        backgroundColor: "#1a2035",
        borderColor: "#1e293b",
        textStyle: { color: "#e2e8f0", fontSize: 10 },
        formatter: (
          params: Array<{
            seriesName: string;
            data: number | null;
            axisValueLabel?: string;
          }>,
        ) => {
          const total = params.find((p) => p.seriesName === "إجمالي")?.data;
          const incV = params.find((p) => p.seriesName === "إرتفاع")?.data ?? 0;
          const decV = params.find((p) => p.seriesName === "إنخفاض")?.data ?? 0;
          const netDelta = (incV ?? 0) - (decV ?? 0);
          const title = params[0]?.axisValueLabel ?? "";

          if (typeof total === "number") {
            return `<b style="color:${palette.primaryBlue}">${title}</b><br/>عدد المعاملات: ${fmt(
              total,
            )}`;
          }
          const color =
            netDelta >= 0 ? palette.primaryGreen : palette.primaryRed;
          return `<b style="color:${color}">${title}</b><br/>التغير: ${netDelta >= 0 ? "+" : "-"}${fmt(
            Math.abs(netDelta),
          )}`;
        },
      },
      legend: {
        data: ["إرتفاع", "إنخفاض", "إجمالي"],
        bottom: 0,
        left: "center",
        textStyle: { color: "var(--text-muted)", fontSize: 10 },
      },
      grid: {
        top: "12%",
        bottom: "18%",
        left: "8%",
        right: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category" as const,
        data: x,
        axisLabel: { fontSize: 9, color: "#94a3b8", interval: 0, rotate: 0 },
        axisLine: { lineStyle: { color: "#334155" } },
      },
      yAxis: {
        type: "value" as const,
        name: "عدد المعاملات",
        nameLocation: "end" as const,
        nameGap: 10,
        nameTextStyle: { color: "#64748b", fontSize: 10 },
        axisLabel: { fontSize: 9, color: "#64748b" },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      series: [
        {
          name: "helper",
          type: "bar",
          stack: "wf",
          data: helper,
          itemStyle: { color: "transparent" },
          emphasis: { itemStyle: { color: "transparent" } },
          silent: true,
        },
        {
          name: "إرتفاع",
          type: "bar",
          stack: "wf",
          data: inc,
          itemStyle: {
            color: palette.primaryGreen,
          },
          barWidth: 45,
        },
        {
          name: "إنخفاض",
          type: "bar",
          stack: "wf",
          data: dec,
          itemStyle: { color: palette.primaryRed },
          barWidth: 45,
        },
        {
          name: "إجمالي",
          type: "bar",
          data: totalBars,
          itemStyle: { color: palette.primaryBlue },
          barWidth: 45,
        },
      ],
    };
  }, [
    branch,
    palette.primaryBlue,
    palette.primaryGreen,
    palette.primaryRed,
    period,
    yearPick,
  ]);

  return (
    <ChartCard
      title="عدد المعاملات حسب السنة/الربع والفرع"
      titleFlag="blue"
      subtitle="عدد المعاملات حسب السنة / الربع وموقع الفرع"
      option={option}
      height="360px"
      delay={2}
      headerExtra={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-1">
            {(["سنوي", "ربعي"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className="px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
                style={{
                  background:
                    period === p
                      ? "var(--accent-blue-dim)"
                      : "var(--bg-elevated)",
                  color:
                    period === p ? "var(--accent-blue)" : "var(--text-muted)",
                  border: `1px solid ${
                    period === p ? "var(--accent-blue)" : "var(--border-subtle)"
                  }`,
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {period === "ربعي" && (
            <Dropdown
              icon={Calendar}
              label="السنة"
              value={String(yearPick)}
              options={YEARS.map((y) => ({
                value: String(y),
                label: String(y),
              }))}
              onChange={(v) => setYearPick(Number(v))}
              accent="var(--accent-blue)"
            />
          )}

          <Dropdown
            icon={MapPin}
            label="الفرع"
            value={branch}
            options={BRANCHES.map((b) => ({ value: b, label: b }))}
            onChange={setBranch}
            accent="var(--accent-green)"
          />
        </div>
      }
    />
  );
}
