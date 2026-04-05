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
const ProductGroups = () => {
  const palette = useResolvedAnalyticsPalette();

  // ── مجموعات المنتجات حسب الاتفاقية ──
  const productGroupsOption = useMemo(
    () => ({
      series: [
        {
          type: "pie",
          radius: ["36%", "54%"],
          center: ["50%", "42%"],
          data: [
            {
              name: "بقالة (أرز)",
              value: 35,
              itemStyle: { color: palette.primaryGreen },
            },
            {
              name: "ألبان",
              value: 25,
              itemStyle: { color: palette.primaryBlue },
            },
            {
              name: "منظفات",
              value: 20,
              itemStyle: { color: palette.primaryIndigo },
            },
            {
              name: "لحوم",
              value: 12,
              itemStyle: { color: palette.primaryAmber },
            },
            {
              name: "أخرى",
              value: 8,
              itemStyle: { color: palette.primarySlate },
            },
          ],
          label: { color: "#94a3b8", fontSize: 11 },
          labelLine: { lineStyle: { color: palette.labelColor } },
        },
      ],
    }),
    [palette],
  );
  return (
    <ChartCard
      title="مجموعات المنتجات"
      subtitle="توزيع المنتجات ضمن الاتفاقيات"
      option={productGroupsOption}
      height="340px"
      delay={3}
    />
  );
};

export default ProductGroups;
