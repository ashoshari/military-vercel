"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  Building2,
  MapPin,
  Truck,
  Package,
  Search,
  Percent,
  CreditCard,
  X,
  RotateCcw,
  FileBarChart2,
  Check,
  Layers,
  Clock,
  Store,
  MapPinned,
  Tag,
  ShoppingCart,
  Handshake,
} from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import { useSidebarStore } from "@/store/sidebarStore";

const DEFAULT_INSTANT_PERIOD = "month";
const DEFAULT_SALES_INSTANT_PERIOD = "month";

const DASHBOARD_HEADER_PX = 64;
const LG_BREAKPOINT = 1024;
/** بعد هذا التمرير تُخفى «تقارير تفصيلية» في /sales وتُثبّت فلاتر لحظي على مستوى الصفحة. */
const SALES_SCROLL_REPORTS_THRESHOLD = 48;

// ═══════════════════════════════════════════════
// بيانات الفلاتر
// ═══════════════════════════════════════════════
const QUICK_PERIODS = [
  { value: "week", label: "الأسبوع" },
  { value: "month", label: "الشهر" },
  { value: "quarter", label: "الربع" },
  { value: "year", label: "السنة" },
];

/** صفحة /sales: فترة لحظية — شهري فقط. */
const SALES_PAGE_QUICK_PERIODS = [{ value: "month", label: "شهري" }];

const SALES_QUICK_PERIOD_VALUES = new Set<string>(
  SALES_PAGE_QUICK_PERIODS.map((p) => p.value),
);

/** صفحة /branches: خيار «شهر» واحد (كما كان). */
const BRANCHES_PAGE_QUICK_PERIODS = [{ value: "month", label: "شهري" }];

/** صفحة /employees: فترة لحظية — شهري فقط. */
const EMPLOYEES_PAGE_QUICK_PERIODS = [{ value: "month", label: "شهري" }];

/** صفحة /ai-basket — فترة لحظية شهري فقط. */
const AI_BASKET_PAGE_QUICK_PERIODS = [{ value: "month", label: "شهري" }];

/** صفحة /ai-basket — وقت البيع (صباح / مساء) */
const AI_BASKET_SHIFTS = [
  { value: "all", label: "كل الفترات" },
  { value: "morning", label: "صباح" },
  { value: "evening", label: "مساء" },
] as const;

/** صفحة /ai-basket — العروض */
const AI_BASKET_OFFERS = [
  { value: "", label: "كل العروض" },
  { value: "seasonal", label: "عروض موسمية" },
  { value: "weekend", label: "عطلة نهاية الأسبوع" },
  { value: "clearance", label: "تصفيات" },
  { value: "bundle", label: "عبوات مجمّعة" },
  { value: "loyalty", label: "ولاء العملاء" },
] as const;

/** صفحة /ai-basket — القيمة المادية للسلة (د.أ) */
const BASKET_VALUE_RANGES = [
  {
    label: "كل القيم",
    range: [0, 100_000] as [number, number],
  },
  { label: "٠–٥٠ د.أ", range: [0, 50] as [number, number] },
  { label: "٥٠–١٠٠ د.أ", range: [50, 100] as [number, number] },
  { label: "١٠٠–٢٠٠ د.أ", range: [100, 200] as [number, number] },
  { label: "٢٠٠ د.أ فأكثر", range: [200, 100_000] as [number, number] },
] as const;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** تاريخ محلي بصيغة YYYY-MM-DD (بدون انزياح UTC). */
function formatLocalYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** نطاق التاريخ لفترة «شهري» في صفحة المبيعات (الشهر التقويمي الحالي). */
function getSalesQuickPeriodRange(
  period: string,
): { from: string; to: string } | null {
  if (!SALES_QUICK_PERIOD_VALUES.has(period)) return null;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  return { from: formatLocalYmd(start), to: formatLocalYmd(end) };
}

const REGIONS = [
  { value: "all", label: "كل الأقاليم" },
  { value: "north", label: "الشمال" },
  { value: "center", label: "الوسط" },
  { value: "south", label: "الجنوب" },
  { value: "east", label: "الشرق" },
];

const BRANCHES = [
  { value: "all", label: "كل الفروع" },
  { value: "amman", label: "عمّان" },
  { value: "irbid", label: "إربد" },
  { value: "zarqa", label: "الزرقاء" },
  { value: "aqaba", label: "العقبة" },
  { value: "karak", label: "الكرك" },
  { value: "mafrak", label: "المفرق" },
  { value: "salt", label: "السلط" },
];

/** صفحة /customers فقط — المناسبات */
const CUSTOMER_HOLIDAYS = [
  { value: "", label: "كل المناسبات" },
  { value: "eid_fitr", label: "عيد الفطر" },
  { value: "eid_adha", label: "عيد الأضحى" },
  { value: "ramadan", label: "رمضان" },
  { value: "national_day", label: "اليوم الوطني" },
  { value: "back_to_school", label: "العودة للمدارس" },
] as const;

/** صفحة /ai-basket — خيارات العطل/المناسبات (نفس القيم مع تسمية أوضح لل«الكل»). */
const AI_BASKET_HOLIDAY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "كل الأيام" },
  ...CUSTOMER_HOLIDAYS.slice(1).map((o) => ({
    value: o.value,
    label: o.label,
  })),
];

/** صفحة /branches — تقارير: خيارات العطل/المناسبات */
const BRANCH_HOLIDAY_OPTIONS = AI_BASKET_HOLIDAY_OPTIONS;

/** صفحة /employees — المدن (لحظي). */
const EMPLOYEES_CITIES = [
  { value: "all", label: "كل المدن" },
  { value: "amman", label: "عمّان" },
  { value: "irbid", label: "إربد" },
  { value: "zarqa", label: "الزرقاء" },
  { value: "aqaba", label: "العقبة" },
  { value: "karak", label: "الكرك" },
  { value: "mafrak", label: "المفرق" },
  { value: "salt", label: "السلط" },
] as const;

/** صفحة /employees — وقت البيع */
const WORK_SHIFTS = [
  { value: "all", label: "الكل" },
  { value: "morning", label: "صباحاً" },
  { value: "evening", label: "مساء" },
] as const;

/** صفحة /employees — نسبة المرتجعات (٪) */
const RETURN_RATE_RANGES = [
  {
    value: "all",
    label: "كل نسب المرتجعات",
    range: [0, 100] as [number, number],
  },
  { value: "0-1", label: "0% - 1%", range: [0, 1] as [number, number] },
  { value: "1-3", label: "1% - 3%", range: [1, 3] as [number, number] },
  { value: "3-6", label: "3% - 6%", range: [3, 6] as [number, number] },
  { value: "6+", label: "6% فأكثر", range: [6, 100] as [number, number] },
] as const;

/** صفحة /employees — نسبة عدد الفواتير اليومية (٪) */
const DAILY_INVOICE_RATIO_RANGES = [
  {
    value: "all",
    label: "كل نسب الفواتير اليومية",
    range: [0, 100] as [number, number],
  },
  { value: "0-1", label: "0% - 1%", range: [0, 1] as [number, number] },
  { value: "1-3", label: "1% - 3%", range: [1, 3] as [number, number] },
  { value: "3-6", label: "3% - 6%", range: [3, 6] as [number, number] },
  { value: "6+", label: "6% فأكثر", range: [6, 100] as [number, number] },
] as const;

/** صفحة /employees — نسبة أداء الموظفين (٪) */
const EMPLOYEE_PERFORMANCE_RATIO_RANGES = [
  {
    value: "all",
    label: "كل نسب الأداء",
    range: [0, 100] as [number, number],
  },
  { value: "0-1", label: "0% - 1%", range: [0, 1] as [number, number] },
  { value: "1-3", label: "1% - 3%", range: [1, 3] as [number, number] },
  { value: "3-6", label: "3% - 6%", range: [3, 6] as [number, number] },
  { value: "6+", label: "6% فأكثر", range: [6, 100] as [number, number] },
] as const;

/** فلاتر المبيعات — مجموعات هرمية (صفحة /sales فقط). */
const SALES_GROUP_1 = [
  { value: "all", label: "كل المجموعة الأولى" },
  { value: "grocery", label: "بقالة عامة" },
  { value: "fresh", label: "طازج ومبرد" },
  { value: "frozen", label: "مجمد" },
  { value: "dry", label: "جاف ومعلب" },
];
const SALES_GROUP_2 = [
  { value: "all", label: "كل المجموعة الثانية" },
  { value: "national", label: "علامات وطنية" },
  { value: "import", label: "علامات مستوردة" },
  { value: "private", label: "ماركة خاصة" },
  { value: "organic", label: "عضوي" },
];
const SALES_GROUP_3 = [
  { value: "all", label: "كل المجموعة الثالثة" },
  { value: "promo", label: "عروض وتخفيضات" },
  { value: "regular", label: "سعر عادي" },
  { value: "bundle", label: "عبوات مجمّعة" },
  { value: "bulk", label: "بيع بالجملة" },
];

/** صفحة /sales — الشركات (لحظي) */
const SALES_COMPANIES = [
  { value: "all", label: "كل الشركات" },
  { value: "mcc", label: "شركة المستهلك العسكري" },
  { value: "national_food", label: "شركات غذائية وطنية" },
  { value: "import_partner", label: "شريك استيراد" },
];

/** صفحة /sales — الاتفاقيات (تقارير تفصيلية) */
const SALES_AGREEMENTS = [
  { value: "all", label: "كل الاتفاقيات" },
  { value: "retail", label: "اتفاقية تجزئة" },
  { value: "wholesale", label: "اتفاقية جملة" },
  { value: "framework", label: "إطار تعاقدي عام" },
];

const DISTRIBUTORS = [
  "الموزع الأول - محمد أحمد",
  "الموزع الثاني - خالد سليم",
  "الموزع الثالث - فيصل أمين",
  "موزع العقبة - ياسر نور",
  "موزع إربد - رامي سعد",
];
const CATEGORIES = [
  "بقالة",
  "ألبان",
  "لحوم",
  "مشروبات",
  "منزلية",
  "عناية شخصية",
  "أجهزة إلكترونية",
  "وجبات سريعة",
  "ورقية",
  "أطفال",
];
const PRODUCTS = [
  "أرز عنبر 5كجم",
  "زيت نباتي 1.8L",
  "سكر أبيض 2كجم",
  "شاي ليبتون 100كيس",
  "دجاج مبرد",
  "حليب نيدو",
  "مياه معدنية",
  "شامبو هيد آند شولدرز",
  "معجون كولجيت",
];
const SALES_INSTANT_PRODUCTS = [
  { value: "", label: "كل المنتجات" },
  ...PRODUCTS.map((p) => ({ value: p, label: p })),
];
const DISCOUNTS = ["0%", "1-2%", "2-5%", "5-10%", "11-25%"];
const PAYMENT_TYPES = ["نقدي", "فيزا / بطاقة", "محفظة إلكترونية", "آجل / ذمم"];

/** صفحة /sales فقط — طريقة البيع (تقارير تفصيلية). */
const SALE_METHOD_OPTIONS = [
  "بيع مباشر — فرع",
  "أونلاين / تطبيق",
  "توصيل",
  "جملة",
];

/** صفحة /products فقط — مجموعات المنتجات (تقارير تفصيلية). */
const PRODUCTS_GROUP_1 = [
  "بقالة",
  "ألبان",
  "لحوم",
  "مشروبات",
  "منزلية",
  "عناية شخصية",
  "أجهزة إلكترونية",
  "وجبات سريعة",
  "ورقية",
  "أطفال",
];
const PRODUCTS_GROUP_2 = ["أساسيات", "طازج", "مبرد", "مجمد", "معلب", "عناية"];
const PRODUCTS_GROUP_3 = ["عروض", "سعر عادي", "ماركة خاصة", "مستورد", "عضوي"];

// ═══════════════════════════════════════════════
// أدوات مساعدة
// ═══════════════════════════════════════════════
function useClickOutside(
  ref: React.RefObject<HTMLDivElement | null>,
  cb: () => void,
) {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

// ═══════════════════════════════════════════════
// Dropdown بسيط
// ═══════════════════════════════════════════════
function Dropdown({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  accent = "var(--accent-green)",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const display = options.find((o) => o.value === value)?.label ?? label;
  const isChanged = value !== options[0].value;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02]"
        style={{
          background: isChanged
            ? `color-mix(in srgb, ${accent} 15%, transparent)`
            : "var(--bg-elevated)",
          border: `1px solid ${isChanged ? accent : "var(--border-subtle)"}`,
          color: isChanged ? accent : "var(--text-secondary)",
          whiteSpace: "nowrap",
        }}
      >
        <Icon size={12} style={{ color: accent }} />
        {display}
        <ChevronDown
          size={10}
          style={{
            opacity: 0.6,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            className="z-1050"
            transition={{ duration: 0.13 }}
            style={{
              position: "absolute",
              top: "calc(100% + 5px)",
              right: 0,
              zIndex: 1050,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,.4)",
              minWidth: 150,
              overflow: "hidden",
            }}
          >
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className="w-full text-right px-3 py-2 text-[11px] transition-colors hover:bg-white/5 block"
                style={{
                  color: o.value === value ? accent : "var(--text-secondary)",
                  fontWeight: o.value === value ? 700 : 400,
                }}
              >
                {o.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** اختيار متعدد؛ المصفوفة الفارغة = خيار «الكل» (أول عنصر في options). */
function MultiSelectDropdown({
  icon: Icon,
  label,
  selectedValues,
  options,
  onChange,
  accent = "var(--accent-green)",
  manyLabel,
}: {
  icon: React.ElementType;
  label: string;
  selectedValues: string[];
  options: { value: string; label: string }[];
  onChange: (values: string[]) => void;
  accent?: string;
  /** مثال: (n) => `${n} أقاليم` */
  manyLabel: (count: number) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const allOption = options[0];
  const rest = options.slice(1);
  const isDefault = selectedValues.length === 0;

  const display = (() => {
    if (isDefault) return allOption.label;
    if (selectedValues.length === 1) {
      return rest.find((o) => o.value === selectedValues[0])?.label ?? label;
    }
    return manyLabel(selectedValues.length);
  })();

  const isChanged = !isDefault;

  const toggle = (value: string) => {
    if (value === allOption.value) {
      onChange([]);
      return;
    }
    const set = new Set(selectedValues);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    onChange([...set]);
  };

  const rowSelected = (value: string) =>
    value === allOption.value ? isDefault : selectedValues.includes(value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02]"
        style={{
          background: isChanged
            ? `color-mix(in srgb, ${accent} 15%, transparent)`
            : "var(--bg-elevated)",
          border: `1px solid ${isChanged ? accent : "var(--border-subtle)"}`,
          color: isChanged ? accent : "var(--text-secondary)",
          whiteSpace: "nowrap",
          maxWidth: 200,
        }}
      >
        <Icon size={12} style={{ color: accent, flexShrink: 0 }} />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {display}
        </span>
        <ChevronDown
          size={10}
          style={{
            opacity: 0.6,
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            className="z-1050"
            transition={{ duration: 0.13 }}
            style={{
              position: "absolute",
              top: "calc(100% + 5px)",
              right: 0,
              zIndex: 1050,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,.4)",
              minWidth: 180,
              maxHeight: 280,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {options.map((o) => {
              const sel = rowSelected(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggle(o.value)}
                  className="w-full text-right px-3 py-2 text-[11px] transition-colors hover:bg-white/5 flex items-center justify-between gap-2"
                  style={{
                    color: sel ? accent : "var(--text-secondary)",
                    fontWeight: sel ? 700 : 400,
                  }}
                >
                  <span className="min-w-0 flex-1">{o.label}</span>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: `1.5px solid ${sel ? accent : "var(--border-subtle)"}`,
                      background: sel
                        ? `color-mix(in srgb, ${accent} 22%, transparent)`
                        : "transparent",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {sel && (
                      <Check
                        size={12}
                        strokeWidth={3}
                        style={{ color: accent }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════
// Dropdown بحث (للموزع / الفئة / المنتج)
// ═══════════════════════════════════════════════
function SearchDropdown({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  accent = "#a855f7",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => {
    setOpen(false);
    setQ("");
  });
  const filtered = options.filter((o) => o.includes(q));
  const isSet = !!value;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02]"
        style={{
          background: isSet
            ? `color-mix(in srgb, ${accent} 15%, transparent)`
            : "var(--bg-elevated)",
          border: `1px solid ${isSet ? accent : "var(--border-subtle)"}`,
          color: isSet ? accent : "var(--text-secondary)",
          whiteSpace: "nowrap",
          maxWidth: 140,
        }}
      >
        <Icon size={12} style={{ color: accent }} />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 90,
          }}
        >
          {value || label}
        </span>
        <ChevronDown
          size={10}
          style={{
            opacity: 0.6,
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            style={{
              position: "absolute",
              top: "calc(100% + 5px)",
              right: 0,
              zIndex: 1050,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,.4)",
              width: 200,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "8px 8px 4px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  borderRadius: 7,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <Search
                  size={10}
                  style={{ color: "var(--text-muted)", flexShrink: 0 }}
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="بحث..."
                  autoFocus
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: 11,
                    color: "var(--text-primary)",
                    width: "100%",
                    direction: "rtl",
                  }}
                />
              </div>
            </div>
            <div style={{ maxHeight: 180, overflowY: "auto" }}>
              {value && (
                <button
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                    setQ("");
                  }}
                  className="w-full text-right px-3 py-1.5 text-[10px] transition-colors hover:bg-white/5 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  ✕ إلغاء الاختيار
                </button>
              )}
              {filtered.map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                    setQ("");
                  }}
                  className="w-full text-right px-3 py-1.5 text-[11px] transition-colors hover:bg-white/5 block"
                  style={{
                    color: o === value ? accent : "var(--text-secondary)",
                    fontWeight: o === value ? 700 : 400,
                  }}
                >
                  {o}
                </button>
              ))}
              {filtered.length === 0 && (
                <p
                  style={{
                    padding: "8px 12px",
                    fontSize: 10,
                    color: "var(--text-muted)",
                  }}
                >
                  لا توجد نتائج
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════
// Date picker dropdown
// ═══════════════════════════════════════════════
function DateFilterDropdown({
  activePeriod,
  setActivePeriod,
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  quickPeriodOptions = QUICK_PERIODS,
  /** صفحة /sales: وضع «فترة محددة» يستخدم حقول شهر/سنة. */
  useMonthRangePickers = false,
  /** عند اختيار فترة سريعة: تعبئة من/إلى (مثلاً صفحة المبيعات). */
  fillQuickPeriodDates,
  /** عند الفترة السريعة = شهر فقط (فروع): «فترة محددة» إما يوم أو شهر. */
  rangeGranularity = "month",
}: {
  activePeriod: string;
  setActivePeriod: (v: string) => void;
  dateFrom: string;
  dateTo: string;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  quickPeriodOptions?: { value: string; label: string }[];
  useMonthRangePickers?: boolean;
  fillQuickPeriodDates?: (value: string) => { from: string; to: string } | null;
  rangeGranularity?: "month" | "day";
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"quick" | "range">("quick");
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const label =
    mode === "range" && dateFrom
      ? `${dateFrom}${dateTo ? " → " + dateTo : ""}`
      : (quickPeriodOptions.find((p) => p.value === activePeriod)?.label ??
        "التاريخ");

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02]"
        style={{
          background:
            "color-mix(in srgb, var(--accent-green) 12%, transparent)",
          border: "1px solid var(--accent-green)",
          color: "var(--accent-green)",
          whiteSpace: "nowrap",
        }}
      >
        <Calendar size={12} style={{ color: "var(--accent-green)" }} />
        {label}
        <ChevronDown
          size={10}
          style={{
            opacity: 0.6,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            style={{
              position: "absolute",
              top: "calc(100% + 5px)",
              right: 0,
              zIndex: 1050,
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              boxShadow: "0 8px 30px rgba(0,0,0,.45)",
              width: 240,
              overflow: "hidden",
            }}
          >
            {/* Tabs */}
            <div style={{ display: "flex", padding: "8px 8px 0", gap: 4 }}>
              {(["quick", "range"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-1.5 rounded-md text-[10px] font-semibold transition-all"
                  style={{
                    background:
                      mode === m
                        ? "rgba(0,229,160,0.12)"
                        : "var(--bg-elevated)",
                    color:
                      mode === m ? "var(--accent-green)" : "var(--text-muted)",
                    border: `1px solid ${mode === m ? "rgba(0,229,160,0.3)" : "var(--border-subtle)"}`,
                  }}
                >
                  {m === "quick" ? "⚡ سريع" : "📅 فترة محددة"}
                </button>
              ))}
            </div>
            <div style={{ padding: "8px" }}>
              {mode === "quick" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 4,
                  }}
                >
                  {quickPeriodOptions.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        setActivePeriod(p.value);
                        const filled = fillQuickPeriodDates?.(p.value);
                        if (filled?.from && filled?.to) {
                          setDateFrom(filled.from);
                          setDateTo(filled.to);
                        } else {
                          setDateFrom("");
                          setDateTo("");
                        }
                        setOpen(false);
                      }}
                      className="py-2 rounded-lg text-[11px] font-medium transition-all hover:scale-[1.02]"
                      style={{
                        background:
                          activePeriod === p.value
                            ? "rgba(0,229,160,0.12)"
                            : "var(--bg-elevated)",
                        border: `1px solid ${activePeriod === p.value ? "var(--accent-green)" : "var(--border-subtle)"}`,
                        color:
                          activePeriod === p.value
                            ? "var(--accent-green)"
                            : "var(--text-secondary)",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {[
                    { label: "من", val: dateFrom, set: setDateFrom },
                    { label: "إلى", val: dateTo, set: setDateTo },
                  ].map((f, idx) => {
                    // /branches: نطاق باليوم
                    if (rangeGranularity === "day") {
                      return (
                        <div key={f.label}>
                          <label
                            style={{
                              fontSize: 9,
                              color: "var(--text-muted)",
                              display: "block",
                              marginBottom: 3,
                            }}
                          >
                            {f.label}
                          </label>
                          <input
                            type="date"
                            value={f.val}
                            onChange={(e) => f.set(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "5px 8px",
                              borderRadius: 7,
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border-subtle)",
                              color: "var(--text-primary)",
                              fontSize: 11,
                              outline: "none",
                            }}
                          />
                        </div>
                      );
                    }

                    // /sales في «فترة محددة»: شهر/سنة فقط
                    if (useMonthRangePickers && rangeGranularity === "month") {
                      // Derive YYYY-MM for the month input from stored ISO date (if any)
                      const ym =
                        f.val && f.val.length >= 7 ? f.val.slice(0, 7) : "";

                      const handleMonthChange = (value: string) => {
                        if (!value) {
                          f.set("");
                          return;
                        }
                        const [yearStr, monthStr] = value.split("-");
                        const year = Number(yearStr);
                        const month = Number(monthStr); // 1-12
                        if (!year || !month) {
                          f.set("");
                          return;
                        }
                        if (idx === 0) {
                          // from: first day of month
                          f.set(`${yearStr}-${monthStr}-${"01"}`);
                        } else {
                          // to: last day of month
                          const lastDay = new Date(year, month, 0).getDate();
                          const dd = String(lastDay).padStart(2, "0");
                          f.set(`${yearStr}-${monthStr}-${dd}`);
                        }
                      };

                      return (
                        <div key={f.label}>
                          <label
                            style={{
                              fontSize: 9,
                              color: "var(--text-muted)",
                              display: "block",
                              marginBottom: 3,
                            }}
                          >
                            {f.label}
                          </label>
                          <input
                            type="month"
                            value={ym}
                            onChange={(e) => handleMonthChange(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "5px 8px",
                              borderRadius: 7,
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border-subtle)",
                              color: "var(--text-primary)",
                              fontSize: 11,
                              outline: "none",
                            }}
                          />
                        </div>
                      );
                    }

                    // Default behaviour: full date
                    return (
                      <div key={f.label}>
                        <label
                          style={{
                            fontSize: 9,
                            color: "var(--text-muted)",
                            display: "block",
                            marginBottom: 3,
                          }}
                        >
                          {f.label}
                        </label>
                        <input
                          type="date"
                          value={f.val}
                          onChange={(e) => f.set(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "5px 8px",
                            borderRadius: 7,
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            fontSize: 11,
                            outline: "none",
                          }}
                        />
                      </div>
                    );
                  })}
                  {(dateFrom || dateTo) && (
                    <button
                      onClick={() => setOpen(false)}
                      style={{
                        padding: "6px 0",
                        borderRadius: 7,
                        background: "var(--btn-primary-bg)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      تطبيق
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════
// بوب اب تسمية التقرير
// ═══════════════════════════════════════════════
function ReportNameDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleConfirm = () => {
    const finalName = name.trim() || "تقرير مخصص";
    onConfirm(finalName);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        background: "rgba(5,9,18,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 400,
          boxShadow:
            "0 20px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(0,229,160,0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(0,229,160,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(0,229,160,0.25)",
              flexShrink: 0,
            }}
          >
            <FileBarChart2 size={17} style={{ color: "var(--accent-green)" }} />
          </div>
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              إنشاء تقرير جديد
            </p>
            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>
              سمّ التقرير ليسهل تتبّعه لاحقًا
            </p>
          </div>
        </div>

        {/* Input */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            اسم التقرير
          </label>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
              if (e.key === "Escape") onCancel();
            }}
            placeholder="مثال: تقرير مبيعات الربع الأول 2025"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              fontSize: 13,
              outline: "none",
              direction: "rtl",
              transition: "border-color .2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent-green)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border-subtle)";
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 18px",
              borderRadius: 9,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "8px 20px",
              borderRadius: 9,
              background: "var(--btn-primary-bg)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "var(--btn-primary-shadow)",
            }}
          >
            <FileBarChart2 size={13} /> بدء الإنشاء
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ReportCreatingPopup({
  name,
  onClose,
}: {
  name: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "var(--bg-panel)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 14,
        boxShadow: "0 12px 40px rgba(0,0,0,.5), 0 0 0 1px rgba(0,229,160,0.15)",
        padding: "16px 22px",
        minWidth: 340,
        maxWidth: 440,
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "2px solid rgba(0,229,160,0.2)",
          borderTop: "2px solid var(--accent-green)",
          animation: "spin 0.8s linear infinite",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: "0 0 2px",
          }}
        >
          جاري إنشاء التقرير…
        </p>
        {name && (
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--accent-green)",
              margin: "0 0 4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            📄 {name}
          </p>
        )}
        <p
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          سيتم إعلامك فور جهوز التقرير — يمكنك متابعة العمل
        </p>
        <div
          style={{
            marginTop: 8,
            height: 3,
            borderRadius: 3,
            background: "var(--bg-elevated)",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4.5, ease: "linear" }}
            style={{
              height: "100%",
              borderRadius: 3,
              background:
                "linear-gradient(90deg, var(--accent-green), var(--accent-cyan))",
            }}
          />
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          color: "var(--text-muted)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 4,
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// المكوّن الرئيسي
// ═══════════════════════════════════════════════
export default function GlobalFilterBar() {
  const pathname = usePathname();
  const isSalesPage = pathname === "/sales";
  const isBranchesPage = pathname === "/branches";
  const isEmployeesPage = pathname === "/employees";
  const isAiBasketPage = pathname === "/ai-basket";
  const isCustomersPage = pathname === "/customers";
  const isProductsPage = pathname === "/products";
  const {
    activeBranches,
    activePeriod,
    workShift,
    returnRateRange,
    employeeCities,
    dailyInvoiceRatioRange,
    employeePerformanceRatioRange,
    aiBasketCities,
    aiBasketSaleTime,
    aiBasketHoliday,
    aiBasketOffers,
    aiBasketValueRange,
    branchCities,
    branchSaleTime,
    branchHoliday,
    branchOffers,
    agreement,
    holiday,
    setActiveBranches,
    setActivePeriod,
    setFilter,
  } = useFilterStore();

  // فلاتر لحظية إضافية ([] = كل الأقاليم)
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /** فلاتر /sales — مجموعات + شركة + منتج (لحظي). */
  const [salesG1, setSalesG1] = useState<string[]>([]);
  const [salesG2, setSalesG2] = useState<string[]>([]);
  const [salesG3, setSalesG3] = useState<string[]>([]);
  const [salesCompany, setSalesCompany] = useState<string[]>([]);
  const [salesProduct, setSalesProduct] = useState<string[]>([]);

  /** فلاتر /branches — تقرير تفصيلي: المجموعات الثلاث. */
  /** /branches — لحظي: المجموعات الثلاث + المنتج */
  const [branchesInstantG1, setBranchesInstantG1] = useState<string[]>([]);
  const [branchesInstantG2, setBranchesInstantG2] = useState<string[]>([]);
  const [branchesInstantG3, setBranchesInstantG3] = useState<string[]>([]);
  const [branchesInstantProduct, setBranchesInstantProduct] = useState("");

  /** فلاتر /ai-basket — لحظي: المجموعة ١ و٢؛ تقرير: المجموعة ٣. */
  const [aiBasketG1, setAiBasketG1] = useState<string[]>([]);
  const [aiBasketG2, setAiBasketG2] = useState<string[]>([]);
  const [aiBasketReportG3, setAiBasketReportG3] = useState<string[]>([]);

  useEffect(() => {
    if (isSalesPage) {
      setActivePeriod(DEFAULT_SALES_INSTANT_PERIOD);
      const r = getSalesQuickPeriodRange(DEFAULT_SALES_INSTANT_PERIOD);
      if (r) {
        setDateFrom(r.from);
        setDateTo(r.to);
      }
      return;
    }
    if (isBranchesPage || isEmployeesPage || isAiBasketPage) {
      setActivePeriod(DEFAULT_INSTANT_PERIOD);
      setDateFrom("");
      setDateTo("");
      return;
    }
    setDateFrom("");
    setDateTo("");
    const ap = useFilterStore.getState().activePeriod;
    if (SALES_QUICK_PERIOD_VALUES.has(ap)) {
      setActivePeriod(DEFAULT_INSTANT_PERIOD);
    }
  }, [
    isSalesPage,
    isBranchesPage,
    isEmployeesPage,
    isAiBasketPage,
    setActivePeriod,
  ]);

  // فلاتر التقارير
  const [distributor, setDistributor] = useState("");
  const [category, setCategory] = useState("");
  const [product, setProduct] = useState("");
  const [discount, setDiscount] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [saleMethod, setSaleMethod] = useState("");
  const [prodG1, setProdG1] = useState("");
  const [prodG2, setProdG2] = useState("");
  const [prodG3, setProdG3] = useState("");
  const [prodName, setProdName] = useState("");

  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [reportName, setReportName] = useState("");

  const hasReportFilter = isSalesPage
    ? !!(paymentType || saleMethod || agreement.length > 0)
    : isEmployeesPage
      ? !!(paymentType || saleMethod)
      : isAiBasketPage
        ? !!(aiBasketReportG3.length || product || paymentType || saleMethod)
        : isBranchesPage
          ? !!(
              branchSaleTime !== "all" ||
              branchHoliday !== "" ||
              branchOffers !== "" ||
              paymentType ||
              saleMethod
            )
          : !!(
              distributor ||
              category ||
              product ||
              discount ||
              paymentType ||
              (isProductsPage && (prodG1 || prodG2 || prodG3 || prodName))
            );

  const handleCreateReport = useCallback(() => {
    setShowNameDialog(true);
  }, []);

  const handleConfirmName = useCallback(
    (name: string) => {
      setReportName(name);
      setShowNameDialog(false);
      setShowPopup(true);
      // reset report filters after submission
      setDistributor("");
      setCategory("");
      setProduct("");
      setDiscount("");
      setPaymentType("");
      setSaleMethod("");
      setFilter("agreement", []);
      setFilter("branchSaleTime", "all");
      setFilter("branchHoliday", "");
      setFilter("branchOffers", "");
      setAiBasketReportG3([]);
      setProdG1("");
      setProdG2("");
      setProdG3("");
      setProdName("");
    },
    [setFilter],
  );

  const resetAll = useCallback(() => {
    setActiveBranches([]);
    if (pathname === "/sales") {
      setActivePeriod(DEFAULT_SALES_INSTANT_PERIOD);
      const r = getSalesQuickPeriodRange(DEFAULT_SALES_INSTANT_PERIOD);
      if (r) {
        setDateFrom(r.from);
        setDateTo(r.to);
      }
    } else {
      setActivePeriod(DEFAULT_INSTANT_PERIOD);
      setDateFrom("");
      setDateTo("");
    }
    setActiveRegions([]);
    setFilter("employee", []);
    setFilter("employeeCities", []);
    setFilter("workShift", "all");
    setFilter("returnRateRange", [0, 100]);
    setFilter("dailyInvoiceRatioRange", [0, 100]);
    setFilter("employeePerformanceRatioRange", [0, 100]);
    setFilter("aiBasketCities", []);
    setFilter("aiBasketSaleTime", "all");
    setFilter("aiBasketHoliday", "");
    setFilter("aiBasketOffers", "");
    setFilter("aiBasketValueRange", [0, 100_000]);
    setFilter("branchCities", []);
    setFilter("branchSaleTime", "all");
    setFilter("branchHoliday", "");
    setFilter("branchOffers", "");
    setFilter("agreement", []);
    setFilter("holiday", "");
    setAiBasketG1([]);
    setAiBasketG2([]);
    setAiBasketReportG3([]);
    setBranchesInstantG1([]);
    setBranchesInstantG2([]);
    setBranchesInstantG3([]);
    setBranchesInstantProduct("");
    setSalesG1([]);
    setSalesG2([]);
    setSalesG3([]);
    setSalesCompany([]);
    setSalesProduct([]);
    setDistributor("");
    setCategory("");
    setProduct("");
    setDiscount("");
    setPaymentType("");
    setSaleMethod("");
    setProdG1("");
    setProdG2("");
    setProdG3("");
    setProdName("");
  }, [pathname, setActiveBranches, setActivePeriod, setFilter]);

  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const isMobileOpen = useSidebarStore((s) => s.isMobileOpen);
  const [isLgViewport, setIsLgViewport] = useState(true);
  const [salesShowReportsRow, setSalesShowReportsRow] = useState(true);
  const salesInstantFixedRef = useRef<HTMLDivElement>(null);
  const [salesInstantStripHeight, setSalesInstantStripHeight] = useState(0);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);
    const h = () => setIsLgViewport(mql.matches);
    h();
    mql.addEventListener("change", h);
    return () => mql.removeEventListener("change", h);
  }, []);

  const sidebarReservePx = !isLgViewport
    ? isMobileOpen
      ? 260
      : 0
    : isCollapsed
      ? 72
      : 260;

  useEffect(() => {
    if (!isSalesPage) {
      queueMicrotask(() => setSalesShowReportsRow(true));
      return;
    }
    const el = document.getElementById("dashboard-scroll-root");
    if (!el) return;
    const onScroll = () => {
      setSalesShowReportsRow(el.scrollTop <= SALES_SCROLL_REPORTS_THRESHOLD);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isSalesPage, pathname]);

  useLayoutEffect(() => {
    if (!isSalesPage || salesShowReportsRow) return;
    const node = salesInstantFixedRef.current;
    if (!node) return;
    const ro = new ResizeObserver(() => {
      setSalesInstantStripHeight(node.getBoundingClientRect().height);
    });
    ro.observe(node);
    setSalesInstantStripHeight(node.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, [
    isSalesPage,
    salesShowReportsRow,
    isLgViewport,
    isCollapsed,
    isMobileOpen,
  ]);

  if (pathname === "/reports") return null;

  const salesInstantDirty =
    isSalesPage &&
    (salesG1.length > 0 ||
      salesG2.length > 0 ||
      salesG3.length > 0 ||
      salesCompany.length > 0 ||
      salesProduct.length > 0);

  const defaultInstantPeriod = isSalesPage
    ? DEFAULT_SALES_INSTANT_PERIOD
    : DEFAULT_INSTANT_PERIOD;

  const isAnyInstantChanged =
    activeBranches.length > 0 ||
    activePeriod !== defaultInstantPeriod ||
    activeRegions.length > 0 ||
    (isBranchesPage && branchCities.length > 0) ||
    (isBranchesPage &&
      (branchesInstantG1.length > 0 ||
        branchesInstantG2.length > 0 ||
        branchesInstantG3.length > 0 ||
        branchesInstantProduct !== "")) ||
    dateFrom ||
    dateTo ||
    (isEmployeesPage && employeeCities.length > 0) ||
    (isEmployeesPage && workShift !== "all") ||
    (isEmployeesPage &&
      (returnRateRange[0] !== 0 || returnRateRange[1] !== 100)) ||
    (isEmployeesPage &&
      (dailyInvoiceRatioRange[0] !== 0 || dailyInvoiceRatioRange[1] !== 100)) ||
    (isEmployeesPage &&
      (employeePerformanceRatioRange[0] !== 0 ||
        employeePerformanceRatioRange[1] !== 100)) ||
    (isAiBasketPage && aiBasketCities.length > 0) ||
    (isAiBasketPage && aiBasketSaleTime !== "all") ||
    (isAiBasketPage && aiBasketHoliday !== "") ||
    (isAiBasketPage && aiBasketOffers !== "") ||
    (isAiBasketPage &&
      (aiBasketValueRange[0] !== 0 || aiBasketValueRange[1] !== 100_000)) ||
    (isAiBasketPage && (aiBasketG1.length > 0 || aiBasketG2.length > 0)) ||
    (isCustomersPage && holiday !== "") ||
    salesInstantDirty;

  return (
    <>
      {isSalesPage && !salesShowReportsRow && (
        <div
          ref={salesInstantFixedRef}
          style={{
            position: "fixed",
            top: DASHBOARD_HEADER_PX,
            left: 10,
            right: sidebarReservePx + 0,
            zIndex: 28,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
            rowGap: 8,

            background: "var(--bg-panel)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border-subtle)",
            boxShadow: "0 4px 12px rgba(0,0,0,.18)",
            padding: "8px 8px 6px 8px",
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "var(--accent-green)",
              letterSpacing: ".5px",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
            }}
          >
            ⚡ لحظي
          </span>
          <DateFilterDropdown
            activePeriod={activePeriod}
            setActivePeriod={setActivePeriod}
            dateFrom={dateFrom}
            dateTo={dateTo}
            setDateFrom={setDateFrom}
            setDateTo={setDateTo}
            quickPeriodOptions={[...SALES_PAGE_QUICK_PERIODS]}
            fillQuickPeriodDates={getSalesQuickPeriodRange}
            rangeGranularity="month"
          />
          <MultiSelectDropdown
            icon={MapPin}
            label="الإقليم"
            selectedValues={activeRegions}
            options={REGIONS}
            onChange={setActiveRegions}
            accent="var(--accent-cyan)"
            manyLabel={(n) => `${n} أقاليم`}
          />
          <MultiSelectDropdown
            icon={Building2}
            label="الفرع"
            selectedValues={activeBranches}
            options={BRANCHES}
            onChange={setActiveBranches}
            accent="var(--accent-green)"
            manyLabel={(n) => `${n} فروع`}
          />
          <MultiSelectDropdown
            icon={Layers}
            label="المجموعة الأولى"
            selectedValues={salesG1}
            options={SALES_GROUP_1}
            onChange={setSalesG1}
            accent="var(--accent-amber)"
            manyLabel={(n) => `${n} مجموعات`}
          />
          <MultiSelectDropdown
            icon={Layers}
            label="المجموعة الثانية"
            selectedValues={salesG2}
            options={SALES_GROUP_2}
            onChange={setSalesG2}
            accent="#f59e0b"
            manyLabel={(n) => `${n} مجموعات`}
          />
          <MultiSelectDropdown
            icon={Layers}
            label="المجموعة الثالثة"
            selectedValues={salesG3}
            options={SALES_GROUP_3}
            onChange={setSalesG3}
            accent="#ea580c"
            manyLabel={(n) => `${n} مجموعات`}
          />
          <MultiSelectDropdown
            icon={Building2}
            label="الشركة"
            selectedValues={salesCompany}
            options={SALES_COMPANIES}
            onChange={setSalesCompany}
            accent="#6366f1"
            manyLabel={(n) => `${n} شركات`}
          />
          <MultiSelectDropdown
            icon={Package}
            label="كل المنتجات"
            selectedValues={salesProduct}
            options={SALES_INSTANT_PRODUCTS}
            onChange={setSalesProduct}
            accent="#00d4ff"
            manyLabel={(n) => `${n} منتجات`}
          />
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginBottom: 16,
          borderRadius: 12,
          background: "var(--bg-panel)",
          border: "1px solid var(--border-subtle)",
          padding: "7px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          boxShadow: "0 2px 12px rgba(0,0,0,.2)",
          backdropFilter: "blur(20px)",
        }}
      >
        {isSalesPage && !salesShowReportsRow && (
          <div
            style={{
              width: "100%",
              flexShrink: 0,
              height: Math.max(salesInstantStripHeight, 1),
            }}
            aria-hidden
          />
        )}
        {!(isSalesPage && !salesShowReportsRow) && (
          <>
            {/* ── فلاتر لحظية ── */}
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: "var(--accent-green)",
                letterSpacing: ".5px",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
              }}
            >
              ⚡ لحظي
            </span>

            {isBranchesPage ? (
              <>
                <DateFilterDropdown
                  activePeriod={activePeriod}
                  setActivePeriod={setActivePeriod}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  setDateFrom={setDateFrom}
                  setDateTo={setDateTo}
                  quickPeriodOptions={[...BRANCHES_PAGE_QUICK_PERIODS]}
                  rangeGranularity="month"
                />
                <MultiSelectDropdown
                  icon={MapPin}
                  label="الإقليم"
                  selectedValues={activeRegions}
                  options={REGIONS}
                  onChange={setActiveRegions}
                  accent="var(--accent-cyan)"
                  manyLabel={(n) => `${n} أقاليم`}
                />
                <MultiSelectDropdown
                  icon={MapPinned}
                  label="المدينة"
                  selectedValues={branchCities}
                  options={[...EMPLOYEES_CITIES]}
                  onChange={(v) => setFilter("branchCities", v)}
                  accent="#38bdf8"
                  manyLabel={(n) => `${n} مدن`}
                />
                <MultiSelectDropdown
                  icon={Building2}
                  label="الفرع"
                  selectedValues={activeBranches}
                  options={BRANCHES}
                  onChange={setActiveBranches}
                  accent="var(--accent-green)"
                  manyLabel={(n) => `${n} فروع`}
                />
                <MultiSelectDropdown
                  icon={Layers}
                  label="المجموعة الأولى"
                  selectedValues={branchesInstantG1}
                  options={SALES_GROUP_1}
                  onChange={setBranchesInstantG1}
                  accent="var(--accent-amber)"
                  manyLabel={(n) => `${n} مجموعات`}
                />
                <MultiSelectDropdown
                  icon={Layers}
                  label="المجموعة الثانية"
                  selectedValues={branchesInstantG2}
                  options={SALES_GROUP_2}
                  onChange={setBranchesInstantG2}
                  accent="#f59e0b"
                  manyLabel={(n) => `${n} مجموعات`}
                />
                <MultiSelectDropdown
                  icon={Layers}
                  label="المجموعة الثالثة"
                  selectedValues={branchesInstantG3}
                  options={SALES_GROUP_3}
                  onChange={setBranchesInstantG3}
                  accent="#ea580c"
                  manyLabel={(n) => `${n} مجموعات`}
                />
                <SearchDropdown
                  icon={Search}
                  label="المنتج"
                  value={branchesInstantProduct}
                  options={PRODUCTS}
                  onChange={setBranchesInstantProduct}
                  accent="#00d4ff"
                />
              </>
            ) : isEmployeesPage ? (
              <>
                <DateFilterDropdown
                  activePeriod={activePeriod}
                  setActivePeriod={setActivePeriod}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  setDateFrom={setDateFrom}
                  setDateTo={setDateTo}
                  quickPeriodOptions={[...EMPLOYEES_PAGE_QUICK_PERIODS]}
                  rangeGranularity="month"
                />
                <MultiSelectDropdown
                  icon={MapPin}
                  label="الإقليم"
                  selectedValues={activeRegions}
                  options={REGIONS}
                  onChange={setActiveRegions}
                  accent="var(--accent-cyan)"
                  manyLabel={(n) => `${n} أقاليم`}
                />
                <MultiSelectDropdown
                  icon={MapPinned}
                  label="المدينة"
                  selectedValues={employeeCities}
                  options={[...EMPLOYEES_CITIES]}
                  onChange={(v) => setFilter("employeeCities", v)}
                  accent="#38bdf8"
                  manyLabel={(n) => `${n} مدن`}
                />
                <MultiSelectDropdown
                  icon={Building2}
                  label="الفرع"
                  selectedValues={activeBranches}
                  options={BRANCHES}
                  onChange={setActiveBranches}
                  accent="var(--accent-green)"
                  manyLabel={(n) => `${n} فروع`}
                />
                <Dropdown
                  icon={Clock}
                  label="وقت البيع"
                  value={workShift}
                  options={
                    WORK_SHIFTS as unknown as { value: string; label: string }[]
                  }
                  onChange={(v) =>
                    setFilter(
                      "workShift",
                      (v === "morning" || v === "evening" ? v : "all") as
                        | "all"
                        | "morning"
                        | "evening",
                    )
                  }
                  accent="var(--accent-cyan)"
                />
                <Dropdown
                  icon={Percent}
                  label="نسبة عدد الفواتير اليومية"
                  value={`${dailyInvoiceRatioRange[0]}-${dailyInvoiceRatioRange[1]}`}
                  options={DAILY_INVOICE_RATIO_RANGES.map((r) => ({
                    value: `${r.range[0]}-${r.range[1]}`,
                    label: r.label,
                  }))}
                  onChange={(v) => {
                    const hit = DAILY_INVOICE_RATIO_RANGES.find(
                      (r) => `${r.range[0]}-${r.range[1]}` === v,
                    );
                    setFilter(
                      "dailyInvoiceRatioRange",
                      hit ? hit.range : [0, 100],
                    );
                  }}
                  accent="#22c55e"
                />
                <Dropdown
                  icon={Percent}
                  label="نسبة المرتجعات"
                  value={`${returnRateRange[0]}-${returnRateRange[1]}`}
                  options={RETURN_RATE_RANGES.map((r) => ({
                    value: `${r.range[0]}-${r.range[1]}`,
                    label: r.label,
                  }))}
                  onChange={(v) => {
                    const hit = RETURN_RATE_RANGES.find(
                      (r) => `${r.range[0]}-${r.range[1]}` === v,
                    );
                    setFilter("returnRateRange", hit ? hit.range : [0, 100]);
                  }}
                  accent="var(--accent-red)"
                />
                <Dropdown
                  icon={Percent}
                  label="نسبة أداء الموظفين"
                  value={`${employeePerformanceRatioRange[0]}-${employeePerformanceRatioRange[1]}`}
                  options={EMPLOYEE_PERFORMANCE_RATIO_RANGES.map((r) => ({
                    value: `${r.range[0]}-${r.range[1]}`,
                    label: r.label,
                  }))}
                  onChange={(v) => {
                    const hit = EMPLOYEE_PERFORMANCE_RATIO_RANGES.find(
                      (r) => `${r.range[0]}-${r.range[1]}` === v,
                    );
                    setFilter(
                      "employeePerformanceRatioRange",
                      hit ? hit.range : [0, 100],
                    );
                  }}
                  accent="#a855f7"
                />
              </>
            ) : isAiBasketPage ? (
              <>
                <DateFilterDropdown
                  activePeriod={activePeriod}
                  setActivePeriod={setActivePeriod}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  setDateFrom={setDateFrom}
                  setDateTo={setDateTo}
                  quickPeriodOptions={[...AI_BASKET_PAGE_QUICK_PERIODS]}
                  rangeGranularity="month"
                />
                <MultiSelectDropdown
                  icon={MapPin}
                  label="الإقليم"
                  selectedValues={activeRegions}
                  options={REGIONS}
                  onChange={setActiveRegions}
                  accent="var(--accent-cyan)"
                  manyLabel={(n) => `${n} أقاليم`}
                />
                <MultiSelectDropdown
                  icon={MapPinned}
                  label="المدينة"
                  selectedValues={aiBasketCities}
                  options={[...EMPLOYEES_CITIES]}
                  onChange={(v) => setFilter("aiBasketCities", v)}
                  accent="#38bdf8"
                  manyLabel={(n) => `${n} مدن`}
                />
                <MultiSelectDropdown
                  icon={Building2}
                  label="الفرع"
                  selectedValues={activeBranches}
                  options={BRANCHES}
                  onChange={setActiveBranches}
                  accent="var(--accent-green)"
                  manyLabel={(n) => `${n} فروع`}
                />
                <Dropdown
                  icon={Clock}
                  label="وقت البيع"
                  value={aiBasketSaleTime}
                  options={
                    AI_BASKET_SHIFTS as unknown as {
                      value: string;
                      label: string;
                    }[]
                  }
                  onChange={(v) =>
                    setFilter(
                      "aiBasketSaleTime",
                      (v === "morning" || v === "evening" ? v : "all") as
                        | "all"
                        | "morning"
                        | "evening",
                    )
                  }
                  accent="var(--accent-cyan)"
                />
                <Dropdown
                  icon={Calendar}
                  label="أيام العطل / المناسبات"
                  value={aiBasketHoliday}
                  options={AI_BASKET_HOLIDAY_OPTIONS}
                  onChange={(v) => setFilter("aiBasketHoliday", v)}
                  accent="var(--accent-amber)"
                />
                <Dropdown
                  icon={Tag}
                  label="العروض"
                  value={aiBasketOffers}
                  options={
                    AI_BASKET_OFFERS as unknown as {
                      value: string;
                      label: string;
                    }[]
                  }
                  onChange={(v) => setFilter("aiBasketOffers", v)}
                  accent="#f472b6"
                />
                <MultiSelectDropdown
                  icon={Layers}
                  label="المجموعة الأولى"
                  selectedValues={aiBasketG1}
                  options={SALES_GROUP_1}
                  onChange={setAiBasketG1}
                  accent="var(--accent-amber)"
                  manyLabel={(n) => `${n} مجموعات`}
                />
                <MultiSelectDropdown
                  icon={Layers}
                  label="المجموعة الثانية"
                  selectedValues={aiBasketG2}
                  options={SALES_GROUP_2}
                  onChange={setAiBasketG2}
                  accent="#f59e0b"
                  manyLabel={(n) => `${n} مجموعات`}
                />
                <Dropdown
                  icon={ShoppingCart}
                  label="القيمة المادية للسلة"
                  value={`${aiBasketValueRange[0]}-${aiBasketValueRange[1]}`}
                  options={BASKET_VALUE_RANGES.map((r) => ({
                    value: `${r.range[0]}-${r.range[1]}`,
                    label: r.label,
                  }))}
                  onChange={(v) => {
                    const hit = BASKET_VALUE_RANGES.find(
                      (r) => `${r.range[0]}-${r.range[1]}` === v,
                    );
                    setFilter(
                      "aiBasketValueRange",
                      hit ? hit.range : [0, 100_000],
                    );
                  }}
                  accent="#14b8a6"
                />
              </>
            ) : (
              <>
                <DateFilterDropdown
                  activePeriod={activePeriod}
                  setActivePeriod={setActivePeriod}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  setDateFrom={setDateFrom}
                  setDateTo={setDateTo}
                  quickPeriodOptions={
                    isSalesPage ? [...SALES_PAGE_QUICK_PERIODS] : QUICK_PERIODS
                  }
                  fillQuickPeriodDates={
                    isSalesPage ? getSalesQuickPeriodRange : undefined
                  }
                  rangeGranularity="month"
                />

                <MultiSelectDropdown
                  icon={MapPin}
                  label="الإقليم"
                  selectedValues={activeRegions}
                  options={REGIONS}
                  onChange={setActiveRegions}
                  accent="var(--accent-cyan)"
                  manyLabel={(n) => `${n} أقاليم`}
                />

                <MultiSelectDropdown
                  icon={Building2}
                  label="الفرع"
                  selectedValues={activeBranches}
                  options={BRANCHES}
                  onChange={setActiveBranches}
                  accent="var(--accent-green)"
                  manyLabel={(n) => `${n} فروع`}
                />

                {isCustomersPage && (
                  <Dropdown
                    icon={Calendar}
                    label="المناسبات"
                    value={holiday}
                    options={
                      CUSTOMER_HOLIDAYS as unknown as {
                        value: string;
                        label: string;
                      }[]
                    }
                    onChange={(v) => setFilter("holiday", v)}
                    accent="var(--accent-amber)"
                  />
                )}

                {isSalesPage && (
                  <>
                    <MultiSelectDropdown
                      icon={Layers}
                      label="المجموعة الأولى"
                      selectedValues={salesG1}
                      options={SALES_GROUP_1}
                      onChange={setSalesG1}
                      accent="var(--accent-amber)"
                      manyLabel={(n) => `${n} مجموعات`}
                    />
                    <MultiSelectDropdown
                      icon={Layers}
                      label="المجموعة الثانية"
                      selectedValues={salesG2}
                      options={SALES_GROUP_2}
                      onChange={setSalesG2}
                      accent="#f59e0b"
                      manyLabel={(n) => `${n} مجموعات`}
                    />
                    <MultiSelectDropdown
                      icon={Layers}
                      label="المجموعة الثالثة"
                      selectedValues={salesG3}
                      options={SALES_GROUP_3}
                      onChange={setSalesG3}
                      accent="#ea580c"
                      manyLabel={(n) => `${n} مجموعات`}
                    />
                    <MultiSelectDropdown
                      icon={Building2}
                      label="الشركة"
                      selectedValues={salesCompany}
                      options={SALES_COMPANIES}
                      onChange={setSalesCompany}
                      accent="#6366f1"
                      manyLabel={(n) => `${n} شركات`}
                    />
                    <MultiSelectDropdown
                      icon={Package}
                      label="كل المنتجات"
                      selectedValues={salesProduct}
                      options={SALES_INSTANT_PRODUCTS}
                      onChange={setSalesProduct}
                      accent="#00d4ff"
                      manyLabel={(n) => `${n} منتجات`}
                    />
                  </>
                )}
              </>
            )}

            {isEmployeesPage && (
              <>
                <div
                  style={{
                    width: 1,
                    height: 20,
                    background: "#000",
                    marginInline: 4,
                  }}
                />

                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: "#000",
                    letterSpacing: ".5px",
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                  }}
                >
                  📊 تقارير تفصيلية
                </span>

                <Dropdown
                  icon={CreditCard}
                  label="نوع الدفع"
                  value={paymentType}
                  options={[
                    { value: "", label: "نوع الدفع" },
                    ...PAYMENT_TYPES.map((p) => ({ value: p, label: p })),
                  ]}
                  onChange={setPaymentType}
                  accent="#a855f7"
                />
                <Dropdown
                  icon={Store}
                  label="طريقة البيع"
                  value={saleMethod}
                  options={[
                    { value: "", label: "طريقة البيع" },
                    ...SALE_METHOD_OPTIONS.map((m) => ({
                      value: m,
                      label: m,
                    })),
                  ]}
                  onChange={setSaleMethod}
                  accent="#0ea5e9"
                />
              </>
            )}

            {isAiBasketPage && (
              <>
                <div
                  style={{
                    width: 1,
                    height: 20,
                    background: "#000",
                    marginInline: 4,
                  }}
                />

                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: "#000",
                    letterSpacing: ".5px",
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                  }}
                >
                  📊 تقارير تفصيلية
                </span>

                <MultiSelectDropdown
                  icon={Layers}
                  label="المجموعة الثالثة"
                  selectedValues={aiBasketReportG3}
                  options={SALES_GROUP_3}
                  onChange={setAiBasketReportG3}
                  accent="#ea580c"
                  manyLabel={(n) => `${n} مجموعات`}
                />
                <SearchDropdown
                  icon={Package}
                  label="المنتج"
                  value={product}
                  options={PRODUCTS}
                  onChange={setProduct}
                  accent="#00d4ff"
                />
                <Dropdown
                  icon={CreditCard}
                  label="نوع الدفع"
                  value={paymentType}
                  options={[
                    { value: "", label: "نوع الدفع" },
                    ...PAYMENT_TYPES.map((p) => ({ value: p, label: p })),
                  ]}
                  onChange={setPaymentType}
                  accent="#a855f7"
                />
                <Dropdown
                  icon={Store}
                  label="طريقة البيع"
                  value={saleMethod}
                  options={[
                    { value: "", label: "طريقة البيع" },
                    ...SALE_METHOD_OPTIONS.map((m) => ({
                      value: m,
                      label: m,
                    })),
                  ]}
                  onChange={setSaleMethod}
                  accent="#0ea5e9"
                />
              </>
            )}

            {!isEmployeesPage && !isAiBasketPage && (
              <>
                {isSalesPage ? (
                  salesShowReportsRow && (
                    <>
                      {/* Divider */}
                      <div
                        style={{
                          width: 1,
                          height: 20,
                          background: "#000",
                          marginInline: 4,
                        }}
                      />

                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          color: "#000",
                          letterSpacing: ".5px",
                          whiteSpace: "nowrap",
                          textTransform: "uppercase",
                        }}
                      >
                        📊 تقارير تفصيلية
                      </span>

                      <Dropdown
                        icon={CreditCard}
                        label="نوع الدفع"
                        value={paymentType}
                        options={[
                          { value: "", label: "نوع الدفع" },
                          ...PAYMENT_TYPES.map((p) => ({ value: p, label: p })),
                        ]}
                        onChange={setPaymentType}
                        accent="#a855f7"
                      />
                      <Dropdown
                        icon={Store}
                        label="طريقة البيع"
                        value={saleMethod}
                        options={[
                          { value: "", label: "طريقة البيع" },
                          ...SALE_METHOD_OPTIONS.map((m) => ({
                            value: m,
                            label: m,
                          })),
                        ]}
                        onChange={setSaleMethod}
                        accent="#0ea5e9"
                      />
                      <MultiSelectDropdown
                        icon={Handshake}
                        label="الاتفاقية"
                        selectedValues={agreement}
                        options={SALES_AGREEMENTS}
                        onChange={(v) => setFilter("agreement", v)}
                        accent="#c084fc"
                        manyLabel={(n) => `${n} اتفاقيات`}
                      />
                    </>
                  )
                ) : (
                  <>
                    {/* Divider */}
                    <div
                      style={{
                        width: 1,
                        height: 20,
                        background: "#000",
                        marginInline: 4,
                      }}
                    />

                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: "#000",
                        letterSpacing: ".5px",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                      }}
                    >
                      {isBranchesPage
                        ? "📊 التقرير التفصيلي"
                        : "📊 تقارير تفصيلية"}
                    </span>

                    {isBranchesPage ? (
                      <>
                        <Dropdown
                          icon={Clock}
                          label="وقت البيع"
                          value={branchSaleTime}
                          options={
                            AI_BASKET_SHIFTS as unknown as {
                              value: string;
                              label: string;
                            }[]
                          }
                          onChange={(v) =>
                            setFilter(
                              "branchSaleTime",
                              (v === "morning" || v === "evening"
                                ? v
                                : "all") as "all" | "morning" | "evening",
                            )
                          }
                          accent="var(--accent-cyan)"
                        />
                        <Dropdown
                          icon={Calendar}
                          label="أيام العطل / المناسبات"
                          value={branchHoliday}
                          options={BRANCH_HOLIDAY_OPTIONS}
                          onChange={(v) => setFilter("branchHoliday", v)}
                          accent="var(--accent-amber)"
                        />
                        <Dropdown
                          icon={Tag}
                          label="العروض"
                          value={branchOffers}
                          options={
                            AI_BASKET_OFFERS as unknown as {
                              value: string;
                              label: string;
                            }[]
                          }
                          onChange={(v) => setFilter("branchOffers", v)}
                          accent="#f472b6"
                        />
                        <Dropdown
                          icon={CreditCard}
                          label="نوع الدفع"
                          value={paymentType}
                          options={[
                            { value: "", label: "نوع الدفع" },
                            ...PAYMENT_TYPES.map((p) => ({
                              value: p,
                              label: p,
                            })),
                          ]}
                          onChange={setPaymentType}
                          accent="#a855f7"
                        />
                        <Dropdown
                          icon={Store}
                          label="طريقة البيع"
                          value={saleMethod}
                          options={[
                            { value: "", label: "طريقة البيع" },
                            ...SALE_METHOD_OPTIONS.map((m) => ({
                              value: m,
                              label: m,
                            })),
                          ]}
                          onChange={setSaleMethod}
                          accent="#0ea5e9"
                        />
                      </>
                    ) : (
                      <>
                        {!isCustomersPage && (
                          <SearchDropdown
                            icon={Truck}
                            label="الموزع"
                            value={distributor}
                            options={DISTRIBUTORS}
                            onChange={setDistributor}
                            accent="#f59e0b"
                          />
                        )}

                        <SearchDropdown
                          icon={Package}
                          label="الفئة"
                          value={category}
                          options={CATEGORIES}
                          onChange={setCategory}
                          accent="#3b82f6"
                        />

                        {!isCustomersPage && (
                          <SearchDropdown
                            icon={Search}
                            label="المنتج"
                            value={product}
                            options={PRODUCTS}
                            onChange={setProduct}
                            accent="#00d4ff"
                          />
                        )}

                        {isProductsPage && (
                          <>
                            <SearchDropdown
                              icon={Layers}
                              label="المجموعة الأولى"
                              value={prodG1}
                              options={PRODUCTS_GROUP_1}
                              onChange={setProdG1}
                              accent="var(--accent-amber)"
                            />
                            <SearchDropdown
                              icon={Layers}
                              label="المجموعة الثانية"
                              value={prodG2}
                              options={PRODUCTS_GROUP_2}
                              onChange={setProdG2}
                              accent="#f59e0b"
                            />
                            <SearchDropdown
                              icon={Layers}
                              label="المجموعة الثالثة"
                              value={prodG3}
                              options={PRODUCTS_GROUP_3}
                              onChange={setProdG3}
                              accent="#ea580c"
                            />
                            <SearchDropdown
                              icon={Package}
                              label="المنتجات"
                              value={prodName}
                              options={PRODUCTS}
                              onChange={setProdName}
                              accent="#00d4ff"
                            />
                          </>
                        )}

                        <Dropdown
                          icon={Percent}
                          label="الخصم"
                          value={discount}
                          options={[
                            { value: "", label: "الخصم" },
                            ...DISCOUNTS.map((d) => ({ value: d, label: d })),
                          ]}
                          onChange={setDiscount}
                          accent="#ef4444"
                        />

                        <Dropdown
                          icon={CreditCard}
                          label="نوع الدفع"
                          value={paymentType}
                          options={[
                            { value: "", label: "نوع الدفع" },
                            ...PAYMENT_TYPES.map((p) => ({
                              value: p,
                              label: p,
                            })),
                          ]}
                          onChange={setPaymentType}
                          accent="#a855f7"
                        />
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* زر إنشاء التقرير */}
        <AnimatePresence>
          {hasReportFilter && (!isSalesPage || salesShowReportsRow) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={handleCreateReport}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
              style={{
                background: "var(--btn-primary-bg)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                boxShadow: "var(--btn-primary-shadow)",
                whiteSpace: "nowrap",
              }}
            >
              <FileBarChart2 size={13} />
              إنشاء التقرير
            </motion.button>
          )}
        </AnimatePresence>

        {/* زر إعادة التعيين */}
        {(isAnyInstantChanged || hasReportFilter) && (
          <button
            onClick={resetAll}
            style={{
              padding: "4px 8px",
              borderRadius: 7,
              background: "transparent",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
              fontSize: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              whiteSpace: "nowrap",
            }}
          >
            <RotateCcw size={10} /> إعادة
          </button>
        )}
      </div>

      {/* ديالوج التسمية */}
      <AnimatePresence>
        {showNameDialog && (
          <ReportNameDialog
            onConfirm={handleConfirmName}
            onCancel={() => setShowNameDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* البوب اب جاري الإنشاء */}
      <AnimatePresence>
        {showPopup && (
          <ReportCreatingPopup
            name={reportName}
            onClose={() => setShowPopup(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
