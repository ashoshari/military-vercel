import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const SalesAnalysisByDiscountPercentage = () => {
  const palette = useResolvedAnalyticsPalette();

  const salesByDiscountOption = {
    xAxis: {
      type: "category" as const,
      data: ["بدون خصم", "5%", "10%", "15%", "20%", "25%+"],
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { formatter: (v: number) => `${(v / 1000000).toFixed(1)}M` },
    },
    series: [
      {
        name: "المبيعات",
        type: "bar" as const,
        data: [8200000, 5100000, 4300000, 3600000, 2100000, 1300000],
        itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] },
        barWidth: 28,
      },
      {
        name: "الأرباح",
        type: "bar" as const,
        data: [2050000, 1120000, 730000, 468000, 189000, 52000],
        itemStyle: { color: palette.primaryCyan, borderRadius: [4, 4, 0, 0] },
        barWidth: 28,
      },
    ],
    legend: { data: ["المبيعات", "الأرباح"], bottom: 0, left: "center" },
  };
  return (
    <ChartCard
      title="تحليل المبيعات حسب نسبة الخصم"
      titleLeading={<ChartTitleFlagBadge flag="green" size="sm" />}
      titleFlag="red"
      titleFlagNumber={1}
      subtitle="تأثير الخصومات على المبيعات والأرباح"
      option={salesByDiscountOption}
      height="300px"
      delay={1}
    />
  );
};

export default SalesAnalysisByDiscountPercentage;
