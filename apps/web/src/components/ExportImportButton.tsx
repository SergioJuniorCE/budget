import { Download } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { ImportModal } from "./budget/ImportModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDashboardDataOptional } from "@/contexts/DashboardDataContext";

export function ExportImportButton() {
  const routerState = useRouterState();
  const isDashboard = routerState.location.pathname === "/dashboard";
  const { data } = useDashboardDataOptional();

  if (!isDashboard || !data) return null;

  function handleExport() {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      incomeEntries: data.incomeEntries.map((e) => ({
        name: e.name,
        amount: e.amount,
        note: e.note,
      })),
      budgetEntries: data.budgetEntries.map((e) => ({
        name: e.name,
        amount: e.amount,
        category: e.category,
        quincena: e.quincena,
        note: e.note,
        paid: e.paid,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const now = new Date();
    const filename = `budget-export-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.json`;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        <Download className="size-3.5" />
        <span className="hidden sm:inline">Export</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card">
        <DropdownMenuItem onClick={handleExport} className="gap-2">
          <Download className="size-3.5" />
          Export JSON
        </DropdownMenuItem>
        <ImportModal />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
