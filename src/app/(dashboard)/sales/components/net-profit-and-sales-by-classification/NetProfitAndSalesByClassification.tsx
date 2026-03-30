import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { getProductData } from "@/lib/mockData";
import dynamic from "next/dynamic";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);

const products = getProductData();

const salesVsProfitSlice = products.slice(0, 8);

const xAxis = {
  type: "category" as const,
  data: salesVsProfitSlice.map((p) =>
    p.nameAr.split(" ").slice(0, 2).join(" "),
  ),
  axisLabel: { rotate: 35, fontSize: 10 },
};

const yAxis = [
  {
    type: "value" as const,
    name: "الكمية",
    axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
  },
  {
    type: "value" as const,
    name: "د.أ",
    axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
  },
];
// defines types from data and palette

const createSalesOverviewSeries = (
  data: typeof salesVsProfitSlice,
  palette: ReturnType<typeof useResolvedAnalyticsPalette>,
) => [
  {
    name: "الكمية المباعة",
    type: "bar",
    data: data.map((p) => p.unitsSold),
    itemStyle: { color: palette.primaryBlue, borderRadius: [4, 4, 0, 0] },
    barWidth: 14,
    barGap: "12%",
  },
  {
    name: "قيمة البيع",
    type: "bar",
    yAxisIndex: 1,
    data: data.map((p) => p.revenue),
    itemStyle: { color: palette.primaryGreen, borderRadius: [4, 4, 0, 0] },
    barWidth: 14,
    barGap: "12%",
  },
  {
    name: "الأرباح",
    type: "line",
    yAxisIndex: 1,
    data: data.map((p) => Math.round((p.revenue * p.margin) / 100)),
    lineStyle: { color: palette.primarySlate, width: 2 },
    itemStyle: { color: palette.primarySlate },
  },
];

const legend = {
  data: ["الكمية المباعة", "قيمة البيع", "الأرباح"],
  bottom: 18,
  left: "center",
};

const NetProfitAndSalesByClassification = () => {
  const palette = useResolvedAnalyticsPalette();

  const salesVsProfitOption = {
    xAxis: xAxis,
    yAxis: yAxis,
    series: createSalesOverviewSeries(salesVsProfitSlice, palette),
    legend: legend,
  };

  return (
    <ChartCard
      title="صافي الأرباح والمبيعات حسب التصنيف"
      subtitle="مقارنة حسب التصنيف"
      titleFlag="green"
      titleFlagNumber={1}
      option={salesVsProfitOption}
      height="340px"
      delay={2}
    />
  );
};

export default NetProfitAndSalesByClassification;
