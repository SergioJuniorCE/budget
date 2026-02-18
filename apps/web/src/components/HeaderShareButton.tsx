import { api } from "@budget/backend/convex/_generated/api";
import { Authenticated, useQuery } from "convex/react";
import { useRouterState } from "@tanstack/react-router";
import { ShareModal } from "./budget/ShareModal";
import type { UserData } from "./budget/types";

function ShareButtonInner() {
  const routerState = useRouterState();
  const isDashboard = routerState.location.pathname === "/dashboard";
  const rawData = useQuery(api.budget.getData, isDashboard ? {} : "skip");

  if (!isDashboard || !rawData) return null;

  const data: UserData = rawData;
  return <ShareModal data={data} />;
}

export function HeaderShareButton() {
  return (
    <Authenticated>
      <ShareButtonInner />
    </Authenticated>
  );
}
