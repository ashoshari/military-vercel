import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import dynamic from "next/dynamic";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
const qBins = [
  "0-50",
  "51-100",
  "101-200",
  "201-500",
  "501-1K",
  "1K-5K",
  "5K-10K",
  "10K+",
];
const qNetSales = [3500, 12000, 25000, 85000, 145000, 272000, 180000, 95000];
const qProfit = [1200, 4100, 8500, 29000, 52000, 98000, 65000, 34000];
const qAtv = [2.12, 3.45, 5.22, 8.9, 12.5, 18.15, 18.67, 18.12];

const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toFixed(2);
const NetSalesProfitMarginAndAtvByNumberOfUnitsSold = () => {
  const palette = useResolvedAnalyticsPalette();

  const comboOption = {
    tooltip: { trigger: "axis" as const },
    legend: {
      data: ["صافي المبيعات", "قيمة الربح", "متوسط قيمة المعاملة (ATV)"],
      bottom: 0,
      textStyle: { fontSize: 8 },
    },
    grid: { left: "4%", right: "4%", top: "10%", bottom: "16%" },
    xAxis: {
      type: "category" as const,
      data: qBins,
      axisLabel: { fontSize: 9, rotate: 20 },
      name: "عدد القطع المباعة",
      nameLocation: "middle" as const,
      nameGap: 30,
      nameTextStyle: { fontSize: 9 },
    },
    yAxis: [
      {
        type: "value" as const,
        axisLabel: { formatter: (v: number) => fmtK(v), fontSize: 9 },
        name: "صافي المبيعات وقيمة الربح",
        nameTextStyle: { fontSize: 8 },
      },
      {
        type: "value" as const,
        axisLabel: { formatter: "{value}", fontSize: 9 },
        name: "متوسط قيمة الفاتورة",
        nameTextStyle: { fontSize: 8 },
      },
    ],
    series: [
      {
        name: "صافي المبيعات",
        type: "bar" as const,
        data: qNetSales.map((v) => ({
          value: v,
          itemStyle: {
            color: palette.primaryGreen,
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barWidth: 18,
      },
      {
        name: "قيمة الربح",
        type: "bar" as const,
        data: qProfit.map((v) => ({
          value: v,
          itemStyle: { color: palette.primaryCyan, borderRadius: [4, 4, 0, 0] },
        })),
        barWidth: 18,
      },
      {
        name: "متوسط قيمة المعاملة (ATV)",
        type: "line" as const,
        yAxisIndex: 1,
        data: qAtv,
        lineStyle: { color: palette.primaryRed, width: 2 },
        itemStyle: { color: palette.primaryRed },
        smooth: true,
      },
    ],
  };
  return (
    <ChartCard
      title="صافي المبيعات وقيمة الربح وATV حسب عدد القطع المباعة"
      subtitle="Net Sales, Profit Value, % Profit Margin by Product Quantity (bins)"
      option={comboOption}
      height="340px"
      delay={1}
    />
  );
};

export default NetSalesProfitMarginAndAtvByNumberOfUnitsSold;
