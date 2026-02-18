import type { Id } from "@budget/backend/convex/_generated/dataModel";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AddBudgetEntryDialog } from "./AddEntryDialog";
import { EntryRow } from "./EntryRow";
import {
  CATEGORY_LABELS,
  formatCurrency,
  type BudgetEntry,
  type Category,
  type Quincena,
} from "./types";

const CATEGORY_COLORS: Record<Category, string> = {
  needs: "text-blue-600 dark:text-blue-400",
  wants: "text-amber-600 dark:text-amber-400",
  savings: "text-emerald-600 dark:text-emerald-400",
};

const CATEGORY_BG: Record<Category, string> = {
  needs: "bg-blue-500",
  wants: "bg-amber-500",
  savings: "bg-emerald-500",
};

interface CategorySectionProps {
  category: Category;
  entries: BudgetEntry[];
  budget: number;
  current: number;
  onAdd: (
    name: string,
    amount: number,
    category: Category,
    quincena: Quincena,
    note?: string,
  ) => void;
  onEdit: (id: Id<"budgetEntries">, name: string, amount: number, note?: string) => void;
  onDelete: (id: Id<"budgetEntries">) => void;
}

export function CategorySection({
  category,
  entries,
  budget,
  current,
  onAdd,
  onEdit,
  onDelete,
}: CategorySectionProps) {
  const q1 = entries.filter((e) => e.quincena === "1ra");
  const q2 = entries.filter((e) => e.quincena === "2da");
  const q1Total = q1.reduce((s, e) => s + e.amount, 0);
  const q2Total = q2.reduce((s, e) => s + e.amount, 0);

  const pct = budget > 0 ? Math.min(100, (current / budget) * 100) : 0;
  const overBudget = current > budget;

  return (
    <Card className="flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={cn("font-semibold", CATEGORY_COLORS[category])}>
              {CATEGORY_LABELS[category]}
            </span>
          </div>
          <AddBudgetEntryDialog defaultCategory={category} onAdd={onAdd} />
        </CardTitle>
        <div className="mt-2 space-y-1">
          <div className="h-1.5 w-full bg-muted rounded-none overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                CATEGORY_BG[category],
                overBudget && "bg-destructive",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{formatCurrency(current)} spent</span>
            <span>{formatCurrency(budget)} budget</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <QuincenaExpenseColumn
            label="1ra Quincena"
            entries={q1}
            total={q1Total}
            category={category}
            quincena="1ra"
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          <QuincenaExpenseColumn
            label="2da Quincena"
            entries={q2}
            total={q2Total}
            category={category}
            quincena="2da"
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
        <div className="mt-3 border-t pt-2 flex justify-between items-center">
          <span className="text-xs font-medium">Total</span>
          <span
            className={cn("text-xs font-semibold tabular-nums", overBudget && "text-destructive")}
          >
            {formatCurrency(current)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuincenaExpenseColumnProps {
  label: string;
  entries: BudgetEntry[];
  total: number;
  category: Category;
  quincena: Quincena;
  onAdd: (
    name: string,
    amount: number,
    category: Category,
    quincena: Quincena,
    note?: string,
  ) => void;
  onEdit: (id: Id<"budgetEntries">, name: string, amount: number, note?: string) => void;
  onDelete: (id: Id<"budgetEntries">) => void;
}

function QuincenaExpenseColumn({
  label,
  entries,
  total,
  category,
  quincena,
  onAdd,
  onEdit,
  onDelete,
}: QuincenaExpenseColumnProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <button
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => {
            const name = window.prompt("Name:");
            if (!name) return;
            const amtStr = window.prompt("Amount:");
            if (!amtStr) return;
            const amount = parseFloat(amtStr);
            if (isNaN(amount)) return;
            onAdd(name.trim(), amount, category, quincena);
          }}
          aria-label={`Quick add to ${label}`}
        >
          + Quick add
        </button>
      </div>
      {entries.length === 0 && <p className="text-xs text-muted-foreground italic">No entries</p>}
      {entries.map((entry) => (
        <EntryRow
          key={entry._id}
          name={entry.name}
          amount={entry.amount}
          note={entry.note}
          onEdit={(name, amount, note) => onEdit(entry._id, name, amount, note)}
          onDelete={() => onDelete(entry._id)}
        />
      ))}
      <div className="border-t mt-1 pt-1 flex justify-between">
        <span className="text-xs text-muted-foreground">Subtotal</span>
        <span className="text-xs tabular-nums font-medium">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
