import { lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, CATEGORY_RATIOS, formatCurrency, type UserData } from "./types";
import type { Category } from "./types";

const PieChart = lazy(() => import("recharts").then((m) => ({ default: m.PieChart })));
const Pie = lazy(() => import("recharts").then((m) => ({ default: m.Pie })));
const Cell = lazy(() => import("recharts").then((m) => ({ default: m.Cell })));
const ResponsiveContainer = lazy(() =>
  import("recharts").then((m) => ({ default: m.ResponsiveContainer })),
);
const Tooltip = lazy(() => import("recharts").then((m) => ({ default: m.Tooltip })));

const CATEGORY_FILL: Record<Category, string> = {
  needs: "var(--color-needs)",
  wants: "var(--color-wants)",
  savings: "var(--color-savings)",
};

const CATEGORY_TEXT: Record<Category, string> = {
  needs: "text-blue-600 dark:text-blue-400",
  wants: "text-amber-600 dark:text-amber-400",
  savings: "text-emerald-600 dark:text-emerald-400",
};

interface BudgetDonutChartProps {
  data: UserData;
}

interface TooltipPayload {
  name: string;
  value: number;
  payload: { label: string; budget: number; pct: number };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium">{item.payload.label}</p>
      <p className="tabular-nums text-muted-foreground">{formatCurrency(item.value)}</p>
      <p className="tabular-nums text-muted-foreground">
        Budget: {formatCurrency(item.payload.budget)}
      </p>
    </div>
  );
}

export function BudgetDonutChart({ data }: BudgetDonutChartProps) {
  const totalIncome = data.incomeEntries.reduce((s, e) => s + e.amount, 0);

  const segments = (["needs", "wants", "savings"] as Category[]).map((cat) => {
    const budget = totalIncome * CATEGORY_RATIOS[cat];
    const current = data.budgetEntries
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + e.amount, 0);
    const pct = budget > 0 ? Math.round((current / budget) * 100) : 0;
    return { cat, label: CATEGORY_LABELS[cat], current, budget, pct };
  });

  const totalSpent = segments.reduce((s, seg) => s + seg.current, 0);
  const unassigned = Math.max(0, totalIncome - totalSpent);

  const chartData = [
    ...segments.map((seg) => ({
      label: seg.label,
      value: seg.current,
      budget: seg.budget,
      pct: seg.pct,
      cat: seg.cat,
    })),
    ...(unassigned > 0
      ? [{ label: "Remaining", value: unassigned, budget: 0, pct: 0, cat: "remaining" }]
      : []),
  ];

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Spending Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {totalIncome === 0 ? (
          <p className="text-xs text-muted-foreground italic py-4 text-center">
            Add income to see breakdown
          </p>
        ) : (
          <>
            <style>{`
              :root {
                --color-needs: #3b82f6;
                --color-wants: #f59e0b;
                --color-savings: #10b981;
                --color-remaining: #a855f7;
              }
            `}</style>
            <div className="h-36">
              <Suspense
                fallback={
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Loading chart...
                  </div>
                }
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.cat}
                          fill={
                            entry.cat === "remaining"
                              ? "var(--color-remaining)"
                              : entry.cat
                                ? CATEGORY_FILL[entry.cat as Category]
                                : "var(--muted)"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Suspense>
            </div>

            <div className="mt-3 space-y-2">
              {segments.map(({ cat, label, current, budget, pct }) => {
                const over = current > budget;
                return (
                  <div key={cat} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={cn(
                          "inline-block h-2 w-2 rounded-full shrink-0",
                          cat === "needs" && "bg-blue-500",
                          cat === "wants" && "bg-amber-500",
                          cat === "savings" && "bg-emerald-500",
                        )}
                      />
                      <span className={cn("text-xs font-medium", CATEGORY_TEXT[cat])}>{label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 tabular-nums text-xs">
                      <span className={cn("text-muted-foreground", over && "text-destructive")}>
                        {formatCurrency(current)}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className="font-medium">{formatCurrency(budget)}</span>
                      <span
                        className={cn(
                          "w-10 text-right font-semibold",
                          over ? "text-destructive" : "text-muted-foreground",
                        )}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
              {unassigned > 0 && (
                <div className="flex items-center justify-between gap-2 border-t pt-2 mt-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="inline-block h-2 w-2 rounded-full shrink-0 bg-purple-500" />
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      Remaining
                    </span>
                  </div>
                  <span className="tabular-nums text-xs font-semibold text-purple-600 dark:text-purple-400">
                    {formatCurrency(unassigned)}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
