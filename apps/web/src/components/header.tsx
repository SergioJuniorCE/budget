import { Show, UserButton } from "@clerk/react";
import { Link, useRouterState } from "@tanstack/react-router";
import { House, LayoutDashboard } from "lucide-react";

import { ExportImportButton } from "./ExportImportButton";
import { HeaderShareButton } from "./HeaderShareButton";
import { ModeToggle } from "./mode-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: House },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
] as const;

export default function Header() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-3 px-3 sm:px-5">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="grid size-8 place-items-center rounded-lg bg-primary text-[11px] font-black tracking-[-0.08em] text-primary-foreground shadow-sm select-none">
            bt
          </div>
          <span className="hidden text-sm font-semibold tracking-[-0.02em] lg:block">
            Better Track
          </span>
        </Link>

        <nav
          className="flex items-center gap-0.5 rounded-lg border border-border/70 bg-muted/45 p-0.5"
          aria-label="App navigation"
        >
          {NAV_LINKS.map(({ to, label, icon: Icon }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "relative flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs transition-colors",
                  to === "/" && "hidden sm:flex",
                  isActive
                    ? "bg-background font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
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
