"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { useFilterStore } from "@/store/filterStore";

// ═══════════════════════════════════════════════
// بيانات الفلاتر
// ═══════════════════════════════════════════════
const QUICK_PERIODS = [
  { value: "week", label: "الأسبوع" },
  { value: "month", label: "الشهر" },
  { value: "quarter", label: "الربع" },
  { value: "year", label: "السنة" },
];

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
const DISCOUNTS = ["0%", "1-2%", "2-5%", "5-10%", "11-25%"];
const PAYMENT_TYPES = ["نقدي", "فيزا / بطاقة", "محفظة إلكترونية", "آجل / ذمم"];

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
}: {
  activePeriod: string;
  setActivePeriod: (v: string) => void;
  dateFrom: string;
  dateTo: string;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"quick" | "range">("quick");
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const label =
    mode === "range" && dateFrom
      ? `${dateFrom}${dateTo ? " → " + dateTo : ""}`
      : (QUICK_PERIODS.find((p) => p.value === activePeriod)?.label ??
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
                  {QUICK_PERIODS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        setActivePeriod(p.value);
                        setDateFrom("");
                        setDateTo("");
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
                  ].map((f) => (
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
                  ))}
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
  const { activeBranches, activePeriod, setActiveBranches, setActivePeriod } =
    useFilterStore();

  // فلاتر لحظية إضافية ([] = كل الأقاليم)
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // فلاتر التقارير
  const [distributor, setDistributor] = useState("");
  const [category, setCategory] = useState("");
  const [product, setProduct] = useState("");
  const [discount, setDiscount] = useState("");
  const [paymentType, setPaymentType] = useState("");

  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [reportName, setReportName] = useState("");

  const hasReportFilter = !!(
    distributor ||
    category ||
    product ||
    discount ||
    paymentType
  );

  const handleCreateReport = useCallback(() => {
    setShowNameDialog(true);
  }, []);

  const handleConfirmName = useCallback((name: string) => {
    setReportName(name);
    setShowNameDialog(false);
    setShowPopup(true);
    // reset report filters after submission
    setDistributor("");
    setCategory("");
    setProduct("");
    setDiscount("");
    setPaymentType("");
  }, []);

  const resetAll = useCallback(() => {
    setActiveBranches([]);
    setActivePeriod("month");
    setActiveRegions([]);
    setDateFrom("");
    setDateTo("");
    setDistributor("");
    setCategory("");
    setProduct("");
    setDiscount("");
    setPaymentType("");
  }, [setActiveBranches, setActivePeriod]);

  if (pathname === "/reports") return null;

  const isAnyInstantChanged =
    activeBranches.length > 0 ||
    activePeriod !== "month" ||
    activeRegions.length > 0 ||
    dateFrom ||
    dateTo;

  return (
    <>
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

        <DateFilterDropdown
          activePeriod={activePeriod}
          setActivePeriod={setActivePeriod}
          dateFrom={dateFrom}
          dateTo={dateTo}
          setDateFrom={setDateFrom}
          setDateTo={setDateTo}
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

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "#000",
            marginInline: 4,
          }}
        />

        {/* ── فلاتر التقارير ── */}
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

        <SearchDropdown
          icon={Truck}
          label="الموزع"
          value={distributor}
          options={DISTRIBUTORS}
          onChange={setDistributor}
          accent="#f59e0b"
        />

        <SearchDropdown
          icon={Package}
          label="الفئة"
          value={category}
          options={CATEGORIES}
          onChange={setCategory}
          accent="#3b82f6"
        />

        <SearchDropdown
          icon={Search}
          label="المنتج"
          value={product}
          options={PRODUCTS}
          onChange={setProduct}
          accent="#00d4ff"
        />

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
            ...PAYMENT_TYPES.map((p) => ({ value: p, label: p })),
          ]}
          onChange={setPaymentType}
          accent="#a855f7"
        />

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* زر إنشاء التقرير */}
        <AnimatePresence>
          {hasReportFilter && (
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
