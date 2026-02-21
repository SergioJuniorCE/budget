import { api } from "@budget/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { createContext, useContext, type ReactNode } from "react";

import type { UserData } from "@/components/budget/types";

interface DashboardDataContextValue {
  data: UserData | undefined;
  isLoading: boolean;
}

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null);

interface DashboardDataProviderProps {
  children: ReactNode;
}

export function DashboardDataProvider({ children }: DashboardDataProviderProps) {
  const rawData = useQuery(api.budget.getData, {});

  const value: DashboardDataContextValue = {
    data: rawData,
    isLoading: rawData === undefined,
  };

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error("useDashboardData must be used within a DashboardDataProvider");
  }
  return context;
}

export function useDashboardDataOptional() {
  const context = useContext(DashboardDataContext);
  const rawData = useQuery(api.budget.getData, context ? "skip" : {});

  if (context) {
    return context;
  }

  return {
    data: rawData,
    isLoading: rawData === undefined,
  };
}
