import { Outlet, createFileRoute } from "@tanstack/react-router";

import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_landing")({
  component: LandingLayout,
});

function LandingLayout() {
  return (
    <div className="min-h-svh flex flex-col">
      {/* Marketing Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-md bg-primary text-primary-foreground font-bold text-sm">
              bt
            </div>
            <span className="font-semibold tracking-tight">Better Track</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Marketing Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-md bg-muted text-muted-foreground font-bold text-xs">
              bt
            </div>
            <span className="text-sm text-muted-foreground">
              Better Track — Personal budget tracking
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link to="/sign-in" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
