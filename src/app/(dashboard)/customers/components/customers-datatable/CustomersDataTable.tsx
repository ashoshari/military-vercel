"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import SectionTitleWithFlag from "@/components/ui/SectionTitleWithFlag";
import { headers, rows } from "./rows";

export default function CustomersDataTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay =
        `${r.name} ${r.nationalId} ${r.phone} ${r.cardNumber}`.toLowerCase();
      return hay.includes(q);
    });
  }, [search]);

  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <div className="glass-panel overflow-hidden">
      <div
        className="px-5 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <SectionTitleWithFlag title="بيانات العميل" />
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Customer Master Data — {filtered.length} عميل
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              minWidth: 260,
            }}
          >
            <Search size={13} style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="بحث بالاسم / الرقم الوطني / الهاتف..."
              className="bg-transparent outline-none text-xs w-full"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table dir="rtl" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "var(--bg-elevated)",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: "9px 12px",
                    textAlign: i === 0 ? "right" : "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((r, i) => (
              <motion.tr
                key={r.cardNumber}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="hover:bg-white/1.5 transition-colors"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <td
                  style={{
                    padding: "8px 12px",
                    textAlign: "right",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {r.name}
                </td>
                <td
                  style={{
                    padding: "7px 12px",
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--accent-blue)",
                    whiteSpace: "nowrap",
                  }}
                  dir="ltr"
                >
                  {r.nationalId}
                </td>
                <td
                  style={{
                    padding: "7px 12px",
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    whiteSpace: "nowrap",
                  }}
                  dir="ltr"
                >
                  {r.phone}
                </td>
                <td
                  style={{
                    padding: "7px 12px",
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                  }}
                  dir="ltr"
                >
                  {r.cardNumber}
                </td>
                <td
                  style={{
                    padding: "7px 12px",
                    textAlign: "center",
                    fontSize: 10,
                    color: "var(--text-secondary)",
                    whiteSpace: "nowrap",
                  }}
                  dir="ltr"
                >
                  {r.cardCreatedAt}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="px-5 py-3 border-t flex items-center justify-between"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {filtered.length === 0
            ? "0"
            : `${page * pageSize + 1}–${Math.min(
                (page + 1) * pageSize,
                filtered.length,
              )}`}{" "}
          من {filtered.length} عميل
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, pi) => (
            <button
              key={pi}
              onClick={() => setPage(pi)}
              className="w-6 h-6 rounded text-[10px] font-semibold transition-all"
              style={{
                background:
                  pi === page
                    ? "var(--accent-green-dim)"
                    : "var(--bg-elevated)",
                color:
                  pi === page ? "var(--accent-green)" : "var(--text-muted)",
                border: "1px solid",
                borderColor:
                  pi === page ? "rgba(0,229,160,0.25)" : "var(--border-subtle)",
              }}
            >
              {pi + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
