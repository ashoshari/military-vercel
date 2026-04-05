import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
const BasketAnalysisNetowrk = () => {
  const palette = useResolvedAnalyticsPalette();

  /** توزيع المنتجات في السلة — مخطط دائري (بدلاً من شبكة ثانية). */
  const basketMixPieOption = useMemo(() => {
    const series = palette.seriesPalette;
    const labelMuted = palette.primarySlate;
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
      itemStyle: { color: series[i % series.length] },
    }));

    return {
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
        textStyle: { fontSize: 9, color: labelMuted },
        itemWidth: 10,
        itemHeight: 8,
        pageIconColor: labelMuted,
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
          label: { fontSize: 9, color: labelMuted },
          emphasis: {
            itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.2)" },
            label: { show: true, fontWeight: "bold" as const },
          },
          data: basketMixPieData,
        },
      ],
    };
  }, [palette]);
  return (
    <ChartCard
      title="شبكة تحليل السلة"
      subtitle="توزيع المنتجات في السلة — مخطط دائري"
      option={basketMixPieOption}
      height="400px"
      aiPowered
      delay={3}
    />
  );
};

export default BasketAnalysisNetowrk;
