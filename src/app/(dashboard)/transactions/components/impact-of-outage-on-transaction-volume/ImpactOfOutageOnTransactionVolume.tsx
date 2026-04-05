import dynamic from "next/dynamic";
import { useMemo } from "react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
const days = Array.from({ length: 90 }, (_, i) => `يوم ${i + 1}`);

const ImpactOfOutageOnTransactionVolume = () => {
  const holidayData = useMemo(
    () =>
      days.map((_, i) => {
        const base = 1800 + Math.sin(i * 0.15) * 400;
        const spike = [14, 28, 42, 58, 72, 85].includes(i)
          ? 4000 + Math.random() * 3000
          : 0;
        return Math.round(base + spike + Math.random() * 300);
      }),
    [],
  );

  const holidayDates = useMemo(() => {
    const start = new Date(2025, 0, 1); // 2025-01-01
    const pad2 = (n: number) => String(n).padStart(2, "0");
    return Array.from({ length: 90 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = pad2(d.getMonth() + 1);
      const dd = pad2(d.getDate());
      return `${yyyy}-${mm}-${dd}`;
    });
  }, []);

  const holidayOption = {
    tooltip: { trigger: "axis" as const },
    grid: { left: "8%", right: "4%", top: "8%", bottom: "10%" },
    xAxis: {
      type: "category" as const,
      data: holidayDates,
      axisLabel: {
        show: true,
        fontSize: 9,
        rotate: 45,
        interval: 9, // show every ~10th day for readability
      },
      splitLine: { show: false },
    },
    yAxis: { type: "value" as const, axisLabel: { fontSize: 9 } },
    series: [
      {
        type: "line" as const,
        data: holidayData,
        smooth: false,
        showSymbol: false,
        lineStyle: { width: 1.5, color: "#3b82f6" },
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59,130,246,0.20)" },
              { offset: 1, color: "rgba(59,130,246,0.02)" },
            ],
          },
        },
      },
    ],
    dataZoom: [{ type: "inside" as const, start: 0, end: 100 }],
  };
  return (
    <ChartCard
      title="تأثير العطل على حجم المعاملات"
      subtitle="Holiday Impact on Transaction Volume"
      option={holidayOption}
      height="320px"
      delay={1}
    />
  );
};

export default ImpactOfOutageOnTransactionVolume;
