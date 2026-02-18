import { useRef, useState } from "react";
import { toPng, toBlob } from "html-to-image";
import { Share2, Download, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BudgetSnapshot } from "./BudgetSnapshot";
import type { UserData } from "./types";

interface ShareModalProps {
  data: UserData;
}

export function ShareModal({ data }: ShareModalProps) {
  const snapshotRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const now = new Date();
  const month = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const filename = `budget-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}.png`;

  async function handleDownload() {
    if (!snapshotRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(snapshotRef.current, { pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      a.click();
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopy() {
    if (!snapshotRef.current) return;
    setCopying(true);
    try {
      const blob = await toBlob(snapshotRef.current, { pixelRatio: 2 });
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setCopying(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Share2 className="size-3.5" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Share Budget Summary</DialogTitle>
        </DialogHeader>

        {/* Snapshot preview */}
        <div className="flex justify-center overflow-auto py-2">
          <div className="rounded-xl border shadow-sm overflow-hidden">
            <BudgetSnapshot ref={snapshotRef} data={data} month={month} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={copying || downloading}
            className="gap-1.5"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                {copying ? "Copying…" : "Copy Image"}
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={downloading || copying}
            className="gap-1.5"
          >
            <Download className="size-3.5" />
            {downloading ? "Saving…" : "Download PNG"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
