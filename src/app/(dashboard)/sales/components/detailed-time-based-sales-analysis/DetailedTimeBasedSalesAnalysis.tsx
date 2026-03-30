import {
  AnalyticsBarCell,
  AnalyticsTable,
  analyticsTdBaseStyle,
} from "@/components/ui/AnalyticsTable";
import AnalyticsTableCard from "@/components/ui/AnalyticsTableCard";
import { TrendingDown, TrendingUp } from "lucide-react";
import { data, headers } from "./utils/data";

const DetailedTimeBasedSalesAnalysis = () => {
  return (
    <AnalyticsTableCard
      title="التحليل الزمني التفصيلي للمبيعات"
      flag="green"
      subtitles={
        <p
          className="text-[11px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          صافي المبيعات • صافي المبيعات YoY (العام السابق) • YoY% • MoM% • عدد
          الفواتير • هامش الربح
        </p>
      }
    >
      <AnalyticsTable headers={headers}>
        {data.map((row, i) => {
          const netYoyPrior =
            row.yoy != null && row.yoy !== -100
              ? Math.round(row.net / (1 + row.yoy / 100))
              : null;
          const maxNet = Math.max(
            ...[
              ...([2065, 1513, 1418, 1284, 1665, 831, 1821, 273] as number[]),
            ],
          );
          const maxInv = Math.max(
            ...([823, 614, 581, 547, 515, 334, 649, 113] as number[]),
          );
          return (
            <tr key={i}>
              <td
                style={{
                  ...analyticsTdBaseStyle("right"),
                  fontSize: 11,
                  color: "var(--text-muted)",
                }}
              >
                {row.year}
              </td>
              <td
                style={{
                  ...analyticsTdBaseStyle("right"),
                  fontSize: 11,
                  color: "var(--text-muted)",
                }}
              >
                {row.quarter}
              </td>
              <td
                style={{
                  ...analyticsTdBaseStyle("right"),
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                {row.month}
              </td>

              <AnalyticsBarCell
                value={row.net}
                max={maxNet}
                color="#3b82f6"
                text={row.net.toLocaleString("en-US")}
              />

              {netYoyPrior != null ? (
                <AnalyticsBarCell
                  value={netYoyPrior}
                  max={maxNet}
                  color="#3b82f6"
                  text={netYoyPrior.toLocaleString("en-US")}
                />
              ) : (
                <td style={analyticsTdBaseStyle("center")}>
                  <span style={{ color: "var(--text-muted)", fontSize: 10 }}>
                    —
                  </span>
                </td>
              )}

              <td style={analyticsTdBaseStyle("center")}>
                {row.yoy != null ? (
                  <span
                    className="inline-flex items-center gap-0.5 text-xs font-semibold"
                    style={{
                      color:
                        row.yoy >= 0
                          ? "var(--accent-green)"
                          : "var(--accent-red)",
                    }}
                    dir="ltr"
                  >
                    {row.yoy >= 0 ? (
                      <TrendingUp size={10} />
                    ) : (
                      <TrendingDown size={10} />
                    )}
                    {row.yoy >= 0 ? "+" : ""}
                    {row.yoy.toFixed(2)}%
                  </span>
                ) : (
                  <span
                    style={{ color: "var(--text-muted)", fontSize: "10px" }}
                  >
                    —
                  </span>
                )}
              </td>
              <td style={analyticsTdBaseStyle("center")}>
                {row.mom != null ? (
                  <span
                    className="inline-flex items-center gap-0.5 text-xs font-semibold"
                    style={{
                      color:
                        row.mom >= 0
                          ? "var(--accent-green)"
                          : "var(--accent-red)",
                    }}
                    dir="ltr"
                  >
                    {row.mom >= 0 ? (
                      <TrendingUp size={10} />
                    ) : (
                      <TrendingDown size={10} />
                    )}
                    {row.mom >= 0 ? "+" : ""}
                    {row.mom.toFixed(2)}%
                  </span>
                ) : (
                  <span
                    style={{ color: "var(--text-muted)", fontSize: "10px" }}
                  >
                    —
                  </span>
                )}
              </td>
              <AnalyticsBarCell
                value={row.invoices}
                max={maxInv}
                color="#3b82f6"
                text={row.invoices.toLocaleString("en-US")}
              />
              <td style={analyticsTdBaseStyle("center")}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                  dir="ltr"
                >
                  {row.margin.toFixed(2)}%
                </span>
              </td>
            </tr>
          );
        })}
      </AnalyticsTable>
    </AnalyticsTableCard>
  );
};

export default DetailedTimeBasedSalesAnalysis;
