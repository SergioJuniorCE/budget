import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@clerk/react";

import Header from "@/components/header";

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Redirect to sign-in if not authenticated
  if (isLoaded && !isSignedIn) {
    return <Navigate to="/sign-in" search={{ redirect: "/dashboard" }} />;
  }

  return (
    <div className="min-h-svh flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
