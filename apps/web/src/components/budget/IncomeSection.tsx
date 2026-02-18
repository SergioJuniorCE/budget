import type { Id } from "@budget/backend/convex/_generated/dataModel";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddIncomeDialog } from "./AddEntryDialog";
import { EntryRow } from "./EntryRow";
import { formatCurrency, type IncomeEntry } from "./types";

interface IncomeSectionProps {
  entries: IncomeEntry[];
  onAdd: (name: string, amount: number, note?: string) => void;
  onEdit: (id: Id<"incomeEntries">, name: string, amount: number, note?: string) => void;
  onDelete: (id: Id<"incomeEntries">) => void;
}

export function IncomeSection({ entries, onAdd, onEdit, onDelete }: IncomeSectionProps) {
  const total = entries.reduce((s, e) => s + e.amount, 0);

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-between">
          <span>Income</span>
          <AddIncomeDialog onAdd={onAdd} />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        {entries.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-2">No income entries yet</p>
        )}
        <div className="space-y-0.5">
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
        </div>
        {entries.length > 0 && (
          <div className="mt-3 border-t pt-2 flex justify-between items-center">
            <span className="text-xs font-medium">Total Income</span>
            <span className="text-xs font-semibold tabular-nums">{formatCurrency(total)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
