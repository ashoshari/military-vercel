import { useMemo } from "react";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";
const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
const ValueByType = () => {
  const palette = useResolvedAnalyticsPalette();

  // ── القيمة حسب النوع ──
  const valueByTypeOption = useMemo(
    () => ({
      xAxis: {
        type: "category" as const,
        data: ["مشتريات", "توزيع", "خدمات", "تسويق"],
      },
      yAxis: {
        type: "value" as const,
        axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
      },
      series: [
        {
          type: "bar",
          data: [
            {
              value: 2160000,
              itemStyle: {
                color: palette.primaryGreen,
                borderRadius: [4, 4, 0, 0],
              },
            },
            {
              value: 850000,
              itemStyle: {
                color: palette.primaryCyan,
                borderRadius: [4, 4, 0, 0],
              },
            },
            {
              value: 180000,
              itemStyle: {
                color: palette.primaryIndigo,
                borderRadius: [4, 4, 0, 0],
              },
            },
            {
              value: 450000,
              itemStyle: {
                color: palette.primaryAmber,
                borderRadius: [4, 4, 0, 0],
              },
            },
          ],
          barWidth: 40,
        },
      ],
    }),
    [palette],
  );
  return (
    <ChartCard
      title="القيمة حسب النوع"
      subtitle="إجمالي قيمة العقود"
      option={valueByTypeOption}
      height="340px"
      delay={2}
    />
  );
};

export default ValueByType;
