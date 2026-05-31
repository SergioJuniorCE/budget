import { useReducer, useRef, useState } from "react";
import type { ClipboardEvent } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, Quincena } from "./types";

// Parses "$9,750.00" or "9750.00" or "9,750" → 9750
function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// Returns { name, amount } if text looks like a tab-separated Excel row, else null
function parseExcelRow(text: string): { name: string; amount: number } | null {
  const parts = text.split("\t");
  if (parts.length < 2) return null;
  const name = parts[0].trim();
  const amount = parseAmount(parts[1].trim());
  if (!name || amount === null) return null;
  return { name, amount };
}

// ─── Income Entry Dialog ─────────────────────────────────────────────────────

interface AddIncomeDialogProps {
  onAdd: (name: string, amount: number, note?: string) => void;
}

export function AddIncomeDialog({ onAdd }: AddIncomeDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  function reset() {
    setName("");
    setAmount("");
    setNote("");
    setTimeout(() => nameRef.current?.focus(), 0);
  }

  function submit(keepOpen: boolean) {
    const parsed = parseFloat(amount);
    if (!name.trim() || isNaN(parsed) || parsed < 0) return;
    onAdd(name.trim(), parsed, note.trim() || undefined);
    if (keepOpen) {
      reset();
    } else {
      setOpen(false);
    }
  }

  function handleNamePaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    const row = parseExcelRow(text);
    if (!row) return;
    e.preventDefault();
    setName(row.name);
    setAmount(String(row.amount));
    setTimeout(() => amountRef.current?.focus(), 0);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <PlusIcon />
            Add Income
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label>Name</Label>
            <Input
              ref={nameRef}
              placeholder="e.g. GlobalLogic — or paste a row from Excel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit(false)}
              onPaste={handleNamePaste}
            />
          </div>
          <div className="grid gap-1">
            <Label>Monthly Amount</Label>
            <Input
              ref={amountRef}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit(false)}
            />
          </div>
          <div className="grid gap-1">
            <Label>Note (optional)</Label>
            <Input
              placeholder="Optional note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit(false)}
            />
          </div>
        </div>
        <DialogFooter className="flex-row justify-end gap-2">
          <DialogClose render={<Button variant="ghost" size="sm" />}>Cancel</DialogClose>
          <Button variant="outline" size="sm" onClick={() => submit(true)}>
            Add another
          </Button>
          <Button size="sm" onClick={() => submit(false)}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Budget Entry Dialog ─────────────────────────────────────────────────────

interface AddBudgetEntryDialogProps {
  defaultCategory?: Category;
  defaultQuincena?: Quincena;
  onAdd: (
    name: string,
    amount: number,
    category: Category,
    quincena: Quincena,
    note?: string,
  ) => void;
}

type BudgetFormState = {
  open: boolean;
  name: string;
  amount: string;
  category: Category;
  quincena: Quincena;
  note: string;
};

type BudgetFormAction =
  | { type: "open"; category: Category; quincena: Quincena }
  | { type: "close" }
  | { type: "reset"; category: Category; quincena: Quincena }
  | { type: "setName"; value: string }
  | { type: "setAmount"; value: string }
  | { type: "setCategory"; value: Category }
  | { type: "setQuincena"; value: Quincena }
  | { type: "setNote"; value: string };

function budgetFormReducer(state: BudgetFormState, action: BudgetFormAction): BudgetFormState {
  switch (action.type) {
    case "open":
    case "reset":
      return {
        open: true,
        name: "",
        amount: "",
        category: action.category,
        quincena: action.quincena,
        note: "",
      };
    case "close":
      return { ...state, open: false };
    case "setName":
      return { ...state, name: action.value };
    case "setAmount":
      return { ...state, amount: action.value };
    case "setCategory":
      return { ...state, category: action.value };
    case "setQuincena":
      return { ...state, quincena: action.value };
    case "setNote":
      return { ...state, note: action.value };
  }
}

export function AddBudgetEntryDialog({
  defaultCategory = "needs",
  defaultQuincena = "1ra",
  onAdd,
}: AddBudgetEntryDialogProps) {
  const [lastSelectedQuincena, setLastSelectedQuincena] = useState<Quincena | null>(null);

  const [form, dispatch] = useReducer(budgetFormReducer, {
    open: false,
    name: "",
    amount: "",
    category: defaultCategory,
    quincena: defaultQuincena,
    note: "",
  });
  const nameRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  function reset() {
    dispatch({
      type: "reset",
      category: defaultCategory,
      quincena: lastSelectedQuincena ?? defaultQuincena,
    });
    setTimeout(() => nameRef.current?.focus(), 0);
  }

  function handleOpenChange(newOpen: boolean) {
    if (newOpen) {
      dispatch({
        type: "open",
        category: defaultCategory,
        quincena: lastSelectedQuincena ?? defaultQuincena,
      });
      setTimeout(() => nameRef.current?.focus(), 0);
    } else {
      dispatch({ type: "close" });
    }
  }

  function submit(keepOpen: boolean) {
    const parsed = parseFloat(form.amount);
    if (!form.name.trim() || isNaN(parsed) || parsed < 0) return;
    onAdd(form.name.trim(), parsed, form.category, form.quincena, form.note.trim() || undefined);
    if (keepOpen) {
      reset();
    } else {
      dispatch({ type: "close" });
    }
  }

  function handleNamePaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    const row = parseExcelRow(text);
    if (!row) return;
    e.preventDefault();
    dispatch({ type: "setName", value: row.name });
    dispatch({ type: "setAmount", value: String(row.amount) });
    setTimeout(() => amountRef.current?.focus(), 0);
  }

  return (
    <Dialog open={form.open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <PlusIcon />
            Add Expense
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label>Name</Label>
            <Input
              ref={nameRef}
              placeholder="e.g. Renta — or paste a row from Excel"
              value={form.name}
              onChange={(e) => dispatch({ type: "setName", value: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && submit(false)}
              onPaste={handleNamePaste}
            />
          </div>
          <div className="grid gap-1">
            <Label>Amount</Label>
            <Input
              ref={amountRef}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => dispatch({ type: "setAmount", value: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && submit(false)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => dispatch({ type: "setCategory", value: v as Category })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="needs">Needs</SelectItem>
                  <SelectItem value="wants">Wants</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Quincena</Label>
              <Select
                value={form.quincena}
                onValueChange={(v) => {
                  const quincena = v as Quincena;
                  setLastSelectedQuincena(quincena);
                  dispatch({ type: "setQuincena", value: quincena });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1ra">1ra</SelectItem>
                  <SelectItem value="2da">2da</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Note (optional)</Label>
            <Input
              placeholder="Optional note"
              value={form.note}
              onChange={(e) => dispatch({ type: "setNote", value: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && submit(false)}
            />
          </div>
        </div>
        <DialogFooter className="flex-row justify-end gap-2">
          <DialogClose render={<Button variant="ghost" size="sm" />}>Cancel</DialogClose>
          <Button variant="outline" size="sm" onClick={() => submit(true)}>
            Add another
          </Button>
          <Button size="sm" onClick={() => submit(false)}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
