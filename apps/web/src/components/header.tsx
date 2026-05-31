import { Show, UserButton } from "@clerk/react";
import { Link, useRouterState } from "@tanstack/react-router";

import { ExportImportButton } from "./ExportImportButton";
import { HeaderShareButton } from "./HeaderShareButton";
import { ModeToggle } from "./mode-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

export default function Header() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-12">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary text-primary-foreground font-bold text-xs select-none">
            bt
          </div>
          <span className="font-semibold text-sm tracking-tight hidden sm:block">Better Track</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "relative text-xs px-3 py-1.5 rounded-md transition-colors",
                  isActive
                    ? "text-foreground font-medium bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <HeaderShareButton />
          <ExportImportButton />
          <ModeToggle />
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
