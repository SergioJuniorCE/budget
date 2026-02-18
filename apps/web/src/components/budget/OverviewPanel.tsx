import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type Category,
  CATEGORY_LABELS,
  CATEGORY_RATIOS,
  formatCurrency,
  type MonthData,
  computeBudgetStats,
} from "./types";

const CATEGORY_COLORS: Record<Category, string> = {
  needs: "bg-blue-500",
  wants: "bg-amber-500",
  savings: "bg-emerald-500",
};

const CATEGORY_TEXT: Record<Category, string> = {
  needs: "text-blue-600 dark:text-blue-400",
  wants: "text-amber-600 dark:text-amber-400",
  savings: "text-emerald-600 dark:text-emerald-400",
};

interface OverviewPanelProps {
  data: MonthData;
}

export function OverviewPanel({ data }: OverviewPanelProps) {
  const stats = computeBudgetStats(data);
  const { totalIncome, categories, totalNotAssigned, q1Expenses, q2Expenses, totalRestante } =
    stats;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent className="pt-3 space-y-4">
        {/* 50/30/20 table */}
        <div>
          <div className="grid grid-cols-4 gap-1 mb-2">
            <span className="text-xs text-muted-foreground col-span-1"></span>
            <span className="text-xs text-muted-foreground text-right">Current</span>
            <span className="text-xs text-muted-foreground text-right">Excedent</span>
            <span className="text-xs text-muted-foreground text-right">Spendable</span>
          </div>
          {categories.map(({ cat, budget, current, excedent, spendable }) => {
            const pct = budget > 0 ? Math.min(100, (current / budget) * 100) : 0;
            const overBudget = current > budget;
            return (
              <div key={cat} className="mb-3">
                <div className="grid grid-cols-4 gap-1 items-center mb-1">
                  <span className={cn("text-xs font-medium", CATEGORY_TEXT[cat])}>
                    {CATEGORY_LABELS[cat]} ({Math.round(CATEGORY_RATIOS[cat] * 100)}%)
                  </span>
                  <span
                    className={cn(
                      "text-xs tabular-nums text-right",
                      overBudget && "text-destructive font-medium",
                    )}
                  >
                    {formatCurrency(current)}
                  </span>
                  <span className="text-xs tabular-nums text-right text-muted-foreground">
                    {formatCurrency(excedent)}
                  </span>
                  <span className="text-xs tabular-nums text-right font-medium">
                    {formatCurrency(spendable)}
                  </span>
                </div>
                <div className="h-1 w-full bg-muted rounded-none overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      overBudget ? "bg-destructive" : CATEGORY_COLORS[cat],
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Not Assigned */}
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Total Not Assigned</span>
            <span
              className={cn(
                "text-xs tabular-nums font-semibold",
                totalNotAssigned < 0
                  ? "text-destructive"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {formatCurrency(totalNotAssigned)}
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            of {formatCurrency(totalIncome)} total income
          </div>
        </div>

        {/* Restante section */}
        <div className="border-t pt-3 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Expenses by Quincena
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xs">1ra Quincena</span>
            <span className="text-xs tabular-nums font-medium">{formatCurrency(q1Expenses)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs">2da Quincena</span>
            <span className="text-xs tabular-nums font-medium">{formatCurrency(q2Expenses)}</span>
          </div>
          <div className="flex justify-between items-center border-t pt-1.5 mt-1">
            <span className="text-xs font-semibold">Restante (mes)</span>
            <span
              className={cn(
                "text-xs tabular-nums font-bold",
                totalRestante < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {formatCurrency(totalRestante)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
