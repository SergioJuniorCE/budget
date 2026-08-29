import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  CATEGORY_RATIOS,
  computeBudgetStats,
  formatCurrency,
  type Category,
  type UserData,
} from "./types";

const CATEGORY_COLORS: Record<Category, string> = {
  needs: "bg-needs",
  wants: "bg-wants",
  savings: "bg-savings",
};

const CATEGORY_TEXT: Record<Category, string> = {
  needs: "text-needs",
  wants: "text-wants",
  savings: "text-savings",
};

interface OverviewPanelProps {
  data: UserData;
}

export function OverviewPanel({ data }: OverviewPanelProps) {
  const stats = computeBudgetStats(data);
  const { totalIncome, categories, q1Expenses, q2Expenses, totalRestante } = stats;
  const isNegative = totalRestante < 0;

  return (
    <Card className="h-full gap-0 bg-card">
      <CardHeader className="flex-row items-center justify-between border-b border-border/70 pb-4">
        <CardTitle>Monthly balance</CardTitle>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold",
            isNegative ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
          )}
        >
          {isNegative ? (
            <ArrowDownRight className="size-3.5" aria-hidden="true" />
          ) : (
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          )}
          {isNegative ? "Over plan" : "Available"}
        </span>
      </CardHeader>
      <CardContent className="grid flex-1 gap-6 pt-5 md:grid-cols-[0.82fr_1.18fr]">
        <div className="flex min-w-0 flex-col">
          <p className="text-xs font-medium text-muted-foreground">Left after planned expenses</p>
          <p
            className={cn(
              "mt-2 font-display text-4xl font-semibold tracking-[-0.045em] tabular-nums",
              isNegative ? "text-destructive" : "text-foreground",
            )}
          >
            {formatCurrency(totalRestante)}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            From {formatCurrency(totalIncome)} in monthly income.
          </p>

          <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
            <div className="rounded-lg bg-muted/65 p-3">
              <p className="text-[11px] text-muted-foreground">First quincena</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">
                {formatCurrency(q1Expenses)}
              </p>
            </div>
            <div className="rounded-lg bg-muted/65 p-3">
              <p className="text-[11px] text-muted-foreground">Second quincena</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">
                {formatCurrency(q2Expenses)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 border-t border-border/70 pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
          {categories.map(({ cat, budget, current }) => {
            const pct = budget > 0 ? Math.round((current / budget) * 100) : 0;
            const barWidth = Math.min(100, pct);
            const overBudget = current > budget;
            return (
              <div key={cat}>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className={cn("text-xs font-semibold", CATEGORY_TEXT[cat])}>
                      {CATEGORY_LABELS[cat]}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {Math.round(CATEGORY_RATIOS[cat] * 100)}% target
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-xs font-semibold tabular-nums",
                        overBudget && "text-destructive",
                      )}
                    >
                      {formatCurrency(current)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                      of {formatCurrency(budget)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-500",
                      overBudget ? "bg-destructive" : CATEGORY_COLORS[cat],
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
