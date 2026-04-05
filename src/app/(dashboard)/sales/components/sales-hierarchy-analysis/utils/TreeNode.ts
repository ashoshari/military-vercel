import { BRANCHES, CATS, PROD_NAMES, srand, SUB_MAP } from "./data";

const TOTAL = 1847520;
interface TreeNode {
  id: string;
  label: string;
  labelEn?: string;
  value: number;
  children?: TreeNode[];
}

export const treeData: TreeNode = {
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
