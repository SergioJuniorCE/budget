import { Authenticated } from "convex/react";
import { useRouterState } from "@tanstack/react-router";
import { ShareModal } from "./budget/ShareModal";
import { useDashboardDataOptional } from "@/contexts/DashboardDataContext";

function ShareButtonInner() {
  const routerState = useRouterState();
  const isDashboard = routerState.location.pathname === "/dashboard";
  const { data } = useDashboardDataOptional();

  if (!isDashboard || !data) return null;

  return <ShareModal data={data} />;
}

export function HeaderShareButton() {
  return (
    <Authenticated>
      <ShareButtonInner />
    </Authenticated>
  );
}
