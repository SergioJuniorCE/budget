import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  CATEGORY_RATIOS,
  formatCurrency,
  type Category,
  type UserData,
} from "./types";

const CATEGORY_FILL: Record<Category, string> = {
  needs: "var(--color-needs)",
  wants: "var(--color-wants)",
  savings: "var(--color-savings)",
};

const CATEGORY_LINE: Record<Category, string> = {
  needs: "bg-needs",
  wants: "bg-wants",
  savings: "bg-savings",
};

interface BudgetDonutChartProps {
  data: UserData;
}

export function BudgetDonutChart({ data }: BudgetDonutChartProps) {
  const totalIncome = data.incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const segments = (["needs", "wants", "savings"] as Category[]).map((cat) => {
    const budget = totalIncome * CATEGORY_RATIOS[cat];
    const current = data.budgetEntries
      .filter((entry) => entry.category === cat)
      .reduce((sum, entry) => sum + entry.amount, 0);
    return { cat, label: CATEGORY_LABELS[cat], current, budget };
  });

  const totalSpent = segments.reduce((sum, segment) => sum + segment.current, 0);
  const remaining = Math.max(0, totalIncome - totalSpent);
  const chartTotal = Math.max(totalIncome, totalSpent, 1);
  let currentAngle = 0;
  const chartStops = segments.map((segment) => {
    const start = currentAngle;
    currentAngle += (segment.current / chartTotal) * 360;
    return `${CATEGORY_FILL[segment.cat]} ${start}deg ${currentAngle}deg`;
  });
  if (remaining > 0) {
    chartStops.push(`var(--color-remaining) ${currentAngle}deg 360deg`);
  }

  return (
    <Card className="h-full gap-0">
      <CardHeader className="border-b border-border/70 pb-4">
        <CardTitle>Where it goes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-4">
        {totalIncome === 0 ? (
          <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-border px-5 text-center">
            <div>
              <p className="text-xs font-semibold">No breakdown yet</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Add your first income entry to see the monthly split.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative mx-auto my-1 size-32">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: `conic-gradient(${chartStops.join(", ")})` }}
                role="img"
                aria-label={`Planned expenses total ${formatCurrency(totalSpent)}`}
              />
              <div className="absolute inset-5 grid place-items-center rounded-full border border-border/50 bg-card text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground">Planned</p>
                  <p className="mt-0.5 text-xs font-bold tabular-nums">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-3 pt-3">
              {segments.map(({ cat, label, current }) => (
                <div key={cat} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={cn("h-0.5 w-5 shrink-0 rounded-full", CATEGORY_LINE[cat])} />
                    <span className="truncate text-xs text-muted-foreground">{label}</span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold tabular-nums">
                    {formatCurrency(current)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-0.5 w-5 shrink-0 rounded-full bg-remaining" />
                  <span className="truncate text-xs text-muted-foreground">Remaining</span>
                </div>
                <span className="shrink-0 text-xs font-semibold tabular-nums">
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
