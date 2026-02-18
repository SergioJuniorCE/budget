import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MONTH_NAMES } from "./types";

interface MonthNavigatorProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthNavigator({ year, month, onPrev, onNext }: MonthNavigatorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon-sm" onClick={onPrev} aria-label="Previous month">
        <ChevronLeftIcon />
      </Button>
      <span className="min-w-[9rem] text-center text-sm font-medium tabular-nums">
        {MONTH_NAMES[month - 1]} {year}
      </span>
      <Button variant="ghost" size="icon-sm" onClick={onNext} aria-label="Next month">
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
