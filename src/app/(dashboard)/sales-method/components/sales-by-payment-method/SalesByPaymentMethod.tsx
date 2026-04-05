import dynamic from "next/dynamic";
import { paymentRows } from "../../utils/data";
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
const SalesByPaymentMethod = () => {
  const palette = useResolvedAnalyticsPalette();

  const paymentTypeOption = {
    xAxis: {
      type: "category" as const,
      data: paymentRows.map((r) => r.method),
    },
    yAxis: {
      type: "value" as const,
      name: "المبيعات",
      axisLabel: { formatter: (v: number) => `${(v / 1000).toFixed(0)}K` },
    },
    series: [
      {
        type: "bar",
        data: paymentRows.map((r, i) => ({
          value: r.sales,
          itemStyle: {
            color: [
              palette.primaryGreen,
              palette.primaryRed,
              palette.primaryBlue,
            ][i % 3],
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: true,
            position: "top",
            formatter: `${(r.sales / 1000).toFixed(1)}K`,
            color: "#94a3b8",
            fontSize: 10,
          },
        })),
        barWidth: 40,
      },
    ],
  };
  return (
    <ChartCard
      title="المبيعات حسب طريقة الدفع"
      titleFlag="green"
      titleFlagNumber={4}
      subtitle="Net Sales and Product Sales Volume by Payment Type"
      option={paymentTypeOption}
      height="320px"
      delay={1}
    />
  );
};

export default SalesByPaymentMethod;
