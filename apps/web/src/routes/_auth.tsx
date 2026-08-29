import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@clerk/react";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show nothing while auth state loads to prevent flash
  if (!isLoaded) {
    return null;
  }

  // Redirect to dashboard if already signed in
  if (isSignedIn) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-muted/30 px-4">
      {/* Simple logo mark */}
      <div className="mb-8">
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
          bt
        </div>
      </div>

      {/* Auth content */}
      <div className="w-full max-w-sm">
        <Outlet />
      </div>

      {/* Subtle footer */}
      <div className="mt-8 text-xs text-muted-foreground">
        Better Track - 50/30/20 budget tracking
      </div>
    </div>
  );
}
