import { api } from "@budget/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useRef, useState } from "react";
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

export function ImportModal() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportData | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [importing, setImporting] = useState(false);

  const importData = useMutation(api.budget.importData);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.incomeEntries || !parsed.budgetEntries) {
          toast.error("Invalid file format");
          setPreview(null);
          return;
        }
        setPreview(parsed as ImportData);
      } catch {
        toast.error("Failed to parse JSON file");
        setPreview(null);
      }
    };
    reader.readAsText(selectedFile);
  }

  async function handleImport() {
    if (!preview) return;

    setImporting(true);
    try {
      const result = await importData({
        mode,
        incomeEntries: preview.incomeEntries,
        budgetEntries: preview.budgetEntries,
      });
      toast.success(
        `Imported ${result.incomeCount} income and ${result.budgetCount} budget entries`,
      );
      setOpen(false);
      setFile(null);
      setPreview(null);
    } catch {
      toast.error("Failed to import data");
    } finally {
      setImporting(false);
    }
  }

  function resetState() {
    setFile(null);
    setPreview(null);
    setMode("merge");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetState();
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
                    onClick={() => setMode("merge")}
                    className="flex-1"
                  >
                    Merge
                  </Button>
                  <Button
                    variant={mode === "replace" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setMode("replace")}
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
