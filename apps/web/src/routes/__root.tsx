import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/react";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import "../index.css";

const VITE_CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

if (!VITE_CONVEX_URL) {
  throw new Error("VITE_CONVEX_URL is not defined");
}

const convex = new ConvexReactClient(VITE_CONVEX_URL);

interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "Better Track",
      },
      {
        name: "description",
        content: "Personal budget tracking with the 50/30/20 rule",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="min-h-svh">
          <Outlet />
        </div>
        <Toaster richColors />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
    </ConvexProviderWithClerk>
  );
}
