import type React from "react";
import { useState } from "react";
import { PencilIcon, Trash2Icon, CheckIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "./types";

interface EntryRowProps {
  name: string;
  amount: number;
  note?: string;
  onEdit: (name: string, amount: number, note?: string) => void;
  onDelete: () => void;
  className?: string;
  dragHandle?: React.ReactNode;
}

export function EntryRow({
  name,
  amount,
  note,
  onEdit,
  onDelete,
  className,
  dragHandle,
}: EntryRowProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editAmount, setEditAmount] = useState(String(amount));

  function handleSave() {
    const parsed = parseFloat(editAmount);
    if (!editName.trim() || isNaN(parsed) || parsed < 0) return;
    onEdit(editName.trim(), parsed, note);
    setEditing(false);
  }

  function handleCancel() {
    setEditName(name);
    setEditAmount(String(amount));
    setEditing(false);
  }

  if (editing) {
    return (
      <div className={cn("flex items-center gap-1 py-1 border-b border-border/50", className)}>
        <Input
          className="h-6 flex-1 min-w-0 text-xs px-1"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          autoFocus
        />
        <Input
          className="h-6 w-20 text-xs px-1 tabular-nums"
          value={editAmount}
          onChange={(e) => setEditAmount(e.target.value)}
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
    <div className={cn("group flex items-center gap-1 py-1 border-b border-border/50", className)}>
      {dragHandle}
      <span className="flex-1 min-w-0 truncate text-xs">{name}</span>
      <span className="tabular-nums text-xs text-muted-foreground shrink-0">
        {formatCurrency(amount)}
      </span>
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button size="icon-xs" variant="ghost" onClick={() => setEditing(true)} aria-label="Edit">
          <PencilIcon />
        </Button>
        <Button size="icon-xs" variant="destructive" onClick={onDelete} aria-label="Delete">
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}
