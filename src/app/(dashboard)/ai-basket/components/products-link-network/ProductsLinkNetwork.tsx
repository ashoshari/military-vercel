import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";
import { rules } from "../../utils/rules";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const topRulesByLift = [...rules].sort((a, b) => b.lift - a.lift).slice(0, 12);

const ProductsLinkNetwork = () => {
  const palette = useResolvedAnalyticsPalette();

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

  return (
    <ChartCard
      title="شبكة ارتباط المنتجات"
      subtitle="أقوى قواعد الارتباط حسب الرفع (Lift) — شريط أفقي"
      option={associationLiftBarOption}
      height="420px"
      aiPowered
      delay={1}
    />
  );
};

export default ProductsLinkNetwork;
