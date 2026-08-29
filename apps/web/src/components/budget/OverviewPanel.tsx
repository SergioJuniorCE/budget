import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  CATEGORY_RATIOS,
  computeBudgetStats,
  formatCurrency,
  type Category,
  type UserData,
} from "./types";

const CATEGORY_MARKS: Record<Category, string> = {
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
  const totalPlanned = totalIncome - totalRestante;
  const isNegative = totalRestante < 0;

  const summaryCells = [
    { label: "Total income", value: totalIncome },
    { label: "Planned", value: totalPlanned },
    { label: "Remaining", value: totalRestante, negative: isNegative },
    { label: "1ra quincena", value: q1Expenses },
    { label: "2da quincena", value: q2Expenses },
  ];

  return (
    <section
      aria-labelledby="workbook-summary-title"
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border bg-muted/45 px-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-[10px] font-semibold text-muted-foreground">fx</span>
          <h2 id="workbook-summary-title" className="truncate text-xs font-semibold">
            Monthly summary
          </h2>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">MXN</span>
      </div>

      <div className="grid grid-cols-2 border-b border-border sm:grid-cols-3 xl:grid-cols-5">
        {summaryCells.map((cell, index) => (
          <div
            key={cell.label}
            className={cn(
              "min-w-0 border-border px-3 py-3",
              index % 2 === 0 ? "border-r sm:border-r" : "sm:border-r",
              index === summaryCells.length - 1 && "border-r-0",
              index < 4 && "border-b xl:border-b-0",
              index === 4 && "col-span-2 border-b-0 sm:col-span-1",
            )}
          >
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {cell.label}
            </p>
            <p
              className={cn(
                "mt-1.5 truncate font-mono text-sm font-semibold tabular-nums sm:text-base",
                cell.negative && "text-destructive",
              )}
            >
              {formatCurrency(cell.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-xs">
          <thead>
            <tr className="h-8 border-b border-border bg-muted/25 text-left text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              <th className="px-3 font-medium">Category</th>
              <th className="w-20 px-3 text-right font-medium">Rule</th>
              <th className="w-36 px-3 text-right font-medium">Target</th>
              <th className="w-36 px-3 text-right font-medium">Planned</th>
              <th className="w-36 px-3 text-right font-medium">Variance</th>
              <th className="w-32 px-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(({ cat, budget, current }) => {
              const variance = budget - current;
              const overBudget = variance < 0;

              return (
                <tr key={cat} className="h-10 border-b border-border/70 last:border-b-0">
                  <td className="px-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-4 w-1 shrink-0", CATEGORY_MARKS[cat])} />
                      <span className={cn("font-semibold", CATEGORY_TEXT[cat])}>
                        {CATEGORY_LABELS[cat]}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 text-right font-mono text-muted-foreground tabular-nums">
                    {Math.round(CATEGORY_RATIOS[cat] * 100)}%
                  </td>
                  <td className="px-3 text-right font-mono tabular-nums">
                    {formatCurrency(budget)}
                  </td>
                  <td className="px-3 text-right font-mono tabular-nums">
                    {formatCurrency(current)}
                  </td>
                  <td
                    className={cn(
                      "px-3 text-right font-mono tabular-nums",
                      overBudget ? "text-destructive" : "text-primary",
                    )}
                  >
                    {formatCurrency(variance)}
                  </td>
                  <td className="px-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-medium",
                        overBudget ? "text-destructive" : "text-primary",
                      )}
                    >
                      {overBudget ? (
                        <ArrowDownRight className="size-3.5" aria-hidden="true" />
                      ) : (
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      )}
                      {overBudget ? "Over target" : "Within target"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="h-10 border-t border-border bg-muted/35 font-semibold">
              <td className="px-3">Total</td>
              <td className="px-3 text-right font-mono text-muted-foreground">100%</td>
              <td className="px-3 text-right font-mono tabular-nums">
                {formatCurrency(totalIncome)}
              </td>
              <td className="px-3 text-right font-mono tabular-nums">
                {formatCurrency(totalPlanned)}
              </td>
              <td
                className={cn(
                  "px-3 text-right font-mono tabular-nums",
                  isNegative ? "text-destructive" : "text-primary",
                )}
              >
                {formatCurrency(totalRestante)}
              </td>
              <td className="px-3 text-[11px] text-muted-foreground">
                {isNegative ? "Review plan" : "Available"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
