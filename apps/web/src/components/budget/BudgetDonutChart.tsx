import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, CATEGORY_RATIOS, formatCurrency, type UserData } from "./types";
import type { Category } from "./types";

const CATEGORY_FILL: Record<Category, string> = {
  needs: "var(--color-needs)",
  wants: "var(--color-wants)",
  savings: "var(--color-savings)",
};

const CATEGORY_TEXT: Record<Category, string> = {
  needs: "text-needs",
  wants: "text-wants",
  savings: "text-savings",
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
    <div className="rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-md">
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
            <div className="h-36 min-w-0 flex items-center justify-center">
              <PieChart width={220} height={140}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={50}
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
                          cat === "needs" && "bg-needs",
                          cat === "wants" && "bg-wants",
                          cat === "savings" && "bg-savings",
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
                    <span className="inline-block h-2 w-2 rounded-full shrink-0 bg-remaining" />
                    <span className="text-xs font-medium text-remaining">Remaining</span>
                  </div>
                  <span className="tabular-nums text-xs font-semibold text-remaining">
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
