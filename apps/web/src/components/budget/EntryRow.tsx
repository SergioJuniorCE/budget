import type React from "react";
import { useState } from "react";
import { CheckIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "./types";

interface EntryRowProps {
  name: string;
  amount: number;
  note?: string;
  paid?: boolean;
  onEdit: (name: string, amount: number, note?: string) => void;
  onDelete: () => void;
  onTogglePaid?: (paid: boolean) => void;
  className?: string;
  dragHandle?: React.ReactNode;
}

export function EntryRow({
  name,
  amount,
  note,
  paid,
  onEdit,
  onDelete,
  onTogglePaid,
  className,
  dragHandle,
}: EntryRowProps) {
  const [editState, setEditState] = useState<{ name: string; amount: string } | null>(null);

  function startEditing() {
    setEditState({ name, amount: String(amount) });
  }

  function handleSave() {
    if (!editState) return;
    const parsed = parseFloat(editState.amount);
    if (!editState.name.trim() || isNaN(parsed) || parsed < 0) return;
    onEdit(editState.name.trim(), parsed, note);
    setEditState(null);
  }

  function handleCancel() {
    setEditState(null);
  }

  if (editState) {
    return (
      <div
        role="row"
        className={cn(
          "grid min-h-10 grid-cols-[1.75rem_1.75rem_minmax(8rem,1fr)_6.5rem] border-b border-border/70 bg-primary/[0.035]",
          className,
        )}
      >
        <div role="gridcell" aria-label="Row controls" className="border-r border-border/70" />
        <div role="gridcell" aria-label="Payment status" className="border-r border-border/70" />
        <div role="gridcell" className="flex min-w-0 items-center gap-1 px-1.5 py-1">
          <Input
            aria-label="Entry name"
            className="h-7 min-w-0 flex-1 rounded-sm px-2 text-xs"
            value={editState.name}
            onChange={(event) =>
              setEditState((state) => state && { ...state, name: event.target.value })
            }
            onKeyDown={(event) => event.key === "Enter" && handleSave()}
          />
          <Button size="icon-xs" variant="ghost" onClick={handleSave} aria-label="Save">
            <CheckIcon />
          </Button>
          <Button size="icon-xs" variant="ghost" onClick={handleCancel} aria-label="Cancel">
            <XIcon />
          </Button>
        </div>
        <div role="gridcell" className="flex items-center border-l border-border/70 px-1.5 py-1">
          <Input
            aria-label="Entry amount"
            className="h-7 w-full rounded-sm px-2 text-right font-mono text-xs tabular-nums"
            value={editState.amount}
            onChange={(event) =>
              setEditState((state) => state && { ...state, amount: event.target.value })
            }
            onKeyDown={(event) => event.key === "Enter" && handleSave()}
            type="number"
            min="0"
            step="0.01"
          />
        </div>
      </div>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          role="row"
          className={cn(
            "group grid min-h-10 grid-cols-[1.75rem_1.75rem_minmax(8rem,1fr)_6.5rem] border-b border-border/70 transition-colors hover:bg-muted/35",
            paid && "bg-primary/[0.025]",
            className,
          )}
        >
          <div role="gridcell" className="grid place-items-center border-r border-border/70">
            {dragHandle}
          </div>
          <div role="gridcell" className="grid place-items-center border-r border-border/70">
            {onTogglePaid && (
              <Checkbox
                checked={!!paid}
                onCheckedChange={(checked) => onTogglePaid(!!checked)}
                className="relative size-4 after:absolute after:-inset-2"
                aria-label={paid ? "Mark as unpaid" : "Mark as paid"}
              />
            )}
          </div>
          <div role="gridcell" className="min-w-0 px-2.5 py-1.5">
            <p
              className={cn(
                "truncate text-xs font-medium",
                paid && "text-muted-foreground line-through",
              )}
            >
              {name}
            </p>
            {note && <p className="truncate text-[10px] text-muted-foreground">{note}</p>}
          </div>
          <div
            role="gridcell"
            className={cn(
              "flex items-center justify-end border-l border-border/70 px-2.5 font-mono text-xs tabular-nums",
              paid ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {formatCurrency(amount)}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={startEditing}>
          <PencilIcon className="mr-2 size-3.5" /> Edit
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2Icon className="mr-2 size-3.5" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
