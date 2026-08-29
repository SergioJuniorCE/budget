import type React from "react";
import { useState } from "react";
import { PencilIcon, Trash2Icon, CheckIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
      <div className={cn("flex items-center gap-1 py-1 border-b border-border/50", className)}>
        <Input
          className="h-6 flex-1 min-w-0 text-xs px-1"
          value={editState.name}
          onChange={(e) => setEditState((s) => s && { ...s, name: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <Input
          className="h-6 w-20 text-xs px-1 tabular-nums"
          value={editState.amount}
          onChange={(e) => setEditState((s) => s && { ...s, amount: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          type="number"
          min="0"
          step="0.01"
        />
        <Button size="icon-xs" variant="ghost" onClick={handleSave} aria-label="Save">
          <CheckIcon />
        </Button>
        <Button size="icon-xs" variant="ghost" onClick={handleCancel} aria-label="Cancel">
          <XIcon />
        </Button>
      </div>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            "group flex min-h-9 items-center gap-1 border-b border-border/50 py-1 transition-opacity",
            paid && "opacity-50",
            className,
          )}
        >
          {dragHandle}
          {onTogglePaid && (
            <Checkbox
              checked={!!paid}
              onCheckedChange={(checked) => onTogglePaid(!!checked)}
              className="relative size-4 shrink-0 after:absolute after:-inset-2"
              aria-label={paid ? "Mark as unpaid" : "Mark as paid"}
            />
          )}
          <span
            className={cn(
              "flex-1 min-w-0 truncate text-xs",
              paid && "line-through text-muted-foreground",
            )}
          >
            {name}
          </span>
          <span className="tabular-nums text-xs text-muted-foreground shrink-0">
            {formatCurrency(amount)}
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={startEditing}>
          <PencilIcon className="mr-2 h-3.5 w-3.5" /> Edit
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2Icon className="mr-2 h-3.5 w-3.5" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
