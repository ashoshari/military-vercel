"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ChartTitleFlagBadge } from "@/components/ui/ChartTitleFlagBadge";
import {
  BRANCHES,
  CATS,
  PROD_NAMES,
  secondarySalesMetric,
  srand,
  SUB_MAP,
} from "./utils/data";

// ── بنية البيانات ──

// ── Build tree deterministically ──
const TOTAL = 1847520;

interface TreeNode {
  id: string;
  label: string;
  labelEn?: string;
  value: number;
  children?: TreeNode[];
}

const treeData: TreeNode = {
  id: "root",
  label: "صافي المبيعات",
  labelEn: "Net Sales",
  value: TOTAL,
  children: BRANCHES.map((b, bi) => {
    const bVal = Math.round(TOTAL * b.pct + srand() * 5000);
    return {
      id: `b${bi}`,
      label: b.label,
      value: bVal,
      children: CATS.map((c, ci) => {
        const cVal = Math.round(bVal * c.pct + srand() * 2000);
        const subs = SUB_MAP[c.label] || ["متفرقات", "عام", "أخرى"];
        return {
          id: `b${bi}-c${ci}`,
          label: c.label,
          value: cVal,
          children: subs.map((s, si) => {
            const sVal = Math.round(
              (cVal / subs.length) * (1 - si * 0.07) + srand() * 800,
            );
            const pCount = 12 + Math.round(srand() * 6);
            return {
              id: `b${bi}-c${ci}-s${si}`,
              label: s,
              value: sVal,
              children: Array.from({ length: pCount }, (_, pi) => ({
                id: `b${bi}-c${ci}-s${si}-p${pi}`,
                label: PROD_NAMES[pi % PROD_NAMES.length],
                value: Math.round(
                  (sVal / pCount) * (1 - pi * 0.05) + srand() * 200,
                ),
              })),
            };
          }),
        };
      }),
    };
  }),
};

type Level = { label: string; node: TreeNode };

/** سهم يشير إلى العقدة المحددة (على يسارها في اتجاه LTR = «قبل» العنصر). */
function LeadArrowIcon() {
  return (
    <svg
      width="22"
      height="10"
      viewBox="0 0 28 10"
      style={{ display: "block", flexShrink: 0 }}
      aria-hidden
    >
      <line
        x1="0"
        y1="5"
        x2="16"
        y2="5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M 16 1.5 L 26.5 5 L 16 8.5 Z" fill="currentColor" />
    </svg>
  );
}

// ── مكوّن عنصر الشجرة ──
function TreeItem({
  node,
  max,
  maxSecondary,
  selected,
  onClick,
  showLeadArrow,
}: {
  node: TreeNode;
  max: number;
  maxSecondary: number;
  selected: boolean;
  onClick: () => void;
  /** سهم قبل العنصر المحدد فقط (وليس بعد العمود). */
  showLeadArrow: boolean;
}) {
  const pct = Math.round((node.value / max) * 100);
  const sec = secondarySalesMetric(node);
  const pct2 = maxSecondary > 0 ? Math.round((sec / maxSecondary) * 100) : 0;
  const greenBar = selected ? "#16a34a" : "#22c55e";
  const greenMuted = selected ? "#15803d" : "var(--accent-green)";
  const btn = (
    <button
      type="button"
      onClick={onClick}
      className={`text-right transition-all rounded-md p-2 ${showLeadArrow ? "flex-1 min-w-0" : "w-full"} mb-0`}
      style={{
        background: selected ? "rgba(37,99,235,0.12)" : "transparent",
        border: `1px solid ${selected ? "#2563eb" : "transparent"}`,
      }}
    >
      <p
        className="text-[11px] font-medium leading-tight text-right truncate max-w-35 mb-1.5"
        style={{
          color: selected ? "var(--accent-blue)" : "var(--text-secondary)",
        }}
      >
        {node.label}
      </p>
      <div
        className="mb-1.5 h-1.25 rounded-full overflow-hidden"
        style={{ background: "var(--bg-elevated)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: selected ? "#2563eb" : "#3b82f6" }}
        />
      </div>
      <p
        className="text-[11px] font-semibold mt-0.5"
        style={{ color: "var(--accent-blue)" }}
        dir="ltr"
      >
        {node.value.toLocaleString("en-US")}
      </p>
      <div
        className="mt-1.5 h-1.25 rounded-full overflow-hidden"
        style={{ background: "var(--bg-elevated)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct2}%` }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          className="h-full rounded-full"
          style={{ background: greenBar }}
        />
      </div>
      <p
        className="text-[11px] font-semibold mt-0.5"
        style={{ color: greenMuted }}
        dir="ltr"
      >
        {sec.toLocaleString("en-US")}
      </p>
    </button>
  );

  if (!showLeadArrow) {
    return <div className="mb-1 w-full">{btn}</div>;
  }

  return (
    <div className="flex items-center gap-1 w-full mb-1" dir="ltr">
      <span
        className="shrink-0 flex items-center self-center pointer-events-none pl-0.5"
        style={{ color: "rgba(37,99,235,0.85)" }}
      >
        <LeadArrowIcon />
      </span>
      {btn}
    </div>
  );
}

// ── المكوّن الرئيسي ──
export default function SalesHierarchyAnalysis() {
  // مسار الحفر: [ { label: column-title, node: selected } ]
  const [path, setPath] = useState<Level[]>([]);

  // الأعمدة الحالية
  const columns: { title: string; titleAr: string; nodes: TreeNode[] }[] = [];

  // أضف البيانات الجذرية كعمود أول
  const rootChildren = treeData.children || [];
  columns.push({ title: "Branch", titleAr: "الفرع", nodes: rootChildren });

  // أعمدة ديناميكية بناءً على المسار
  for (let i = 0; i < path.length; i++) {
    const children = path[i].node.children;
    if (children && children.length > 0) {
      const nextTitles = ["Category", "SubCategory", "Product Na..."];
      const nextTitlesAr = ["الفئة", "الفئة الفرعية", "المنتج"];
      columns.push({
        title: nextTitles[i] || `Level ${i + 2}`,
        titleAr: nextTitlesAr[i] || `المستوى ${i + 2}`,
        nodes: children,
      });
    }
  }

  // القيمة القصوى لكل عمود
  const getMax = (nodes: TreeNode[]) => Math.max(...nodes.map((n) => n.value));
  const getMaxSecondary = (nodes: TreeNode[]) =>
    Math.max(1, ...nodes.map((n) => secondarySalesMetric(n)));

  const handleSelect = (colIdx: number, node: TreeNode) => {
    // إذا نقر على نفس العنصر المحدد → إلغاء
    if (path[colIdx]?.node.id === node.id) {
      setPath(path.slice(0, colIdx));
    } else {
      setPath([
        ...path.slice(0, colIdx),
        { label: columns[colIdx].title, node },
      ]);
    }
  };

  const removeFilter = (idx: number) => {
    setPath(path.slice(0, idx));
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0; // RTL: scroll to start
    }
  }, [path.length]);

  return (
    <div className="glass-panel overflow-hidden">
      {/* رأس */}
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <ChartTitleFlagBadge flag="green" flagNumber={3} size="sm" />
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            التحليل الهرمي للمبيعات
          </h3>
        </div>
        <p
          className="text-[11px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          اضغط على أي عنصر للتعمق • الشريط والرقم الأزرق: المبيعات • الأخضر
          تحتهما: ربح تقديري • الفرع ← الفئة ← الفئة الفرعية ← المنتج
        </p>
      </div>

      {/* شريط الفلاتر */}
      <AnimatePresence>
        {path.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-2 px-5 py-2 border-b flex-wrap"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {path.map((lvl, i) => (
              <span
                key={lvl.node.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{
                  background: "rgba(37,99,235,0.12)",
                  border: "1px solid rgba(37,99,235,0.3)",
                  color: "var(--accent-blue)",
                }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>
                  {lvl.label}
                </span>
                <span style={{ color: "var(--accent-blue)" }}>
                  {lvl.node.label}
                </span>
                <button
                  onClick={() => removeFilter(i)}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            {path.length > 0 && (
              <button
                onClick={() => setPath([])}
                className="text-[10px] underline"
                style={{ color: "var(--text-muted)" }}
              >
                مسح الكل
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* جسم الشجرة: تمرير أفقي + صف الأعمدة */}
      <div ref={scrollRef} className="overflow-x-auto p-5">
        <div className="flex w-max me-auto ps-30 gap-2 items-stretch" dir="ltr">
          {/* أعمدة ديناميكية — السهم يظهر قبل الصف المحدد داخل العمود */}
          {columns.map((col, colIdx) => {
            const selectedNode = path[colIdx]?.node;
            const maxVal = getMax(col.nodes);
            const maxSecVal = getMaxSecondary(col.nodes);
            return (
              <React.Fragment key={`col-${colIdx}`}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: colIdx * 0.05 }}
                  className="shrink-0 self-stretch flex flex-col"
                  style={{ minWidth: "160px", maxWidth: "160px" }}
                >
                  {/* رأس العمود */}
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {col.title}
                    </span>
                    {selectedNode && colIdx < path.length && (
                      <button
                        onClick={() => removeFilter(colIdx)}
                        className="p-0.5 rounded transition-colors"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>

                  {/* العناصر */}
                  <div
                    className="space-y-0 overflow-y-auto flex-1 min-h-0"
                    style={{ maxHeight: "650px", paddingRight: "2px" }}
                  >
                    {col.nodes.map((node) => {
                      const isSel = selectedNode?.id === node.id;
                      return (
                        <TreeItem
                          key={node.id}
                          node={node}
                          max={maxVal}
                          maxSecondary={maxSecVal}
                          selected={isSel}
                          showLeadArrow={isSel}
                          onClick={() => handleSelect(colIdx, node)}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* وسيلة الإيضاح */}
      <div className="px-5 pb-4 pt-0">
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span
              className="inline-block rounded-full"
              style={{
                width: 22,
                height: 6,
                background: "#2563eb",
              }}
            />
            <span style={{ color: "var(--text-muted)" }}>
              المبيعات (القيمة الأساسية)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="inline-block rounded-full"
              style={{
                width: 22,
                height: 6,
                background: "#16a34a",
              }}
            />
            <span style={{ color: "var(--text-muted)" }}>
              الربح التقديري (المقياس الثانوي)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
