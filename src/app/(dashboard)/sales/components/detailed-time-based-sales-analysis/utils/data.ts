import { AnalyticsTableHeader } from "@/components/ui/AnalyticsTable";

export const headers: AnalyticsTableHeader[] = [
  { label: "السنة", align: "right" },
  { label: "الربع", align: "right" },
  { label: "الشهر", align: "right" },
  { label: "صافي المبيعات", align: "center" },
  { label: "صافي المبيعات YoY", align: "center" },
  { label: "نمو YoY%", align: "center" },
  { label: "نمو MoM%", align: "center" },
  { label: "عدد الفواتير", align: "center" },
  { label: "هامش الربح %", align: "center" },
];
export const data = [
  {
    year: "2022",
    quarter: "الربع 1",
    month: "مارس",
    net: 2065,
    yoy: 61.51,
    mom: 62.73,
    invoices: 823,
    margin: 53.94,
  },
  {
    year: "2022",
    quarter: "الربع 1",
    month: "فبراير",
    net: 1513,
    yoy: 29.49,
    mom: 6.76,
    invoices: 614,
    margin: 60.93,
  },
  {
    year: "2022",
    quarter: "الربع 1",
    month: "يناير",
    net: 1418,
    yoy: 70.89,
    mom: null,
    invoices: 581,
    margin: 59.84,
  },
  {
    year: "2021",
    quarter: "الربع 1",
    month: "مارس",
    net: 1284,
    yoy: -29.39,
    mom: 30.47,
    invoices: 547,
    margin: 26.04,
  },
  {
    year: "2021",
    quarter: "الربع 1",
    month: "فبراير",
    net: 1665,
    yoy: 260.29,
    mom: 40.9,
    invoices: 515,
    margin: 27.83,
  },
  {
    year: "2021",
    quarter: "الربع 1",
    month: "يناير",
    net: 831,
    yoy: null,
    mom: null,
    invoices: 334,
    margin: 31.07,
  },
  {
    year: "2020",
    quarter: "الربع 1",
    month: "مارس",
    net: 1821,
    yoy: null,
    mom: 565.75,
    invoices: 649,
    margin: 2.24,
  },
  {
    year: "2020",
    quarter: "الربع 1",
    month: "فبراير",
    net: 273,
    yoy: null,
    mom: null,
    invoices: 113,
    margin: 1.49,
  },
] as {
  year: string;
  quarter: string;
  month: string;
  net: number;
  yoy: number | null;
  mom: number | null;
  invoices: number;
  margin: number;
}[];
