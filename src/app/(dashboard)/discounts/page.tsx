"use client";

import "@/lib/echarts/register-bar-line-pie";
import "@/lib/echarts/register-scatter";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Percent,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Tag,
  BarChart3,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const ChartCard = dynamic(
  () => import("@/components/ui/chart-card/ChartCard"),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  },
);
import { useResolvedAnalyticsPalette } from "@/hooks/useResolvedAnalyticsPalette";
import { useThemeStore } from "@/store/themeStore";
import SectionTitleWithFlag from "@/components/ui/SectionTitleWithFlag";
import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── بيانات الفئات ──
const categories = [
  {
    name: "أجهزة والكترونيات",
    withMargin: 72.73,
    withSales: 0.09,
    noMargin: 57.21,
    noSales: 0.09,
    products: [
      {
        name: 'شاشة سامسونج 32"',
        withMargin: 75.1,
        withSales: 0.04,
        noMargin: 58.2,
        noSales: 0.04,
      },
      {
        name: "مكيف سبليت 1.5طن",
        withMargin: 69.5,
        withSales: 0.03,
        noMargin: 55.8,
        noSales: 0.03,
      },
      {
        name: "طباعة ليزر HP",
        withMargin: 73.8,
        withSales: 0.02,
        noMargin: 57.6,
        noSales: 0.02,
      },
    ],
  },
  {
    name: "العناية الشخصية",
    withMargin: 26.19,
    withSales: 1.06,
    noMargin: 22.11,
    noSales: 0.59,
    products: [
      {
        name: "شامبو هيد آند شولدرز",
        withMargin: 28.4,
        withSales: 0.35,
        noMargin: 23.1,
        noSales: 0.2,
      },
      {
        name: "كريم نيفيا للجسم",
        withMargin: 24.8,
        withSales: 0.42,
        noMargin: 21.3,
        noSales: 0.22,
      },
      {
        name: "معجون أسنان كولجيت",
        withMargin: 25.3,
        withSales: 0.29,
        noMargin: 21.9,
        noSales: 0.17,
      },
    ],
  },
  {
    name: "غير مصنف",
    withMargin: 30.25,
    withSales: 0.25,
    noMargin: 13.11,
    noSales: 0.16,
    products: [
      {
        name: "منتج متنوع أ",
        withMargin: 32.1,
        withSales: 0.12,
        noMargin: 14.2,
        noSales: 0.08,
      },
      {
        name: "منتج متنوع ب",
        withMargin: 28.4,
        withSales: 0.13,
        noMargin: 12.0,
        noSales: 0.08,
      },
    ],
  },
  {
    name: "فرفاشية",
    withMargin: 72.4,
    withSales: 1.42,
    noMargin: 44.64,
    noSales: 2.17,
    products: [
      {
        name: "مثلجات كيه دي دي",
        withMargin: 74.2,
        withSales: 0.55,
        noMargin: 45.8,
        noSales: 0.88,
      },
      {
        name: "حلوى شوكولاته مكس",
        withMargin: 70.8,
        withSales: 0.52,
        noMargin: 43.4,
        noSales: 0.82,
      },
      {
        name: "سناكس متنوعة",
        withMargin: 72.2,
        withSales: 0.35,
        noMargin: 44.7,
        noSales: 0.47,
      },
    ],
  },
  {
    name: "مستلزمات الأطفال",
    withMargin: 22.63,
    withSales: 0.05,
    noMargin: 13.52,
    noSales: 0.17,
    products: [
      {
        name: "حفاضات بامبرز",
        withMargin: 23.8,
        withSales: 0.02,
        noMargin: 14.1,
        noSales: 0.07,
      },
      {
        name: "مناشف رطبة للأطفال",
        withMargin: 21.4,
        withSales: 0.03,
        noMargin: 12.9,
        noSales: 0.1,
      },
    ],
  },
  {
    name: "مستلزمات منزلية",
    withMargin: 38.03,
    withSales: 0.52,
    noMargin: 24.17,
    noSales: 0.08,
    products: [
      {
        name: "منظف أريال مسحوق",
        withMargin: 39.2,
        withSales: 0.2,
        noMargin: 25.4,
        noSales: 0.03,
      },
      {
        name: "صابون صحون فيري",
        withMargin: 37.5,
        withSales: 0.18,
        noMargin: 23.8,
        noSales: 0.03,
      },
      {
        name: "ليف مطبخ",
        withMargin: 37.4,
        withSales: 0.14,
        noMargin: 23.3,
        noSales: 0.02,
      },
    ],
  },
  {
    name: "منتجات ورقية",
    withMargin: 44.55,
    withSales: 0.4,
    noMargin: 41.39,
    noSales: 0.39,
    products: [
      {
        name: "مناديل كلينكس",
        withMargin: 46.2,
        withSales: 0.18,
        noMargin: 43.1,
        noSales: 0.18,
      },
      {
        name: "ورق طباعة A4",
        withMargin: 42.8,
        withSales: 0.14,
        noMargin: 39.6,
        noSales: 0.13,
      },
      {
        name: "أكياس قمامة",
        withMargin: 44.6,
        withSales: 0.08,
        noMargin: 41.5,
        noSales: 0.08,
      },
    ],
  },
  {
    name: "مسطحات",
    withMargin: 33.22,
    withSales: 0.08,
    noMargin: 47.55,
    noSales: 0.23,
    products: [
      {
        name: "عصير برتقال طبيعي",
        withMargin: 34.1,
        withSales: 0.04,
        noMargin: 48.2,
        noSales: 0.12,
      },
      {
        name: "مياه معدنية 1.5L",
        withMargin: 32.3,
        withSales: 0.04,
        noMargin: 46.9,
        noSales: 0.11,
      },
    ],
  },
  {
    name: "غير مصنف 2",
    withMargin: 38.41,
    withSales: 0.88,
    noMargin: 21.4,
    noSales: 0.21,
    products: [
      {
        name: "منتج متنوع أ",
        withMargin: 39.5,
        withSales: 0.45,
        noMargin: 22.3,
        noSales: 0.11,
      },
      {
        name: "منتج متنوع ب",
        withMargin: 37.3,
        withSales: 0.43,
        noMargin: 20.5,
        noSales: 0.1,
      },
    ],
  },
  {
    name: "منتجات غذائية",
    withMargin: 27.75,
    withSales: 7.69,
    noMargin: 21.4,
    noSales: 0.21,
    products: [
      {
        name: "أرز عنبر 5كجم",
        withMargin: 29.4,
        withSales: 2.1,
        noMargin: 22.8,
        noSales: 0.06,
      },
      {
        name: "زيت نباتي 1.8L",
        withMargin: 26.8,
        withSales: 1.95,
        noMargin: 20.6,
        noSales: 0.05,
      },
      {
        name: "سكر أبيض 2كجم",
        withMargin: 27.1,
        withSales: 1.8,
        noMargin: 21.1,
        noSales: 0.04,
      },
      {
        name: "شاي ليبتون 100كيس",
        withMargin: 28.2,
        withSales: 1.84,
        noMargin: 21.1,
        noSales: 0.06,
      },
    ],
  },
  {
    name: "مستلزمات الأعمال",
    withMargin: 38.51,
    withSales: 0.15,
    noMargin: 21.4,
    noSales: 0.21,
    products: [
      {
        name: "ورق طباعة مكتبي",
        withMargin: 40.2,
        withSales: 0.08,
        noMargin: 22.5,
        noSales: 0.11,
      },
      {
        name: "أقلام حبر جاف",
        withMargin: 36.8,
        withSales: 0.07,
        noMargin: 20.3,
        noSales: 0.1,
      },
    ],
  },
  {
    name: "مسطحات غذائية",
    withMargin: 38.43,
    withSales: 3.24,
    noMargin: 21.4,
    noSales: 0.21,
    products: [
      {
        name: "عصير مانجو 1L",
        withMargin: 39.1,
        withSales: 1.2,
        noMargin: 22.1,
        noSales: 0.08,
      },
      {
        name: "مشروب ليمون 500مل",
        withMargin: 37.8,
        withSales: 1.04,
        noMargin: 20.8,
        noSales: 0.07,
      },
      {
        name: "ماء كوكاكولا 600مل",
        withMargin: 38.4,
        withSales: 1.0,
        noMargin: 21.3,
        noSales: 0.06,
      },
    ],
  },
];

const discountRanges = [
  {
    range: "0%",
    netSales: 352410,
    profitValue: 155520,
    totalDiscount: 0,
    avgRate: 0.0,
  },
  {
    range: "1-2%",
    netSales: 4830,
    profitValue: 1240,
    totalDiscount: 2146.83,
    avgRate: 1.01,
  },
  {
    range: "2-5%",
    netSales: 12147,
    profitValue: 3210,
    totalDiscount: 41022.07,
    avgRate: 3.06,
  },
  {
    range: "5-10%",
    netSales: 38321,
    profitValue: 9870,
    totalDiscount: 43122.97,
    avgRate: 6.15,
  },
  {
    range: "11-25%",
    netSales: 80000,
    profitValue: 22100,
    totalDiscount: 82855.13,
    avgRate: 14.68,
  },
];

const branches = [
  {
    name: "عمّان",
    invoices: 79.0,
    discInv: 38,
    discRate: 68.0,
    noDiscInv: 40,
    avgDisc: 0,
    discSales: 0,
    discVol: 43,
    netSales: 0,
    appDisc: 0.3,
    utilRate: 0.0,
    avgDiscRate: 0.0,
    subs: [
      {
        name: "منتجات غذائية",
        invoices: 42,
        discInv: 22,
        discRate: 52.38,
        noDiscInv: 20,
        avgDisc: 0.15,
        discSales: 0,
        discVol: 24,
        netSales: 0,
        appDisc: 0.15,
        utilRate: 0.0,
        avgDiscRate: 0.0,
        products: [
          {
            name: "أرز عنبر 5كجم",
            invoices: 18,
            discInv: 10,
            discRate: 55.56,
            noDiscInv: 8,
            avgDisc: 0.1,
            discSales: 0,
            discVol: 12,
            netSales: 0,
            appDisc: 0.1,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
          {
            name: "زيت نباتي 1.8L",
            invoices: 14,
            discInv: 7,
            discRate: 50.0,
            noDiscInv: 7,
            avgDisc: 0.05,
            discSales: 0,
            discVol: 7,
            netSales: 0,
            appDisc: 0.05,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
          {
            name: "سكر أبيض 2كجم",
            invoices: 10,
            discInv: 5,
            discRate: 50.0,
            noDiscInv: 5,
            avgDisc: 0.0,
            discSales: 0,
            discVol: 5,
            netSales: 0,
            appDisc: 0.0,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
        ],
      },
      {
        name: "مستلزمات منزلية",
        invoices: 22,
        discInv: 10,
        discRate: 45.45,
        noDiscInv: 12,
        avgDisc: 0.1,
        discSales: 0,
        discVol: 12,
        netSales: 0,
        appDisc: 0.1,
        utilRate: 0.0,
        avgDiscRate: 0.0,
        products: [
          {
            name: "منظف أريال مسحوق",
            invoices: 12,
            discInv: 6,
            discRate: 50.0,
            noDiscInv: 6,
            avgDisc: 0.05,
            discSales: 0,
            discVol: 7,
            netSales: 0,
            appDisc: 0.05,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
          {
            name: "صابون صحون فيري",
            invoices: 10,
            discInv: 4,
            discRate: 40.0,
            noDiscInv: 6,
            avgDisc: 0.05,
            discSales: 0,
            discVol: 5,
            netSales: 0,
            appDisc: 0.05,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
        ],
      },
      {
        name: "العناية الشخصية",
        invoices: 15,
        discInv: 6,
        discRate: 40.0,
        noDiscInv: 9,
        avgDisc: 0.05,
        discSales: 0,
        discVol: 7,
        netSales: 0,
        appDisc: 0.05,
        utilRate: 0.0,
        avgDiscRate: 0.0,
        products: [
          {
            name: "شامبو هيد آند شولدرز",
            invoices: 8,
            discInv: 3,
            discRate: 37.5,
            noDiscInv: 5,
            avgDisc: 0.03,
            discSales: 0,
            discVol: 4,
            netSales: 0,
            appDisc: 0.03,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
          {
            name: "كريم نيفيا للجسم",
            invoices: 7,
            discInv: 3,
            discRate: 42.86,
            noDiscInv: 4,
            avgDisc: 0.02,
            discSales: 0,
            discVol: 3,
            netSales: 0,
            appDisc: 0.02,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
        ],
      },
    ],
  },
  {
    name: "الكرك",
    invoices: 1.0,
    discInv: 1,
    discRate: 90.0,
    noDiscInv: 0,
    avgDisc: 1.9,
    discSales: 1,
    discVol: 1,
    netSales: 1,
    appDisc: 1.9,
    utilRate: 4.0,
    avgDiscRate: 4.4,
    subs: [
      {
        name: "منتجات غذائية",
        invoices: 1,
        discInv: 1,
        discRate: 100.0,
        noDiscInv: 0,
        avgDisc: 1.9,
        discSales: 1,
        discVol: 1,
        netSales: 1,
        appDisc: 1.9,
        utilRate: 4.0,
        avgDiscRate: 4.4,
        products: [
          {
            name: "أرز عنبر 5كجم",
            invoices: 1,
            discInv: 1,
            discRate: 100.0,
            noDiscInv: 0,
            avgDisc: 1.9,
            discSales: 1,
            discVol: 1,
            netSales: 1,
            appDisc: 1.9,
            utilRate: 4.0,
            avgDiscRate: 4.4,
          },
        ],
      },
    ],
  },
  {
    name: "المفرق",
    invoices: 1.0,
    discInv: 1,
    discRate: 80.0,
    noDiscInv: 0,
    avgDisc: 1.3,
    discSales: 0,
    discVol: 1,
    netSales: 0,
    appDisc: 1.3,
    utilRate: 3.0,
    avgDiscRate: 3.0,
    subs: [
      {
        name: "فرفاشية",
        invoices: 1,
        discInv: 1,
        discRate: 80.0,
        noDiscInv: 0,
        avgDisc: 1.3,
        discSales: 0,
        discVol: 1,
        netSales: 0,
        appDisc: 1.3,
        utilRate: 3.0,
        avgDiscRate: 3.0,
        products: [
          {
            name: "حلوى شوكولاته مكس",
            invoices: 1,
            discInv: 1,
            discRate: 80.0,
            noDiscInv: 0,
            avgDisc: 1.3,
            discSales: 0,
            discVol: 1,
            netSales: 0,
            appDisc: 1.3,
            utilRate: 3.0,
            avgDiscRate: 3.0,
          },
        ],
      },
    ],
  },
  {
    name: "اربد",
    invoices: 4.0,
    discInv: 1,
    discRate: 60.0,
    noDiscInv: 3,
    avgDisc: 0.5,
    discSales: 0,
    discVol: 1,
    netSales: 0,
    appDisc: 0.5,
    utilRate: 4.0,
    avgDiscRate: 0.46,
    subs: [
      {
        name: "مسطحات غذائية",
        invoices: 2,
        discInv: 1,
        discRate: 50.0,
        noDiscInv: 1,
        avgDisc: 0.3,
        discSales: 0,
        discVol: 1,
        netSales: 0,
        appDisc: 0.3,
        utilRate: 2.0,
        avgDiscRate: 0.3,
        products: [
          {
            name: "عصير مانجو 1L",
            invoices: 2,
            discInv: 1,
            discRate: 50.0,
            noDiscInv: 1,
            avgDisc: 0.3,
            discSales: 0,
            discVol: 1,
            netSales: 0,
            appDisc: 0.3,
            utilRate: 2.0,
            avgDiscRate: 0.3,
          },
        ],
      },
      {
        name: "منتجات غذائية",
        invoices: 2,
        discInv: 0,
        discRate: 0.0,
        noDiscInv: 2,
        avgDisc: 0.2,
        discSales: 0,
        discVol: 0,
        netSales: 0,
        appDisc: 0.2,
        utilRate: 2.0,
        avgDiscRate: 0.16,
        products: [
          {
            name: "شاي ليبتون 100كيس",
            invoices: 2,
            discInv: 0,
            discRate: 0.0,
            noDiscInv: 2,
            avgDisc: 0.2,
            discSales: 0,
            discVol: 0,
            netSales: 0,
            appDisc: 0.2,
            utilRate: 2.0,
            avgDiscRate: 0.16,
          },
        ],
      },
    ],
  },
  {
    name: "الزرقاء",
    invoices: 9.0,
    discInv: 2,
    discRate: 50.0,
    noDiscInv: 7,
    avgDisc: 0.8,
    discSales: 1,
    discVol: 2,
    netSales: 1,
    appDisc: 0.8,
    utilRate: 0.0,
    avgDiscRate: 0.0,
    subs: [
      {
        name: "العناية الشخصية",
        invoices: 5,
        discInv: 1,
        discRate: 20.0,
        noDiscInv: 4,
        avgDisc: 0.4,
        discSales: 0,
        discVol: 1,
        netSales: 0,
        appDisc: 0.4,
        utilRate: 0.0,
        avgDiscRate: 0.0,
        products: [
          {
            name: "معجون أسنان كولجيت",
            invoices: 5,
            discInv: 1,
            discRate: 20.0,
            noDiscInv: 4,
            avgDisc: 0.4,
            discSales: 0,
            discVol: 1,
            netSales: 0,
            appDisc: 0.4,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
        ],
      },
      {
        name: "مستلزمات الأطفال",
        invoices: 4,
        discInv: 1,
        discRate: 25.0,
        noDiscInv: 3,
        avgDisc: 0.4,
        discSales: 1,
        discVol: 1,
        netSales: 1,
        appDisc: 0.4,
        utilRate: 0.0,
        avgDiscRate: 0.0,
        products: [
          {
            name: "حفاضات بامبرز",
            invoices: 4,
            discInv: 1,
            discRate: 25.0,
            noDiscInv: 3,
            avgDisc: 0.4,
            discSales: 1,
            discVol: 1,
            netSales: 1,
            appDisc: 0.4,
            utilRate: 0.0,
            avgDiscRate: 0.0,
          },
        ],
      },
    ],
  },
  {
    name: "الإجمالي",
    invoices: 79.0,
    discInv: 38,
    discRate: 68.0,
    noDiscInv: 40,
    avgDisc: 0.94,
    discSales: 2,
    discVol: 43,
    netSales: 2,
    appDisc: 4.8,
    utilRate: 4.0,
    avgDiscRate: 4.45,
  },
];

const fmt2 = (n: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
const fmtK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(2)}K` : fmt2(n));

export default function DiscountsPage() {
  const palette = useResolvedAnalyticsPalette();
  const isDark = useThemeStore((s) => s.mode === "dark");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [discountPeriod, setDiscountPeriod] = useState<
    "شهري" | "ربعي" | "سنوي"
  >("شهري");

  const toggleCat = (name: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  // ── هامش الربح حسب الفئة و نوع الخصم ──
  const discountTypes = [
    "رفقاء السلاح - 10%",
    "خصم التربية و التعليم 7%",
    "خصم الضمان الاجتماعي 5%",
    "خصم البريد الاردني 2%",
  ] as const;
  /**
   * Static but realistic-looking distributions (each row totals 100%).
   * Represents how margin share is distributed across discount types per category.
   */
  const profitMarginByCatData = {
    comrades10: [46, 34, 52, 41, 48, 38, 55, 44, 50, 42, 47, 40],
    edu7: [22, 26, 18, 24, 20, 28, 16, 22, 19, 23, 21, 25],
    social5: [18, 16, 17, 19, 18, 14, 15, 18, 16, 17, 15, 18],
    post2: [14, 24, 13, 16, 14, 20, 14, 16, 15, 18, 17, 17],
  } as const;
  const profitMarginByCatOption = {
    tooltip: {
      trigger: "axis" as const,
      axisPointer: { type: "shadow" as const },
      backgroundColor: "#1a2035",
      borderColor: "#1e293b",
      textStyle: { color: "#e2e8f0", fontSize: 10 },
    },
    legend: {
      data: [...discountTypes],
      bottom: 0,
      left: "center",
      textStyle: { color: "#64748b", fontSize: 8 },
    },
    grid: {
      left: "4%",
      right: "3%",
      top: "14%",
      bottom: "18%",
      containLabel: true,
    },
    xAxis: {
      type: "value" as const,
      max: 100,
      axisLabel: { formatter: "{value}%", fontSize: 8, color: "#64748b" },
      axisLine: {
        show: true,
        lineStyle: { color: palette.primarySlate, width: 1.5 },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: isDark ? "#1e293b" : "rgba(100, 116, 139, 0.35)",
        },
      },
    },
    yAxis: {
      type: "category" as const,
      data: categories.map((c) => c.name),
      axisLabel: { fontSize: 9, color: "#94a3b8" },
      axisLine: {
        show: true,
        lineStyle: { color: palette.primarySlate, width: 1.5 },
      },
      axisTick: { show: false },
    },
    series: [
      {
        name: discountTypes[0],
        type: "bar" as const,
        stack: "total",
        barMaxWidth: 18,
        data: categories.map((_, i) => profitMarginByCatData.comrades10[i]),
        itemStyle: { color: palette.primaryGreen },
        label: {
          show: true,
          fontSize: 7,
          color: "#fff",
          formatter: (p: { value: number }) =>
            p.value > 5 ? `${p.value}%` : "",
        },
      },
      {
        name: discountTypes[1],
        type: "bar" as const,
        stack: "total",
        barMaxWidth: 18,
        data: categories.map((_, i) => profitMarginByCatData.edu7[i]),
        itemStyle: { color: palette.primaryCyan },
      },
      {
        name: discountTypes[2],
        type: "bar" as const,
        stack: "total",
        barMaxWidth: 18,
        data: categories.map((_, i) => profitMarginByCatData.social5[i]),
        itemStyle: { color: palette.primaryRed },
      },
      {
        name: discountTypes[3],
        type: "bar" as const,
        stack: "total",
        barMaxWidth: 18,
        data: categories.map((_, i) => profitMarginByCatData.post2[i]),
        itemStyle: { color: palette.primaryAmber },
      },
    ],
  };

  // ── Scatter: نسب الخصم × حجم المبيعات ──
  const scatterOption = {
    tooltip: {
      trigger: "item" as const,
      backgroundColor: "#1a2035",
      borderColor: "#1e293b",
      textStyle: { color: "#e2e8f0", fontSize: 10 },
      formatter: (p: { data: [number, number, string] }) =>
        `<b style="color:#00e5a0">${p.data[2]}</b><br/>نسبة الخصم: ${p.data[0]}%<br/>حجم المبيعات: ${p.data[1]}K`,
    },
    xAxis: {
      name: "نسبة الخصم %",
      type: "value" as const,
      nameLocation: "middle" as const,
      nameGap: 32,
      nameTextStyle: { color: "#64748b", fontSize: 9 },
      axisLabel: { formatter: "{value}%", fontSize: 9, color: "#64748b" },
      splitLine: { lineStyle: { color: "#1e293b" } },
    },
    yAxis: {
      name: "حجم مبيعات المنتجات",
      type: "value" as const,
      nameLocation: "middle" as const,
      nameGap: 40,
      nameTextStyle: { color: "#64748b", fontSize: 9 },
      axisLabel: {
        formatter: (v: number) => `${(v / 1000).toFixed(0)}K`,
        fontSize: 9,
        color: "#64748b",
      },
      splitLine: { lineStyle: { color: "#1e293b" } },
    },
    series: [
      {
        type: "scatter",
        symbolSize: (d: number[]) => Math.max(10, Math.sqrt(d[1] / 100)),
        data: categories.map((c) => [
          c.withSales * 5,
          c.withMargin * 1000,
          c.name,
        ]),
        itemStyle: {
          color: palette.primaryGreen,
          opacity: 0.8,
          borderColor: hexToRgba(palette.primaryGreen, 0.25),
          borderWidth: 1,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            formatter: (p: { data: (number | string)[] }) =>
              String(p.data[2]).split(/[ ،]/)[0],
            fontSize: 9,
            color: "#e2e8f0",
            position: "top" as const,
          },
        },
      },
    ],
    grid: { bottom: "18%", top: "14%", left: "8%", right: "5%" },
  };

  // ── صافي المبيعات حسب نطاق الخصم ──
  const rangeBarOption = {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "#1a2035",
      borderColor: "#1e293b",
      textStyle: { color: "#e2e8f0", fontSize: 10 },
    },
    legend: {
      data: ["صافي المبيعات", "قيمة الربح", "إجمالي الخصومات"],
      bottom: 0,
      textStyle: { color: "#64748b", fontSize: 9 },
    },
    grid: {
      bottom: "18%",
      top: "10%",
      left: "3%",
      right: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category" as const,
      data: discountRanges.map((r) => r.range),
      axisLabel: { fontSize: 10, color: "#64748b" },
      axisLine: { lineStyle: { color: "#334155" } },
    },
    yAxis: [
      {
        type: "value" as const,
        axisLabel: {
          formatter: (v: number) => fmtK(v),
          fontSize: 9,
          color: "#64748b",
        },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      {
        type: "value" as const,
        name: "معدل الخصم %",
        axisLabel: { formatter: "{value}%", fontSize: 9, color: "#64748b" },
      },
    ],
    series: [
      {
        name: "صافي المبيعات",
        type: "bar",
        data: discountRanges.map((r) => ({
          value: r.netSales,
          itemStyle: {
            color: palette.primaryGreen,
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 32,
      },
      {
        name: "قيمة الربح",
        type: "bar",
        data: discountRanges.map((r) => ({
          value: r.profitValue,
          itemStyle: { color: palette.primaryCyan, borderRadius: [4, 4, 0, 0] },
        })),
        barMaxWidth: 32,
      },
      {
        name: "إجمالي الخصومات",
        type: "bar",
        data: discountRanges.map((r) => ({
          value: r.totalDiscount,
          itemStyle: {
            color: palette.primaryAmber,
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 32,
      },
      {
        name: "معدل الخصم %",
        type: "line",
        yAxisIndex: 1,
        data: discountRanges.map((r) => r.avgRate),
        lineStyle: { color: palette.primaryRed, width: 2 },
        itemStyle: { color: palette.primaryRed },
        smooth: true,
      },
    ],
  };

  // ── إجمالي الخصومات بمرور الوقت ──
  const periodData = {
    شهري: {
      labels: [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
      ],
      values: [
        153000, 118500, 353000, 185000, 206000, 139500, 112000, 404000, 225000,
        178000, 478000, 571000,
      ],
    },
    ربعي: {
      labels: ["الربع الأول", "الربع الثاني", "الربع الثالث", "الربع الرابع"],
      values: [624500, 530500, 741000, 1227000],
    },
    سنوي: {
      labels: ["2021", "2022", "2023", "2024"],
      values: [1850000, 2340000, 2780000, 3123000],
    },
  };
  const pData = periodData[discountPeriod];
  const discountTrendOption = {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "#1a2035",
      borderColor: "#1e293b",
      textStyle: { color: "#e2e8f0", fontSize: 11 },
      formatter: (params: { name: string; value: number }[]) =>
        `${params[0].name}<br/>إجمالي الخصومات: <b style="color:${palette.primaryAmber}">${fmtK(params[0].value)}</b>`,
    },
    grid: {
      bottom: "10%",
      top: "8%",
      left: "3%",
      right: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category" as const,
      data: pData.labels,
      axisLabel: { fontSize: 9, color: "#64748b" },
      axisLine: {
        show: true,
        lineStyle: { color: palette.primarySlate, width: 1.5 },
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: {
        formatter: (v: number) => fmtK(v),
        fontSize: 9,
        color: "#64748b",
      },
      axisLine: {
        show: true,
        lineStyle: { color: palette.primarySlate, width: 1.5 },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: isDark ? "#1e293b" : "rgba(100, 116, 139, 0.35)",
        },
      },
    },
    series: [
      {
        type: "line" as const,
        smooth: true,
        showSymbol: true,
        symbolSize: 7,
        data: pData.values,
        lineStyle: { color: palette.primaryAmber, width: 2.5 },
        itemStyle: {
          color: palette.primaryAmber,
          borderColor: "#1a2035",
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(245,158,11,0.25)" },
              { offset: 1, color: "rgba(245,158,11,0.02)" },
            ],
          },
        },
      },
    ],
  };

  // ── تحليل المبيعات حسب نسبة الخصم (من صفحة المبيعات) ──
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

  const kpis = [
    {
      icon: DollarSign,
      label: "صافي المبيعات",
      value: "425.92K",
      color: palette.primaryGreen,
      dim: hexToRgba(palette.primaryGreen, 0.1),
    },
    {
      icon: TrendingUp,
      label: "قيمة الربح",
      value: "155.52K",
      color: palette.primaryCyan,
      dim: hexToRgba(palette.primaryCyan, 0.1),
    },
    {
      icon: BarChart3,
      label: "قيمة التكلفة",
      value: "78.28K",
      color: palette.primaryBlue,
      dim: hexToRgba(palette.primaryBlue, 0.1),
    },
    {
      icon: Tag,
      label: "إجمالي الخصومات المطبقة",
      value: "169.47K",
      color: palette.primaryAmber,
      dim: hexToRgba(palette.primaryAmber, 0.1),
    },
    {
      icon: TrendingDown,
      label: "ربح المنتجات المخصومة",
      value: "43.61K",
      color: "#a855f7",
      dim: "rgba(168,85,247,0.1)",
    },
    {
      icon: Percent,
      label: "% مبيعات مخصومة",
      value: "21.31%",
      color: palette.primaryRed,
      dim: hexToRgba(palette.primaryRed, 0.1),
    },
    {
      icon: AlertCircle,
      label: "متوسط نسبة الخصم",
      value: "1.97%",
      color: "#0891b2",
      dim: "rgba(8,145,178,0.1)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <Percent size={22} style={{ color: "var(--accent-amber)" }} />
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Discount Analysis Dashboard
          </h1>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--accent-amber)" }}
            />
            <span
              className="text-[10px]"
              style={{ color: "var(--accent-amber)" }}
            >
              التقرير السابع
            </span>
          </div>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          تحليل الخصومات: الهوامش، نطاقات الخصم، أداء الفروع، والمواسم
        </p>
      </motion.div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel p-4 relative overflow-hidden"
          >
            <div
              className="absolute -top-4 -right-4 w-14 h-14 rounded-full blur-2xl"
              style={{ background: k.color, opacity: 0.15 }}
            />
            <div className="relative">
              <div
                className="p-1.5 rounded-lg w-fit mb-2"
                style={{ background: k.dim }}
              >
                <k.icon size={11} style={{ color: k.color }} />
              </div>
              <p
                className="text-[15px] font-bold"
                style={{ color: k.color }}
                dir="ltr"
              >
                {k.value}
              </p>
              <p
                className="text-[9px] font-semibold mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {k.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── هامش الربح + Scatter ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="هامش الربح حسب الفئة و نوع الخصم"
          titleFlag="green"
          subtitle="Profit Margin by Category and Discount Type"
          option={profitMarginByCatOption}
          height="360px"
          delay={1}
        />
        <ChartCard
          title="نسب الخصم وحجم مبيعات المنتجات"
          titleFlag="green"
          subtitle="Discount Percentages & Product Sales Volume by Category"
          option={scatterOption}
          height="360px"
          delay={2}
        />
      </div>

      {/* ── صافي المبيعات حسب نطاق الخصم ── */}
      <ChartCard
        title="صافي المبيعات وقيمة الربح والخصومات حسب نطاق الخصم"
        subtitle="Net Sales, Profit Value, Total Applied Discounts & Average Discount Rate by Discount Range"
        option={rangeBarOption}
        height="320px"
        delay={1}
      />

      {/* ── جدول مقارنة الفئات ── */}
      <div className="glass-panel overflow-hidden">
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <SectionTitleWithFlag title="مقارنة أداء فئات الخصم" />
          <p
            className="text-[10px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Discount Category Comparison — مع/بدون خصومات
          </p>
        </div>
        <div className="overflow-x-auto">
          <AnalyticsTable
            headers={[]}
            thead={
              <>
                <tr
                  style={{
                    background: "var(--bg-elevated)",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <th
                    style={{
                      padding: "9px 12px",
                      textAlign: "right",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      minWidth: 150,
                      whiteSpace: "nowrap",
                    }}
                  >
                    فئة الخصم
                  </th>
                  <th
                    colSpan={2}
                    style={{
                      padding: "9px 12px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      borderLeft: "1px solid var(--border-subtle)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    مع خصومات
                  </th>
                  <th
                    colSpan={2}
                    style={{
                      padding: "9px 12px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      borderLeft: "1px solid var(--border-subtle)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    بدون خصومات
                  </th>
                </tr>
                <tr
                  style={{
                    background: "var(--bg-elevated)",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <th
                    style={{
                      padding: "7px 12px",
                      textAlign: "right",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  />
                  <th
                    style={{
                      padding: "7px 12px",
                      textAlign: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      borderLeft: "1px solid var(--border-subtle)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    % هامش الربح
                  </th>
                  <th
                    style={{
                      padding: "7px 12px",
                      textAlign: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    % مساهمة المبيعات
                  </th>
                  <th
                    style={{
                      padding: "7px 12px",
                      textAlign: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      borderLeft: "1px solid var(--border-subtle)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    % هامش الربح
                  </th>
                  <th
                    style={{
                      padding: "7px 12px",
                      textAlign: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    % مساهمة المبيعات
                  </th>
                </tr>
              </>
            }
          >
            {categories.map((c) => {
              const isOpen = expandedCats.has(c.name);
              return (
                <React.Fragment key={c.name}>
                  {/* صف الفئة */}
                  <tr
                    onClick={() => toggleCat(c.name)}
                    className="transition-colors cursor-pointer"
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      background: isOpen
                        ? "rgba(0,229,160,0.04)"
                        : "transparent",
                    }}
                  >
                    <td
                      style={{
                        ...analyticsTdBaseStyle("right"),
                        padding: "8px 12px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            color: "var(--accent-green)",
                            transition: "transform 0.2s",
                            display: "inline-block",
                            transform: isOpen
                              ? "rotate(0deg)"
                              : "rotate(-90deg)",
                          }}
                        >
                          <ChevronDown size={13} />
                        </span>
                        {c.name}
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{
                            background: "var(--bg-elevated)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {c.products.length}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        ...analyticsTdBaseStyle("center"),
                        padding: "8px 12px",
                        borderLeft: "1px solid var(--border-subtle)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color:
                            c.withMargin > 50
                              ? "var(--accent-green)"
                              : c.withMargin > 30
                                ? "var(--accent-amber)"
                                : "var(--accent-red)",
                        }}
                        dir="ltr"
                      >
                        {fmt2(c.withMargin)}%
                      </span>
                    </td>
                    <td
                      style={{
                        ...analyticsTdBaseStyle("center"),
                        padding: "8px 12px",
                      }}
                    >
                      <span
                        style={{ fontSize: 10, color: "var(--text-secondary)" }}
                        dir="ltr"
                      >
                        {fmt2(c.withSales)}%
                      </span>
                    </td>
                    <td
                      style={{
                        ...analyticsTdBaseStyle("center"),
                        padding: "8px 12px",
                        borderLeft: "1px solid var(--border-subtle)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color:
                            c.noMargin > 50
                              ? "var(--accent-green)"
                              : c.noMargin > 30
                                ? "var(--accent-amber)"
                                : "var(--text-muted)",
                        }}
                        dir="ltr"
                      >
                        {fmt2(c.noMargin)}%
                      </span>
                    </td>
                    <td
                      style={{
                        ...analyticsTdBaseStyle("center"),
                        padding: "8px 12px",
                      }}
                    >
                      <span
                        style={{ fontSize: 10, color: "var(--text-muted)" }}
                        dir="ltr"
                      >
                        {fmt2(c.noSales)}%
                      </span>
                    </td>
                  </tr>

                  {/* صفوف المنتجات */}
                  <AnimatePresence initial={false}>
                    {isOpen &&
                      c.products.map((p, pi) => (
                        <motion.tr
                          key={p.name}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18, delay: pi * 0.03 }}
                          style={{
                            borderBottom: "1px solid var(--border-subtle)",
                            background: "rgba(0,229,160,0.02)",
                          }}
                        >
                          <td
                            style={{
                              ...analyticsTdBaseStyle("right"),
                              padding: "6px 12px 6px 30px",
                              fontSize: 10,
                              color: "var(--text-secondary)",
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <ChevronRight
                                size={10}
                                style={{
                                  color: "var(--accent-green)",
                                  opacity: 0.5,
                                }}
                              />
                              {p.name}
                            </div>
                          </td>
                          <td
                            style={{
                              ...analyticsTdBaseStyle("center"),
                              padding: "6px 12px",
                              borderLeft: "1px solid var(--border-subtle)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 600,
                                color:
                                  p.withMargin > 50
                                    ? "var(--accent-green)"
                                    : p.withMargin > 30
                                      ? "var(--accent-amber)"
                                      : "var(--accent-red)",
                              }}
                              dir="ltr"
                            >
                              {fmt2(p.withMargin)}%
                            </span>
                          </td>
                          <td
                            style={{
                              ...analyticsTdBaseStyle("center"),
                              padding: "6px 12px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 9.5,
                                color: "var(--text-muted)",
                              }}
                              dir="ltr"
                            >
                              {fmt2(p.withSales)}%
                            </span>
                          </td>
                          <td
                            style={{
                              ...analyticsTdBaseStyle("center"),
                              padding: "6px 12px",
                              borderLeft: "1px solid var(--border-subtle)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 600,
                                color:
                                  p.noMargin > 50
                                    ? "var(--accent-green)"
                                    : p.noMargin > 30
                                      ? "var(--accent-amber)"
                                      : "var(--text-muted)",
                              }}
                              dir="ltr"
                            >
                              {fmt2(p.noMargin)}%
                            </span>
                          </td>
                          <td
                            style={{
                              ...analyticsTdBaseStyle("center"),
                              padding: "6px 12px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 9.5,
                                color: "var(--text-muted)",
                              }}
                              dir="ltr"
                            >
                              {fmt2(p.noSales)}%
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </AnalyticsTable>
        </div>
      </div>

      {/* ── إجمالي الخصومات بمرور الوقت ── */}
      <div className="glass-panel overflow-hidden">
        <div
          className="px-5 py-3 border-b flex items-center justify-between flex-wrap gap-2"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div>
            <h3
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              إجمالي الخصومات بمرور الوقت
            </h3>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Total Discounts Over Time
            </p>
          </div>
          <div
            className="flex items-center gap-1 p-0.5 rounded-lg"
            style={{ background: "var(--bg-elevated)" }}
          >
            {(["شهري", "ربعي", "سنوي"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setDiscountPeriod(p)}
                className="px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all"
                style={{
                  background:
                    discountPeriod === p
                      ? "rgba(245,158,11,0.15)"
                      : "transparent",
                  color: discountPeriod === p ? "#f59e0b" : "var(--text-muted)",
                  border:
                    discountPeriod === p
                      ? "1px solid rgba(245,158,11,0.3)"
                      : "1px solid transparent",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <ChartCard title="" option={discountTrendOption} height="260px" />
      </div>

      {/* ── جدول أداء الفروع ── */}
      <div className="glass-panel overflow-hidden">
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <SectionTitleWithFlag title="تفاصيل أداء الخصومات حسب الفرع" />
          <p
            className="text-[10px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Branch Discount Performance Details
          </p>
        </div>
        <div className="overflow-x-auto">
          <AnalyticsTable
            headers={[
              { label: "الفرع", align: "right" },
              { label: "الفواتير", align: "center" },
              { label: "ف. مخصومة", align: "center" },
              { label: "% الفواتير المخصومة", align: "center" },
              { label: "ف. بدون خصم", align: "center" },
              { label: "متوسط الخصم", align: "center" },
              { label: "مبيعات مخصومة", align: "center" },
              { label: "حجم مخصوم", align: "center" },
              { label: "صافي المبيعات", align: "center" },
              { label: "الخصومات المطبقة", align: "center" },
              { label: "% الاستخدام", align: "center" },
              { label: "متوسط % الخصم", align: "center" },
            ]}
          >
            {branches.map((b) => {
              const isTotal = b.name === "الإجمالي";
              const hasSubs = "subs" in b && (b as any).subs;
              const brKey = `br_${b.name}`;
              const isBrOpen = expandedCats.has(brKey);

              const renderCells = (
                row: typeof b,
                isSub = false,
                isProd = false,
              ) => (
                <>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.invoices.toFixed(isProd ? 0 : 2)}
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.discInv}
                    </span>
                  </td>
                  <AnalyticsBarCell
                    value={row.discRate}
                    max={100}
                    color="#3b82f6"
                    text={`${row.discRate.toFixed(2)}%`}
                  />
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.noDiscInv}
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.avgDisc.toFixed(2)}
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.discSales.toFixed(2)}
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.discVol}
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.netSales.toFixed(2)}
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.appDisc.toFixed(2)}
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.utilRate.toFixed(2)}%
                    </span>
                  </td>
                  <td style={analyticsTdBaseStyle("center")} dir="ltr">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {row.avgDiscRate.toFixed(2)}%
                    </span>
                  </td>
                </>
              );

              return (
                <React.Fragment key={b.name}>
                  {/* صف الفرع */}
                  <tr
                    onClick={() => (hasSubs ? toggleCat(brKey) : undefined)}
                    className={
                      isTotal ? "" : "hover:bg-white/[0.015] transition-colors"
                    }
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      background: isTotal
                        ? "var(--accent-green-dim)"
                        : isBrOpen
                          ? "rgba(4,120,87,0.04)"
                          : "transparent",
                      fontWeight: isTotal ? 700 : 400,
                      cursor: hasSubs ? "pointer" : "default",
                    }}
                  >
                    <td
                      style={{
                        ...analyticsTdBaseStyle("right"),
                        fontSize: 11,
                        fontWeight: isTotal ? 700 : 600,
                        color: isTotal
                          ? "var(--accent-green)"
                          : "var(--text-primary)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {hasSubs && (
                          <span
                            style={{
                              color: "var(--accent-green)",
                              transition: "transform 0.2s",
                              display: "inline-block",
                              transform: isBrOpen
                                ? "rotate(0deg)"
                                : "rotate(-90deg)",
                            }}
                          >
                            <ChevronDown size={13} />
                          </span>
                        )}
                        {b.name}
                        {hasSubs && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{
                              background: "var(--bg-elevated)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {(b as any).subs.length}
                          </span>
                        )}
                      </div>
                    </td>
                    {renderCells(b)}
                  </tr>

                  {/* صفوف الفئات (sub) */}
                  <AnimatePresence initial={false}>
                    {isBrOpen &&
                      hasSubs &&
                      (b as any).subs.map((sub: any, si: number) => {
                        const subKey = `brs_${b.name}_${sub.name}`;
                        const isSubOpen = expandedCats.has(subKey);
                        return (
                          <React.Fragment key={sub.name}>
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.18, delay: si * 0.03 }}
                              onClick={() => toggleCat(subKey)}
                              className="cursor-pointer hover:bg-white/[0.015] transition-colors"
                              style={{
                                borderBottom: "1px solid var(--border-subtle)",
                                background: isSubOpen
                                  ? "rgba(8,145,178,0.04)"
                                  : "rgba(4,120,87,0.02)",
                              }}
                            >
                              <td
                                style={{
                                  ...analyticsTdBaseStyle("right"),
                                  padding: "6px 10px 6px 28px",
                                  fontSize: 10,
                                  color: "var(--text-secondary)",
                                }}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span
                                    style={{
                                      color: "var(--accent-cyan)",
                                      transition: "transform 0.2s",
                                      display: "inline-block",
                                      transform: isSubOpen
                                        ? "rotate(0deg)"
                                        : "rotate(-90deg)",
                                    }}
                                  >
                                    <ChevronDown size={11} />
                                  </span>
                                  {sub.name}
                                  <span
                                    className="text-[8px] px-1 py-0.5 rounded"
                                    style={{
                                      background: "var(--bg-elevated)",
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    {sub.products.length}
                                  </span>
                                </div>
                              </td>
                              {renderCells(sub, true)}
                            </motion.tr>

                            {/* صفوف المنتجات (sub al sub) */}
                            <AnimatePresence initial={false}>
                              {isSubOpen &&
                                sub.products.map((prod: any, pi: number) => (
                                  <motion.tr
                                    key={prod.name}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{
                                      duration: 0.15,
                                      delay: pi * 0.03,
                                    }}
                                    style={{
                                      borderBottom:
                                        "1px solid var(--border-subtle)",
                                      background: "rgba(8,145,178,0.02)",
                                    }}
                                  >
                                    <td
                                      style={{
                                        ...analyticsTdBaseStyle("right"),
                                        padding: "5px 10px 5px 48px",
                                        fontSize: 9.5,
                                        color: "var(--text-muted)",
                                      }}
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <ChevronRight
                                          size={9}
                                          style={{
                                            color: "var(--accent-amber)",
                                            opacity: 0.6,
                                          }}
                                        />
                                        {prod.name}
                                      </div>
                                    </td>
                                    {renderCells(prod, false, true)}
                                  </motion.tr>
                                ))}
                            </AnimatePresence>
                          </React.Fragment>
                        );
                      })}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </AnalyticsTable>
        </div>
      </div>

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
    </div>
  );
}
