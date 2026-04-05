export const paymentRows = [
  { method: "نقدي", sales: 336540, volume: 4120, margin: 22.1 },
  { method: "فيزا / ماستركارد", sales: 78920, volume: 980, margin: 19.5 },
  { method: "كوبون / قسيمة", sales: 10370, volume: 142, margin: 14.3 },
];

export const salesTypeRows = [
  {
    type: "ذمم (كتب رسمية)",
    typeAr: "Receivables / official",
    sales: 198400,
    volume: 2410,
    margin: 20.2,
  },
  {
    type: "بيع الكتروني",
    typeAr: "E‑commerce",
    sales: 156200,
    volume: 1895,
    margin: 18.6,
  },
  {
    type: "دفع فوري",
    typeAr: "Instant payment",
    sales: 71250,
    volume: 837,
    margin: 16.9,
  },
];

export const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
