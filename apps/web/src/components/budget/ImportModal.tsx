import { api } from "@budget/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useReducer, useRef } from "react";
import { toast } from "sonner";
import { Upload, AlertTriangle, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImportData {
  version: number;
  incomeEntries: Array<{
    name: string;
    amount: number;
    note?: string;
  }>;
  budgetEntries: Array<{
    name: string;
    amount: number;
    category: "needs" | "wants" | "savings";
    quincena: "1ra" | "2da";
    note?: string;
    paid?: boolean;
  }>;
}

type ImportState = {
  open: boolean;
  file: File | null;
  preview: ImportData | null;
  mode: "merge" | "replace";
  importing: boolean;
};

type ImportAction =
  | { type: "openDialog" }
  | { type: "closeDialog" }
  | { type: "setFile"; file: File }
  | { type: "setPreview"; preview: ImportData }
  | { type: "clearPreview" }
  | { type: "setMode"; mode: "merge" | "replace" }
  | { type: "startImport" }
  | { type: "finishImport" }
  | { type: "reset" };

const initialImportState: ImportState = {
  open: false,
  file: null,
  preview: null,
  mode: "merge",
  importing: false,
};

function importReducer(state: ImportState, action: ImportAction): ImportState {
  switch (action.type) {
    case "openDialog":
      return { ...state, open: true };
    case "closeDialog":
      return { ...initialImportState };
    case "setFile":
      return { ...state, file: action.file };
    case "setPreview":
      return { ...state, preview: action.preview };
    case "clearPreview":
      return { ...state, preview: null };
    case "setMode":
      return { ...state, mode: action.mode };
    case "startImport":
      return { ...state, importing: true };
    case "finishImport":
      return { ...state, importing: false };
    case "reset":
      return { ...initialImportState, open: state.open };
  }
}

export function ImportModal() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, dispatch] = useReducer(importReducer, initialImportState);
  const { open, file, preview, mode, importing } = state;

  const importData = useMutation(api.budget.importData);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    dispatch({ type: "setFile", file: selectedFile });
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.incomeEntries || !parsed.budgetEntries) {
          toast.error("Invalid file format");
          dispatch({ type: "clearPreview" });
          return;
        }
        dispatch({ type: "setPreview", preview: parsed as ImportData });
      } catch {
        toast.error("Failed to parse JSON file");
        dispatch({ type: "clearPreview" });
      }
    };
    reader.readAsText(selectedFile);
  }

  async function handleImport() {
    if (!preview) return;

    dispatch({ type: "startImport" });
    try {
      const result = await importData({
        mode,
        incomeEntries: preview.incomeEntries,
        budgetEntries: preview.budgetEntries,
      });
      toast.success(
        `Imported ${result.incomeCount} income and ${result.budgetCount} budget entries`,
      );
      dispatch({ type: "closeDialog" });
    } catch {
      toast.error("Failed to import data");
    } finally {
      dispatch({ type: "finishImport" });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o === open) return;
        if (o) dispatch({ type: "openDialog" });
        else dispatch({ type: "closeDialog" });
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
            <Upload className="size-3.5" />
            Import
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Budget Data</DialogTitle>
          <DialogDescription>
            Import budget entries from a JSON file exported previously.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="text-sm">
                <Check className="size-4 mx-auto mb-1 text-emerald-500" />
                {file.name}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <Upload className="size-4 mx-auto mb-1" />
                Click to select JSON file
              </div>
            )}
          </div>

          {preview && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3">
                <div className="font-medium mb-1">Preview:</div>
                <div>• {preview.incomeEntries.length} income entries</div>
                <div>• {preview.budgetEntries.length} budget entries</div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium">Import mode:</div>
                <div className="flex gap-2">
                  <Button
                    variant={mode === "merge" ? "default" : "outline"}
                    size="sm"
                    onClick={() => dispatch({ type: "setMode", mode: "merge" })}
                    className="flex-1"
                  >
                    Merge
                  </Button>
                  <Button
                    variant={mode === "replace" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => dispatch({ type: "setMode", mode: "replace" })}
                    className="flex-1"
                  >
                    Replace
                  </Button>
                </div>
                {mode === "merge" && (
                  <p className="text-xs text-muted-foreground">
                    Add imported entries to your existing data.
                  </p>
                )}
                {mode === "replace" && (
                  <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded p-2">
                    <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                    <span>This will delete all existing entries before importing.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>Cancel</DialogClose>
          <Button size="sm" onClick={handleImport} disabled={!preview || importing}>
            {importing ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
