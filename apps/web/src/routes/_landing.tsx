import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_landing")({
  component: LandingLayout,
});

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-[11px] font-black tracking-[-0.08em] text-primary-foreground shadow-sm">
        bt
      </span>
      {!compact && <span className="font-semibold tracking-[-0.02em]">Better Track</span>}
    </span>
  );
}

function LandingLayout() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            aria-label="Better Track home"
            className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Wordmark />
          </Link>
          <nav className="flex items-center gap-2" aria-label="Primary navigation">
            <ModeToggle />
            <Link
              to="/sign-in"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "hidden sm:inline-flex",
              )}
            >
              Sign in
            </Link>
            <Link to="/dashboard" className={buttonVariants({ size: "lg" })}>
              Start budgeting
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-border/70 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            aria-label="Better Track home"
            className="w-fit rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Wordmark />
          </Link>
          <p className="max-w-md text-sm text-muted-foreground">
            A clear monthly budget built around both quincenas and the 50/30/20 rule.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/sign-in"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              to="/dashboard"
              className="font-medium text-primary transition-opacity hover:opacity-75"
            >
              Start budgeting
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
